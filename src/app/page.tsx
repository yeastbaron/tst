
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES, calculatePriceWithCommission } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const db = useFirestore();

  // Produits à la une : les plus récents validés
  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
  }, [db]);

  // Nouveautés : les 8 derniers articles actifs
  const recentQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
  }, [db]);

  const { data: featuredProducts, loading: featuredLoading } = useCollection(featuredQuery);
  const { data: recentProducts, loading: recentLoading } = useCollection(recentQuery);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6">
          <AdBanner />
        </div>

        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 bg-muted/60 p-3 md:p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary fill-secondary" />
                <h2 className="text-lg md:text-xl font-normal tracking-wide uppercase">Articles à la Une</h2>
              </div>
            </div>

            {featuredLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {featuredProducts.map((p: any) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                Aucun article à la une pour le moment.
              </div>
            )}
          </div>
        </section>

        <section className="py-8 border-t bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 bg-muted p-3 md:p-4 rounded-xl border border-border/50">
              <h2 className="text-lg md:text-xl font-normal tracking-wide uppercase">Catégories</h2>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.id}`} className="group flex flex-col">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-border/50 hover:border-primary/30 transition-all">
                    <Image 
                      src={cat.image || 'https://picsum.photos/seed/placeholder/400/400'} 
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 33vw, 15vw"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                       <span className="text-white text-[10px] sm:text-xs font-black uppercase text-center leading-tight drop-shadow-md">
                         {cat.name}
                       </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 bg-muted p-3 md:p-4 rounded-xl border border-border/50">
              <h2 className="text-lg md:text-xl font-normal tracking-wide uppercase">Nouveautés</h2>
              <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline text-xs md:text-sm">
                Voir tout <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </div>

            {recentLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : recentProducts && recentProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {recentProducts.map((p: any) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed">
                Soyez le premier à publier une annonce !
              </div>
            )}
          </div>
        </section>

        <section className="py-12 md:py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="bg-secondary p-8 md:p-16 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-secondary-foreground overflow-hidden relative">
              <div className="space-y-4 max-w-xl relative z-10">
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase leading-none text-center md:text-left">
                  Videz votre grenier <br className="hidden md:block" />& Gagnez de l&apos;argent
                </h2>
                <p className="text-sm md:text-lg font-medium opacity-90 text-center md:text-left">
                  Vendez vos articles d&apos;occasion en quelques clics. Nous ajoutons une marge de 10% et nous nous occupons du reste.
                </p>
                <div className="flex justify-center md:justify-start">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold rounded-xl" asChild>
                    <Link href="/sell">Commencer à vendre</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
