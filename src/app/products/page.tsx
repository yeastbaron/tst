"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AdBanner } from '@/components/ads/AdBanner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Loader2, Grid2X2, Grid3X3, Sparkles } from 'lucide-react';
import { smartProductSearch } from '@/ai/flows/smart-product-search-flow';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState(2);

  const allProducts = [
    { id: '1', title: 'iPhone 13 Pro 256GB', basePrice: 350000, image: PlaceHolderImages[0].imageUrl, condition: 'used' as const, category: 'electronics' },
    { id: '2', title: 'MacBook Air M2 2023', basePrice: 750000, image: PlaceHolderImages[0].imageUrl, condition: 'new' as const, category: 'electronics' },
    { id: '3', title: 'Nike Air Max Jordan', basePrice: 45000, image: PlaceHolderImages[1].imageUrl, condition: 'new' as const, category: 'fashion' },
    { id: '4', title: 'Canapé 3 places Cuir', basePrice: 200000, image: PlaceHolderImages[2].imageUrl, condition: 'used' as const, category: 'home' },
    { id: '5', title: 'Mercedes-Benz C200', basePrice: 8500000, image: PlaceHolderImages[3].imageUrl, condition: 'used' as const, category: 'vehicles' },
    { id: '6', title: 'Réfrigérateur Samsung', basePrice: 280000, image: PlaceHolderImages[4].imageUrl, condition: 'new' as const, category: 'home' },
    { id: '7', title: 'Rolex Submariner', basePrice: 6500000, image: PlaceHolderImages[5].imageUrl, condition: 'used' as const, category: 'fashion' },
    { id: '8', title: 'PS5 Digital Edition', basePrice: 380000, image: PlaceHolderImages[0].imageUrl, condition: 'new' as const, category: 'sports' },
  ];

  const handleSmartSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const result = await smartProductSearch({ query: searchQuery });
      if (result.category) setSelectedCategory(result.category.toLowerCase());
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = allProducts.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-muted/10 pb-20">
        {/* Search Header */}
        <section className="bg-white border-b py-8 sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                  placeholder="Recherche intelligente (Ex: 'cherche un iPhone d'occasion pas cher')" 
                  className="h-14 pl-12 pr-32 text-lg rounded-2xl shadow-sm border-border/60 focus:ring-primary"
                />
                <Button 
                  onClick={handleSmartSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Analyser</>}
                </Button>
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

        {/* Ad Banner on Shop Page */}
        <div className="container mx-auto px-4 mt-8">
          <AdBanner className="mb-8" />
        </div>

        {/* Product Grid */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Tous les articles'}
                <span className="ml-2 text-muted-foreground font-medium normal-case text-lg">({filteredProducts.length})</span>
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white border rounded-lg p-1 lg:hidden">
                  <Button 
                    variant={gridCols === 2 ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setGridCols(2)}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={gridCols === 3 ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setGridCols(3)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" className="font-bold flex items-center gap-2 text-primary">
                  <SlidersHorizontal className="h-5 w-5" /> <span className="hidden sm:inline">Filtrer & Trier</span>
                </Button>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className={cn(
                "grid gap-4 md:gap-6",
                gridCols === 2 ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-3 sm:grid-cols-3",
                "lg:grid-cols-4 xl:grid-cols-5"
              )}>
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={{ ...p, category: CATEGORIES.find(c => c.id === p.category)?.name || p.category }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30">
                <p className="text-xl font-bold text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
                <Button variant="link" className="text-primary font-bold mt-2" onClick={() => {setSearchQuery(''); setSelectedCategory(null);}}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}