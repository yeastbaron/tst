"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Store, MapPin, Phone, Sparkles, AlertCircle } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

interface ShopProfile {
  uid: string;
  name: string;
  type: string;
  isBanned: boolean;
  address?: string;
  phone?: string;
  proExpiresAt?: string | null;
  isSuperSeller?: boolean;
  superSellerExpiresAt?: string | null;
  shopName?: string;
  shopLogo?: string;
  shopCover?: string;
  shopDescription?: string;
  shopSlug?: string;
}

export default function ShopsDirectoryPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  // Requête Firebase pour charger les profils professionnels
  const shopsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'),
      where('type', '==', 'professionnel')
    );
  }, [db]);

  const { data: rawShops, loading } = useCollection(shopsQuery);

  // Filtrer les boutiques actives, non bannies et non expirées
  const activeShops = (rawShops as ShopProfile[] || []).filter((shop) => {
    // Vérifier le bannissement
    if (shop.isBanned) return false;
    
    // Vérifier l'expiration de l'abonnement pro
    if (shop.proExpiresAt) {
      const expirationDate = new Date(shop.proExpiresAt);
      if (expirationDate < new Date()) {
        return false; // Expired
      }
    }
    
    // Filtrer par recherche (nom du shop, nom de l'utilisateur ou description)
    const queryStr = searchTerm.toLowerCase().trim();
    if (queryStr) {
      const shopDisplayName = shop.shopName || shop.name || '';
      const description = shop.shopDescription || '';
      const address = shop.address || '';
      
      return (
        shopDisplayName.toLowerCase().includes(queryStr) ||
        description.toLowerCase().includes(queryStr) ||
        address.toLowerCase().includes(queryStr)
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-muted/10 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,91,255,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,184,0,0.05),transparent_40%)]" />
          <div className="container mx-auto px-4 text-center relative z-10 space-y-6 max-w-3xl">
            <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest animate-pulse border-none">
              ✨ Boutiques Officielles
            </Badge>

            {/* Search Box */}
            <div className="relative max-w-md mx-auto group pt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300 group-focus-within:text-white transition-colors" />
              <Input
                type="text"
                id="shop-search-input"
                placeholder="Rechercher une boutique, une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-12 pr-4 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-slate-400 rounded-2xl shadow-xl border-white/10 focus:border-indigo-400 focus:ring-indigo-400 transition-all text-base"
              />
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground">Chargement des boutiques...</p>
            </div>
          ) : activeShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeShops.map((shop) => {
                const isSuperActive = shop.isSuperSeller && (
                  !shop.superSellerExpiresAt || 
                  new Date(shop.superSellerExpiresAt) > new Date()
                );

                const finalShopName = shop.shopName || shop.name || "Boutique Officielle";
                const initials = finalShopName.substring(0, 2).toUpperCase();

                return (
                  <Card 
                    key={shop.uid}
                    className="overflow-hidden border border-border/50 bg-white hover:shadow-xl transition-all duration-300 group flex flex-col h-full rounded-[2rem] relative"
                  >
                    {/* Super Seller badge floating */}
                    {isSuperActive && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                        ✨ Super-Vendeur
                      </div>
                    )}

                    {/* Cover Photo */}
                    <div className="h-32 w-full relative bg-gradient-to-r from-slate-800 to-indigo-950 overflow-hidden">
                      {shop.shopCover ? (
                        <Image 
                          src={shop.shopCover} 
                          alt="" 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(46,91,255,0.2),transparent)]" />
                      )}
                    </div>

                    {/* Logo Wrapper */}
                    <div className="px-6 -mt-10 relative z-10 flex justify-between items-end">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-lg rounded-2xl bg-white overflow-hidden">
                        {shop.shopLogo ? (
                          <AvatarImage src={shop.shopLogo} alt={finalShopName} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-white font-black text-xl rounded-none">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="pb-1">
                        <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 font-bold border border-indigo-100 uppercase text-[9px] rounded-lg px-2">
                          Vendeur PRO
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-black text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                          {finalShopName}
                        </h2>
                        
                        <p className="text-muted-foreground text-xs font-medium line-clamp-2 min-h-[2rem]">
                          {shop.shopDescription || "Aucune description fournie pour le moment. Découvrez tous les articles de ce vendeur professionnel en visitant sa boutique."}
                        </p>
                      </div>

                      {/* Meta stats / Info */}
                      <div className="space-y-2 pt-2 border-t text-xs font-medium text-muted-foreground">
                        {shop.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{shop.address}</span>
                          </div>
                        )}
                        {shop.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Button 
                        asChild 
                        className="w-full h-11 font-black uppercase rounded-xl bg-slate-900 text-white hover:bg-primary transition-all duration-300 text-xs shadow-sm mt-4 group-hover:scale-[1.01]"
                      >
                        <Link href={`/shops/${shop.shopSlug || shop.uid}`}>
                          <Store className="h-4 w-4 mr-2" /> Visiter la boutique
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-8 max-w-xl mx-auto gap-4 shadow-sm">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-30" />
              <p className="text-xl font-bold text-muted-foreground">Aucune boutique professionnelle trouvée.</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Aucun vendeur professionnel n'est inscrit ou ne correspond à vos critères de recherche actuellement.
              </p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  className="text-primary font-bold" 
                  onClick={() => setSearchTerm('')}
                >
                  Réinitialiser la recherche
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
