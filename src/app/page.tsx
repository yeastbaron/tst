
"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES, MOCK_PRODUCTS } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import Link from 'next/link';
import { Sparkles, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Home() {
  const activeProducts = MOCK_PRODUCTS.filter(p => p.status === 'active');
  
  // États pour les colonnes de grille (Mobile/Tablette)
  const [productCols, setProductCols] = useState(2);
  const [categoryCols, setCategoryCols] = useState(3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6">
          <AdBanner />
        </div>

        {/* Section Produits */}
        <section className="mt-8">
          <div className="w-full bg-muted border-y border-border/50 py-3">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary fill-primary" />
                <h2 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Articles à la Une</h2>
              </div>
              
              {/* Sélecteur de grille produits - visible sur mobile/tablette (< lg) */}
              <div className="flex items-center gap-1 lg:hidden">
                <button 
                  onClick={() => setProductCols(2)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                    productCols === 2 ? "bg-primary text-white" : "bg-white/50 text-muted-foreground hover:bg-white"
                  )}
                >
                  <span className="text-[12px] font-bebas">2</span>
                </button>
                <button 
                  onClick={() => setProductCols(3)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                    productCols === 3 ? "bg-primary text-white" : "bg-white/50 text-muted-foreground hover:bg-white"
                  )}
                >
                  <span className="text-[12px] font-bebas">3</span>
                </button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className={cn(
              "grid gap-3 md:gap-4",
              productCols === 2 ? "grid-cols-2" : "grid-cols-3",
              "md:grid-cols-4 lg:grid-cols-6" // Garder le comportement standard sur desktop
            )}>
              {activeProducts.map((p: any) => (
                <ProductCard key={p.id} product={{
                  id: p.id,
                  title: p.title,
                  basePrice: p.basePrice,
                  image: p.images[0],
                  condition: p.condition as any,
                  category: CATEGORIES.find(c => c.id === p.category)?.name || p.category
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* Section Catégories */}
        <section>
          <div className="w-full bg-muted border-y border-border/50 py-3">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <h2 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Catégories</h2>
              
              {/* Sélecteur de grille catégories - visible sur mobile/tablette (< lg) */}
              <div className="flex items-center gap-1 lg:hidden">
                <button 
                  onClick={() => setCategoryCols(3)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                    categoryCols === 3 ? "bg-primary text-white" : "bg-white/50 text-muted-foreground hover:bg-white"
                  )}
                >
                  <span className="text-[12px] font-bebas">3</span>
                </button>
                <button 
                  onClick={() => setCategoryCols(4)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                    categoryCols === 4 ? "bg-primary text-white" : "bg-white/50 text-muted-foreground hover:bg-white"
                  )}
                >
                  <span className="text-[12px] font-bebas">4</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-8">
            <div className={cn(
              "grid gap-4",
              categoryCols === 3 ? "grid-cols-3" : "grid-cols-4",
              "sm:grid-cols-4 lg:grid-cols-7" // Garder le comportement standard sur desktop
            )}>
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
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                       <span className="text-white text-[14px] font-bebas uppercase tracking-wider drop-shadow-md">
                         {cat.name}
                       </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
