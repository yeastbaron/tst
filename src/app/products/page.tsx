"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X, Loader2, PackageSearch } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSubcategory = searchParams.get('subcategory');
  const initialSearch = searchParams.get('search') || '';
  const db = useFirestore();
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSubcategory);
  const [wholesaleOnlyFilter, setWholesaleOnlyFilter] = useState(false);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    const category = searchParams.get('category');
    setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const subcategory = searchParams.get('subcategory');
    setSelectedSubcategory(subcategory);
  }, [searchParams]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    if (selectedCategory) {
      if (selectedSubcategory) {
        return query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          where('category', '==', selectedCategory),
          where('subcategory', '==', selectedSubcategory),
          orderBy('createdAt', 'desc')
        );
      }
      return query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        where('category', '==', selectedCategory),
        orderBy('createdAt', 'desc')
      );
    }
    return query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db, selectedCategory, selectedSubcategory]);

  const { data: allProducts, loading } = useCollection(productsQuery);

  const filteredProducts = allProducts?.filter((p) => {
    if (p.isAuction) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (wholesaleOnlyFilter && !p.allowWholesale) return false;
    return true;
  }) || [];

  return (
    <main className="flex-1 bg-muted/10 pb-20">
      <section className="bg-white border-b py-4 md:py-8 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl mx-auto space-y-4">
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
                   <Button type="button" variant="ghost" size="icon" onClick={() => setSearchQuery('')} className="h-10 w-10">
                     <X className="h-4 w-4" />
                   </Button>
                )}
                <Button type="submit" className="h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-xl">
                  Rechercher
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 px-3.5 py-1.5 rounded-xl shadow-sm">
                <Label htmlFor="wholesale-filter" className="text-xs font-black uppercase text-purple-700 cursor-pointer">
                  📦 Vente en gros uniquement
                </Label>
                <Switch 
                  id="wholesale-filter"
                  checked={wholesaleOnlyFilter}
                  onCheckedChange={setWholesaleOnlyFilter}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className="rounded-full font-bold px-5"
              >
                Tout
              </Button>
              {CATEGORIES.map(cat => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory(null);
                  }}
                  className="rounded-full font-bold px-5 whitespace-nowrap"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {selectedCategory && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-t pt-3 mt-2 scrollbar-hide animate-in slide-in-from-top-1 duration-200">
                <Button 
                  type="button"
                  variant={selectedSubcategory === null ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedSubcategory(null)}
                  className="rounded-full text-xs font-bold px-4"
                >
                  Toutes les sous-catégories
                </Button>
                {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories.map(sub => (
                  <Button 
                    key={sub}
                    type="button"
                    variant={selectedSubcategory === sub ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedSubcategory(sub)}
                    className="rounded-full text-xs font-medium px-4 whitespace-nowrap"
                  >
                    {sub}
                  </Button>
                ))}
              </div>
            )}
          </form>
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
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...filteredProducts]
                .sort((a, b) => (b.isPro ? 1 : 0) - (a.isPro ? 1 : 0))
                .map((p) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition as any,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                    subcategory: p.subcategory,
                    isPro: p.isPro,
                    allowWholesale: p.allowWholesale,
                    wholesaleOnly: p.wholesaleOnly,
                    minWholesaleQuantity: p.minWholesaleQuantity,
                    wholesalePrice: p.wholesalePrice
                  }} />
                ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center gap-4">
              <PackageSearch className="h-12 w-12 text-muted-foreground opacity-10" />
              <p className="text-xl font-bold text-muted-foreground">Aucun article trouvé.</p>
              <Button variant="link" className="text-primary font-bold mt-2" onClick={() => {setSearchQuery(''); setSelectedCategory(null); setSelectedSubcategory(null); setWholesaleOnlyFilter(false);}}>
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
