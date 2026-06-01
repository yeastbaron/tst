"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store, MapPin, Phone, MessageCircle, Sparkles, Loader2, 
  ArrowLeft, Search, PackageOpen, AlertTriangle, ShieldCheck, Mail, Info
} from 'lucide-react';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

interface ShopProfile {
  uid: string;
  name: string;
  email: string;
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

export default function ShopClient() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, profile: currentUserProfile, loading: authLoading } = useUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  // 1. Essayer de trouver le vendeur par son shopSlug
  const slugQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'users'),
      where('shopSlug', '==', id as string)
    );
  }, [db, id]);

  const { data: slugResults, loading: slugLoading } = useCollection(slugQuery);

  // 2. Si non trouvé par slug, essayer de charger directement par UID (Fallback)
  const hasSlugResult = slugResults && slugResults.length > 0;
  const directDocRef = useMemoFirebase(() => {
    if (!db || !id || hasSlugResult) return null;
    return doc(db, 'users', id as string);
  }, [db, id, hasSlugResult]);

  const { data: directShop, loading: directLoading } = useDoc(directDocRef) as { data: ShopProfile | null, loading: boolean };

  // Boutique résolue
  const shop = hasSlugResult ? (slugResults[0] as ShopProfile) : directShop;
  const resolvedSellerId = shop?.uid || id as string;
  
  // Si l'URL actuelle utilise le UID mais que la boutique a un slug, on redirige vers le slug amical
  useEffect(() => {
    if (shop && shop.shopSlug && id !== shop.shopSlug) {
      router.replace(`/shops/${shop.shopSlug}`);
    }
  }, [shop, id, router]);

  // 3. Charger les produits de ce vendeur résolu
  const productsQuery = useMemoFirebase(() => {
    if (!db || !resolvedSellerId || (slugLoading && !hasSlugResult)) return null;
    return query(
      collection(db, 'products'),
      where('sellerId', '==', resolvedSellerId),
      where('status', '==', 'active')
    );
  }, [db, resolvedSellerId, slugLoading, hasSlugResult]);

  const { data: rawProducts, loading: productsLoading } = useCollection(productsQuery);

  const loading = authLoading || slugLoading || (directDocRef ? directLoading : false) || productsLoading;

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-white gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">Chargement de la boutique...</p>
      </div>
    );
  }

  // Vérifier si la boutique existe, est PRO et active (non expirée) et non bannie
  const isProActive = shop && 
    shop.type === 'professionnel' && 
    !shop.isBanned &&
    (!shop.proExpiresAt || new Date(shop.proExpiresAt) > new Date());

  if (!shop || !isProActive) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
          <Card className="max-w-md w-full border border-red-200/50 bg-red-50/10 shadow-lg rounded-[2rem] overflow-hidden text-center p-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 flex items-center justify-center rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-red-600 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase text-red-800 tracking-tight">
                Boutique provisoirement fermée
              </h1>
              <p className="text-sm text-red-600/90 font-medium">
                Cette boutique n'est plus accessible car l'abonnement professionnel du vendeur a expiré ou le profil est repassé en compte particulier.
              </p>
            </div>

            <Button asChild className="w-full h-12 bg-slate-900 text-white hover:bg-primary font-black uppercase rounded-xl">
              <Link href="/shops">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voir les boutiques actives
              </Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const finalShopName = shop.shopName || shop.name || "Boutique Officielle";
  const initials = finalShopName.substring(0, 2).toUpperCase();

  const isSuperActive = shop.isSuperSeller && (
    !shop.superSellerExpiresAt || 
    new Date(shop.superSellerExpiresAt) > new Date()
  );

  const getMaskedPhone = (phoneStr: string) => {
    if (!phoneStr) return "---";
    const cleaned = phoneStr.trim();
    if (cleaned.length <= 6) return cleaned + " •• ••";
    const prefix = cleaned.slice(0, cleaned.length - 4);
    return prefix + " •• ••";
  };

  const handleRevealPhone = () => {
    setShowFullPhone(true);
  };

  const isCurrentUserBanned = currentUserProfile?.isBanned === true;

  // Filtrer et trier les produits du vendeur (du plus récent au plus ancien par défaut)
  const filteredProducts = (rawProducts || [])
    .filter((p) => {
      const matchesSearch = searchTerm ? p.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) : true;
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-muted/10 pb-20">
        {/* Cover Image Banner */}
        <section className="relative h-64 md:h-80 w-full bg-gradient-to-r from-slate-950 to-indigo-950 overflow-hidden">
          {shop.shopCover ? (
            <Image 
              src={shop.shopCover} 
              alt={finalShopName} 
              fill 
              className="object-cover opacity-85" 
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(46,91,255,0.25),transparent)] opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          <div className="absolute bottom-6 left-4 md:left-8 z-20 flex flex-col md:flex-row items-start md:items-end gap-6 w-full max-w-7xl">
            {/* Logo Overlap */}
            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-xl rounded-[2rem] bg-white overflow-hidden flex-shrink-0">
              {shop.shopLogo ? (
                <AvatarImage src={shop.shopLogo} alt={finalShopName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-white font-black text-3xl rounded-none">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 text-white flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-500 text-slate-950 font-black uppercase text-[9px] rounded-lg tracking-wider border-none">
                  Vendeur PRO
                </Badge>
                {isSuperActive && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-black uppercase text-[9px] rounded-lg tracking-wider border-none animate-pulse">
                    ✨ Super-Vendeur
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-headline drop-shadow-md">
                  {finalShopName}
                </h1>
                <div className="lg:hidden block">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-full h-10 w-10 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 animate-pulse hover:animate-none transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Info className="h-5 w-5 text-white" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-6 bg-white overflow-y-auto max-h-[90vh]">
                      <DialogHeader className="flex flex-row items-center gap-3 border-b pb-4">
                        <Avatar className="h-12 w-12 border rounded-xl overflow-hidden bg-white flex-shrink-0">
                          {shop.shopLogo ? (
                            <AvatarImage src={shop.shopLogo} alt={finalShopName} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-primary text-white font-black text-lg rounded-none">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <DialogTitle className="font-headline font-black uppercase text-slate-800 text-lg tracking-tight">
                            {finalShopName}
                          </DialogTitle>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Vendeur Professionnel</p>
                        </div>
                      </DialogHeader>

                      <div className="space-y-6 pt-4">
                        {/* À propos de nous */}
                        <div className="text-left">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1 mb-2">
                            À propos de nous
                          </h4>
                          <p className="text-muted-foreground text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {shop.shopDescription || "Ce vendeur professionnel n'a pas encore rédigé de description pour sa boutique."}
                          </p>
                        </div>

                        {/* Contacts & Infos */}
                        <div className="text-left">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">
                            Contacts & Infos
                          </h4>
                          <div className="space-y-3 text-sm font-medium text-muted-foreground">
                            {shop.address && (
                              <div className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Localisation</p>
                                  <p className="text-foreground">{shop.address}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-start gap-2.5">
                              <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">E-mail</p>
                                <p className="text-foreground truncate max-w-[240px]">{shop.email}</p>
                              </div>
                            </div>

                            {shop.phone && (
                              <div className="flex items-start gap-2.5">
                                <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <div className="w-full">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Téléphone</p>
                                  {isCurrentUserBanned ? (
                                    <p className="text-red-500 text-xs font-bold mt-0.5">Contacts masqués (compte banni)</p>
                                  ) : showFullPhone ? (
                                    <p className="text-foreground font-bold text-base select-all">{shop.phone}</p>
                                  ) : (
                                    <button 
                                      onClick={handleRevealPhone}
                                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-0.5 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded border border-primary/20 border-dashed"
                                    >
                                      <span>{getMaskedPhone(shop.phone)}</span>
                                      <span className="text-[8px] font-black uppercase animate-pulse">Afficher</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!isCurrentUserBanned && shop.phone && (
                          <div className="flex flex-col gap-2 pt-2">
                            {showFullPhone ? (
                              <>
                                <Button asChild className="w-full h-11 font-black uppercase rounded-xl bg-primary text-white hover:bg-primary/95 text-xs">
                                  <a href={`tel:${shop.phone}`}>📞 Appeler le vendeur</a>
                                </Button>
                                <Button asChild className="w-full h-11 font-black uppercase rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs">
                                  <a 
                                    href={`https://wa.me/${shop.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, j'ai visité votre boutique "${finalShopName}" sur SalleDeVente.sn et j'aimerais avoir plus de renseignements sur vos articles.`)}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Direct
                                  </a>
                                </Button>
                              </>
                            ) : (
                              <Button 
                                onClick={handleRevealPhone}
                                className="w-full h-11 font-black uppercase rounded-xl bg-slate-900 text-white hover:bg-primary text-xs"
                              >
                                🔓 Afficher les contacts
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Partager */}
                        <div className="pt-4 border-t text-left space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Partager la boutique
                          </h4>
                          <Button 
                            asChild 
                            className="w-full h-11 font-black uppercase rounded-xl bg-[#25D366] hover:bg-[#20BA56] text-white text-xs"
                          >
                            <a 
                              href={shareUrl ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvrez la boutique "${finalShopName}" sur SalleDeVente.sn ! Retrouvez tous ses articles ici : ${shareUrl}`)}` : '#'}
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" /> Partager sur WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shop Info details & Products grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6 lg:block hidden">
              <Card className="border border-border/50 bg-white rounded-[2rem] overflow-hidden shadow-sm p-6 space-y-6">
                {/* À propos de nous - Desktop */}
                <div className="lg:block hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
                    À propos de nous
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed pt-3 whitespace-pre-wrap">
                    {shop.shopDescription || "Ce vendeur professionnel n'a pas encore rédigé de description pour sa boutique. Découvrez tous ses articles de haute qualité répertoriés ci-dessous."}
                  </p>
                </div>

                {/* À propos de nous - Mobile & Tablet */}
                <div className="lg:hidden block border-b pb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    À propos de nous
                  </h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-11 font-black uppercase text-xs rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary">
                        ✨ Afficher la présentation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2rem] p-6">
                      <DialogHeader>
                        <DialogTitle className="font-headline font-black uppercase text-slate-800 tracking-tight">
                          À propos de nous
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                        {shop.shopDescription || "Ce vendeur professionnel n'a pas encore rédigé de description pour sa boutique. Découvrez tous ses articles de haute qualité répertoriés ci-dessous."}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
                    Contacts & Infos
                  </h3>

                  <div className="space-y-3 text-sm font-medium text-muted-foreground pt-1">
                    {shop.address && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Localisation</p>
                          <p className="text-foreground">{shop.address}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2.5">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">E-mail</p>
                        <p className="text-foreground truncate max-w-[180px]">{shop.email}</p>
                      </div>
                    </div>

                    {shop.phone && (
                      <div className="flex items-start gap-2.5">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="w-full">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Téléphone</p>
                          {isCurrentUserBanned ? (
                            <p className="text-red-500 text-xs font-bold mt-0.5">Contacts masqués (compte banni)</p>
                          ) : showFullPhone ? (
                            <p className="text-foreground font-bold text-base select-all">{shop.phone}</p>
                          ) : (
                            <button 
                              onClick={handleRevealPhone}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-0.5 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded border border-primary/20 border-dashed"
                            >
                              <span>{getMaskedPhone(shop.phone)}</span>
                              <span className="text-[8px] font-black uppercase animate-pulse">Afficher</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Contact Actions */}
                {!isCurrentUserBanned && shop.phone && (
                  <div className="flex flex-col gap-3 pt-2">
                    {showFullPhone ? (
                      <>
                        <Button asChild className="w-full h-12 font-black uppercase rounded-xl bg-primary text-white hover:bg-primary/95 text-xs shadow-sm">
                          <a href={`tel:${shop.phone}`}>📞 Appeler le vendeur</a>
                        </Button>
                        <Button asChild className="w-full h-12 font-black uppercase rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs shadow-sm">
                          <a 
                            href={`https://wa.me/${shop.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, j'ai visité votre boutique "${finalShopName}" sur SalleDeVente.sn et j'aimerais avoir plus de renseignements sur vos articles.`)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Direct
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleRevealPhone}
                        className="w-full h-12 font-black uppercase rounded-xl bg-slate-900 text-white hover:bg-primary text-xs shadow-sm"
                      >
                        🔓 Afficher les contacts
                      </Button>
                    )}
                  </div>
                )}

                {/* Share Action */}
                <div className="pt-4 border-t border-border/50 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Partager la boutique
                  </h3>
                  <Button 
                    asChild 
                    className="w-full h-12 font-black uppercase rounded-xl bg-[#25D366] hover:bg-[#20BA56] text-white text-xs shadow-sm"
                  >
                    <a 
                      href={shareUrl ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvrez la boutique "${finalShopName}" sur SalleDeVente.sn ! Retrouvez tous ses articles ici : ${shareUrl}`)}` : '#'}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Partager sur WhatsApp
                    </a>
                  </Button>
                </div>
              </Card>

              {/* Back to shops - Desktop only in sidebar */}
              <Button asChild variant="ghost" className="w-full font-black uppercase text-xs rounded-xl border lg:flex hidden">
                <Link href="/shops">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Toutes les boutiques
                </Link>
              </Button>
            </div>

            {/* Products container */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search & Category Filter bar */}
              <Card className="border border-border/50 bg-white rounded-[2rem] p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Rechercher dans cette boutique..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-11 rounded-xl shadow-sm text-sm"
                    />
                  </div>

                  {/* Category Filter list - Desktop only */}
                  <div className="hidden md:flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
                    <Button 
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="rounded-full font-bold px-4 text-xs"
                    >
                      Tout ({rawProducts?.length || 0})
                    </Button>
                    {CATEGORIES.map((cat) => {
                      const count = (rawProducts || []).filter(p => p.category === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <Button 
                           key={cat.id}
                           variant={selectedCategory === cat.id ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setSelectedCategory(cat.id)}
                           className="rounded-full font-bold px-4 text-xs whitespace-nowrap"
                        >
                          {cat.name} ({count})
                        </Button>
                      );
                    })}
                  </div>

                  {/* Category Filter - Mobile & Tablet only */}
                  <div className="md:hidden w-full flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-400 whitespace-nowrap">Catégorie :</span>
                    <Select 
                      value={selectedCategory || "all"} 
                      onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}
                    >
                      <SelectTrigger className="h-11 rounded-xl font-bold border-muted/50 w-full text-xs">
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs font-bold">
                          Tout ({rawProducts?.length || 0})
                        </SelectItem>
                        {CATEGORIES.map((cat) => {
                          const count = (rawProducts || []).filter(p => p.category === cat.id).length;
                          if (count === 0) return null;
                          return (
                            <SelectItem key={cat.id} value={cat.id} className="text-xs font-medium">
                              {cat.name} ({count})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Products List Grid */}
              <div>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((p) => (
                      <ProductCard key={p.id} product={{
                        id: p.id,
                        title: p.title,
                        basePrice: p.basePrice,
                        image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                        condition: p.condition as any,
                        category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                        subcategory: p.subcategory,
                        isPro: true, // We are inside a pro shop, so they are all pro products
                        isSuperSeller: isSuperActive,
                        sellerIsSuper: isSuperActive
                      }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-8 gap-4 shadow-sm">
                    <PackageOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                    <p className="text-lg font-bold text-muted-foreground">Aucun article trouvé.</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {searchTerm || selectedCategory 
                        ? "Essayez de modifier vos filtres ou de réinitialiser la recherche." 
                        : "Cette boutique n'a pas encore d'articles actifs en vente pour le moment."}
                    </p>
                    {(searchTerm || selectedCategory) && (
                      <Button 
                        variant="link" 
                        className="text-primary font-bold text-xs" 
                        onClick={() => {setSearchTerm(''); setSelectedCategory(null);}}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Back to shops - Mobile & Tablet return button (also nice on desktop) */}
              <div className="flex justify-center pt-8">
                <Button asChild variant="outline" className="w-full sm:w-auto font-black uppercase text-xs rounded-xl border px-8 h-12 shadow-sm bg-white hover:bg-muted/50 transition-colors">
                  <Link href="/shops" className="flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Toutes les boutiques
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
