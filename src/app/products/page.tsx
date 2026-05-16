
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
import { Search, SlidersHorizontal, Loader2, Sparkles, X } from 'lucide-react';
import { smartProductSearch } from '@/ai/flows/smart-product-search-flow';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const handleSmartSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const result = await smartProductSearch({ query: searchQuery });
      if (result.category) {
        const cat = CATEGORIES.find(c => 
          c.id.toLowerCase() === result.category?.toLowerCase() || 
          c.name.toLowerCase() === result.category?.toLowerCase()
        );
        if (cat) setSelectedCategory(cat.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = MOCK_PRODUCTS.filter((p: any) => {
    if (p.status !== 'active') return false;
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
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                placeholder="Recherche intelligente (Ex: 'cherche un iPhone d'occasion')" 
                className="h-14 pl-12 pr-32 text-lg rounded-2xl shadow-sm border-border/60 focus:ring-primary"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {searchQuery && (
                   <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="h-10 w-10">
                     <X className="h-4 w-4" />
                   </Button>
                )}
                <Button 
                  onClick={handleSmartSearch}
                  disabled={isSearching}
                  className="h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Analyser</>}
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

      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 bg-muted p-3 md:p-4 rounded-xl border border-border/50">
            <h1 className="text-lg md:text-xl font-normal tracking-wide uppercase">
              {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Tous les articles'}
              <span className="ml-2 text-muted-foreground font-medium normal-case text-base">
                ({filteredProducts.length})
              </span>
            </h1>
            
            <Button variant="ghost" className="font-bold flex items-center gap-2 text-primary">
              <SlidersHorizontal className="h-5 w-5" /> <span className="hidden sm:inline">Trier</span>
            </Button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((p: any) => (
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
              <p className="text-xl font-bold text-muted-foreground">Aucun article disponible pour le moment.</p>
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
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
