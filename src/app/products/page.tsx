
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES, MOCK_PRODUCTS } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="flex-1 bg-muted/10 pb-20">
      <section className="bg-white border-b py-4 md:py-8 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..." 
                className="h-14 pl-12 pr-32 text-lg rounded-2xl shadow-sm border-border/60 focus:ring-primary"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {searchQuery && (
                   <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="h-10 w-10">
                     <X className="h-4 w-4" />
                   </Button>
                )}
                <Button className="h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl">
                  <Sparkles className="h-4 w-4 mr-2" /> Rechercher
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full font-bold px-5"
              >
                Tout
              </Button>
              {CATEGORIES.map(cat => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full font-bold px-5 whitespace-nowrap"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        <AdBanner className="mb-8" />
      </div>

      <section>
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">
              {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Tous les articles'}
              <span className="ml-2 font-body font-medium normal-case text-xs text-muted-foreground opacity-60">
                ({filteredProducts.length})
              </span>
            </h1>
            
            <Button variant="ghost" size="sm" className="font-bebas text-[14px] tracking-widest flex items-center gap-2 text-primary p-0 h-auto">
              <SlidersHorizontal className="h-4 w-4" /> <span className="hidden sm:inline">Trier</span>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((p) => (
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
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30">
              <p className="text-xl font-bold text-muted-foreground">Aucun article trouvé.</p>
              <Button variant="link" className="text-primary font-bold mt-2" onClick={() => {setSearchQuery(''); setSelectedCategory(null);}}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={null}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
