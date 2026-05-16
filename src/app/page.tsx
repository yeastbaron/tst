
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

// Données de démonstration statiques
const MOCK_PRODUCTS = [
  { id: '1', title: 'iPhone 13 Pro Max - 256Go', basePrice: 450000, condition: 'used', category: 'electronics', images: ['https://picsum.photos/seed/iphone/800/800'] },
  { id: '2', title: 'MacBook Air M2 2023', basePrice: 750000, condition: 'new', category: 'electronics', images: ['https://picsum.photos/seed/macbook/800/800'] },
  { id: '3', title: 'Chaussures Jordan Retro 4', basePrice: 85000, condition: 'new', category: 'fashion', images: ['https://picsum.photos/seed/jordan/800/800'] },
  { id: '4', title: 'Canapé Scandinave 3 Places', basePrice: 150000, condition: 'new', category: 'home', images: ['https://picsum.photos/seed/sofa/800/800'] },
  { id: '5', title: 'PlayStation 5 + 2 Manettes', basePrice: 380000, condition: 'used', category: 'sports', images: ['https://picsum.photos/seed/ps5/800/800'] },
  { id: '6', title: 'Montre Rolex Datejust Gold', basePrice: 2500000, condition: 'used', category: 'fashion', images: ['https://picsum.photos/seed/rolex/800/800'] },
];

export default function Home() {
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {MOCK_PRODUCTS.map((p: any) => (
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

import Image from 'next/image';
