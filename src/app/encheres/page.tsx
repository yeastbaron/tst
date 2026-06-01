"use client";

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Gavel, PackageSearch, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function AuctionsPage() {
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');

  // Charger toutes les enchères
  const auctionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('isAuction', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: allAuctions, loading } = useCollection(auctionsQuery);

  const categorizedAuctions = useMemo(() => {
    if (!allAuctions) return { active: [], ended: [] };

    const activeList: typeof allAuctions = [];
    const endedList: typeof allAuctions = [];
    const now = new Date();

    allAuctions.forEach((item: any) => {
      const endAt = item.auctionEndAt && (
        typeof item.auctionEndAt.toDate === 'function'
          ? item.auctionEndAt.toDate()
          : new Date(item.auctionEndAt)
      );

      if (endAt && endAt > now) {
        activeList.push(item);
      } else {
        endedList.push(item);
      }
    });

    return {
      active: activeList,
      ended: endedList
    };
  }, [allAuctions]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/5">
      <Header />
      
      {/* Banner En-tête */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest">
                <Gavel className="h-3.5 w-3.5" /> Espace Enchères
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                Ventes aux <span className="text-indigo-400">Enchères</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base font-medium">
                Participez à des ventes exclusives, fixez votre prix et remportez des offres uniques en direct sur SalleDeVente.sn.
              </p>
            </div>
            
            {/* Guide rapide Responsabilités */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl max-w-sm backdrop-blur-sm space-y-2">
              <h3 className="font-black uppercase text-xs tracking-wider text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" /> Règles de participation
              </h3>
              <ul className="text-[11px] text-slate-300 font-medium space-y-1.5 list-disc pl-4">
                <li>Chaque enchère formulée constitue un <strong>engagement d'achat ferme</strong>.</li>
                <li>Le profil doit être <strong>complet</strong> (Nom, téléphone et adresse) pour pouvoir miser.</li>
                <li>Tout désistement ou non-paiement sous 48h entraîne la <strong>suspension définitive du compte</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <Tabs defaultValue="active" onValueChange={(val) => setActiveTab(val as any)} className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
              <TabsList className="bg-white border p-1 rounded-xl h-12 shadow-sm">
                <TabsTrigger 
                  value="active" 
                  className="rounded-lg font-black uppercase text-xs px-5 h-full data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                >
                  🔥 En cours ({categorizedAuctions.active.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="ended" 
                  className="rounded-lg font-black uppercase text-xs px-5 h-full data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                >
                  ⌛ Terminées ({categorizedAuctions.ended.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                Mise à jour en temps réel
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                <TabsContent value="active" className="mt-0 outline-none">
                  {categorizedAuctions.active.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                      {categorizedAuctions.active.map((p: any) => (
                        <ProductCard key={p.id} product={{
                          id: p.id,
                          title: p.title,
                          basePrice: p.basePrice,
                          image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                          condition: p.condition as any,
                          category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                          subcategory: p.subcategory,
                          isPro: p.isPro,
                          isAuction: true,
                          currentBid: p.currentBid,
                          bidsCount: p.bidsCount,
                          auctionEndAt: p.auctionEndAt
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center gap-4">
                      <PackageSearch className="h-12 w-12 text-muted-foreground opacity-20" />
                      <p className="text-xl font-bold text-muted-foreground">Aucune enchère en cours pour le moment.</p>
                      <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl" asChild>
                        <a href="/sell">Lancer la première enchère</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ended" className="mt-0 outline-none">
                  {categorizedAuctions.ended.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 opacity-75">
                      {categorizedAuctions.ended.map((p: any) => (
                        <ProductCard key={p.id} product={{
                          id: p.id,
                          title: p.title,
                          basePrice: p.basePrice,
                          image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                          condition: p.condition as any,
                          category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                          subcategory: p.subcategory,
                          isPro: p.isPro,
                          isAuction: true,
                          currentBid: p.currentBid,
                          bidsCount: p.bidsCount,
                          auctionEndAt: p.auctionEndAt
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center gap-4">
                      <PackageSearch className="h-12 w-12 text-muted-foreground opacity-20" />
                      <p className="text-xl font-bold text-muted-foreground">Historique d'enchères vide.</p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
