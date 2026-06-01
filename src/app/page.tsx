"use client";

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { AdBanner } from '@/components/ads/AdBanner';
import Link from 'next/link';
import { Sparkles, Grid2X2, Grid3X3, LayoutGrid, Loader2, PackageSearch } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingLogo } from '@/components/ui/loading-logo';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';

export default function Home() {
  const [productCols, setProductCols] = useState(3);
  const [categoryCols, setCategoryCols] = useState(3);
  const db = useFirestore();

  // Charger jusqu'à 100 produits pour alimenter les rayons par catégorie en une seule requête Firestore
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }, [db]);

  const { data: products, loading } = useCollection(productsQuery);

  // Aplatir toutes les sous-catégories pour la vitrine interactive
  const allSubcategories = useMemo(() => {
    const flat: Array<{ name: string; category: string; parentName: string; image: string }> = [];
    CATEGORIES.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        flat.push({
          name: sub,
          category: cat.id,
          parentName: cat.name,
          image: `https://picsum.photos/seed/${encodeURIComponent(sub)}/400/400`
        });
      });
    });
    return flat;
  }, []);

  // Les 8 sous-catégories affichées en vitrine par défaut (sélection variée et très visuelle)
  const [showcaseItems, setShowcaseItems] = useState(() => {
    return [
      { name: "Smartphones", category: "electronics", parentName: "Électronique & Multimédia", image: "https://picsum.photos/seed/smartphones/400/400" },
      { name: "Vêtements", category: "fashion", parentName: "Mode, Beauté & Accessoires", image: "https://picsum.photos/seed/clothing/400/400" },
      { name: "Chaussures", category: "fashion", parentName: "Mode, Beauté & Accessoires", image: "https://picsum.photos/seed/sneakers/400/400" },
      { name: "Bijoux & Montres", category: "fashion", parentName: "Mode, Beauté & Accessoires", image: "https://picsum.photos/seed/watch/400/400" },
      { name: "Ameublement", category: "home", parentName: "Maison, Déco & Jardin", image: "https://picsum.photos/seed/furniture/400/400" },
      { name: "Véhicules (Vente/Location)", category: "vehicles", parentName: "Véhicules, Auto & Moto", image: "https://picsum.photos/seed/motors/400/400" },
      { name: "Consoles & Jeux vidéo", category: "electronics", parentName: "Électronique & Multimédia", image: "https://picsum.photos/seed/gaming/400/400" },
      { name: "Épicerie fine & Sèche", category: "grocery", parentName: "Épicerie & Produits Locaux", image: "https://picsum.photos/seed/spice/400/400" }
    ];
  });

  // Mélanger pour découvrir d'autres sous-catégories
  const handleShuffleShowcase = () => {
    const shuffled = [...allSubcategories].sort(() => 0.5 - Math.random());
    setShowcaseItems(shuffled.slice(0, 8));
  };

  // Groupement des produits par catégorie en mémoire (vente directe uniquement)
  const productsByCategory = useMemo(() => {
    if (!products) return {};
    const grouped: Record<string, typeof products> = {};
    products.filter(p => !p.isAuction).forEach((p) => {
      if (!grouped[p.category]) {
        grouped[p.category] = [];
      }
      grouped[p.category].push(p);
    });
    return grouped;
  }, [products]);

  // Les 12 articles les plus récents (vente directe uniquement, tri PRO en premier)
  const recentProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter(p => !p.isAuction)
      .sort((a, b) => (b.isPro ? 1 : 0) - (a.isPro ? 1 : 0))
      .slice(0, 12);
  }, [products]);

  // Les articles mis en avant (vente directe uniquement, produits des super-vendeurs actifs et non expirés)
  const featuredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p: any) => {
        if (p.isAuction) return false;
        const isSuper = p.sellerIsSuper === true;
        const isNotExpired = !p.sellerSuperExpiresAt || new Date(p.sellerSuperExpiresAt) > new Date();
        return isSuper && isNotExpired;
      })
      .slice(0, 6);
  }, [products]);

  // Les enchères actives (non terminées) pour l'affichage en vitrine
  const activeAuctions = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p: any) => {
        if (!p.isAuction) return false;
        const isExpired = p.auctionEndAt && (
          typeof p.auctionEndAt.toDate === 'function'
            ? p.auctionEndAt.toDate()
            : new Date(p.auctionEndAt)
        ) < new Date();
        return !isExpired;
      })
      .slice(0, 6);
  }, [products]);

  // Groupement des produits par sous-catégorie en mémoire (vente directe uniquement)
  const productsBySubcategory = useMemo(() => {
    if (!products) return {};
    const grouped: Record<string, typeof products> = {};
    products.filter(p => !p.isAuction).forEach((p) => {
      if (p.subcategory) {
        if (!grouped[p.subcategory]) {
          grouped[p.subcategory] = [];
        }
        grouped[p.subcategory].push(p);
      }
    });
    return grouped;
  }, [products]);

  // Trouver la catégorie parent d'une sous-catégorie
  const getParentCategory = (subName: string) => {
    return CATEGORIES.find(c => c.subcategories.includes(subName));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-muted/5">
        <div className="container mx-auto px-4 pt-6">
          <AdBanner imageUrl="https://picsum.photos/seed/sdvpro/1200/200" />
        </div>

        {/* Section Articles Mis en Avant */}
        {!loading && featuredProducts.length > 0 && (
          <section className="mt-8">
            <div className="w-full bg-gradient-to-r from-amber-50 via-white to-amber-50 border-y border-amber-200 py-4 shadow-sm">
              <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="h-4 w-4 fill-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-amber-600">Articles mis en avant</h2>
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-0.5">La crème de nos super-vendeurs</p>
                  </div>
                </div>

                {/* Switcher */}
                <div className="flex items-center gap-1 lg:hidden">
                  <button 
                    onClick={() => setProductCols(2)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                      productCols === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                    )}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setProductCols(3)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                      productCols === 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-8">
              <div className={cn(
                "grid gap-3 md:gap-4",
                productCols === 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-5",
                "lg:grid-cols-6"
              )}>
                {featuredProducts.map((p) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition as any,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                    subcategory: p.subcategory,
                    isPro: p.isPro,
                    isSuperSeller: true,
                    sellerIsSuper: p.sellerIsSuper,
                    sellerSuperExpiresAt: p.sellerSuperExpiresAt
                  }} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Deuxième Bannière Pub */}
        {!loading && (
          <div className="container mx-auto px-4 pt-8">
            <AdBanner imageUrl="/ads/banner-visa.png" />
          </div>
        )}

        {/* Section Enchères en Cours */}
        {!loading && activeAuctions.length > 0 && (
          <section className="mt-8">
            <div className="w-full bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border-y border-indigo-200 py-4 shadow-sm">
              <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-650 flex items-center justify-center text-white shadow-sm">
                    <span className="text-sm">🔨</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-indigo-750">Enchères en cours</h2>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-0.5">Faites vos offres en direct</p>
                  </div>
                </div>
                <Link 
                  href="/encheres" 
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-650 hover:text-indigo-850 hover:underline transition-all"
                >
                  Voir tout
                </Link>
              </div>
            </div>

            <div className="container mx-auto px-4 py-8">
              <div className={cn(
                "grid gap-3 md:gap-4",
                productCols === 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-5",
                "lg:grid-cols-6"
              )}>
                {activeAuctions.map((p) => (
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
            </div>
          </section>
        )}

        {/* Section Articles Récents */}
        <section className="mt-8">
          <div className="w-full bg-white border-y border-border/50 py-4 shadow-sm">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary fill-primary animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-widest text-primary">Articles Récents</h2>
              </div>
              
              <div className="flex items-center gap-1 lg:hidden">
                <button 
                  onClick={() => setProductCols(2)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                    productCols === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                  )}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setProductCols(3)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                    productCols === 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {loading ? (
              <LoadingLogo message="Produits en cours de chargement..." />
            ) : recentProducts.length > 0 ? (
              <div className={cn(
                "grid gap-3 md:gap-4",
                productCols === 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-5",
                "lg:grid-cols-6"
              )}>
                {recentProducts.map((p) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition as any,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                    subcategory: p.subcategory,
                    isPro: p.isPro
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed flex flex-col items-center gap-4">
                <PackageSearch className="h-12 w-12 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Aucun article disponible pour le moment</p>
                <Button variant="outline" className="rounded-xl font-bold" asChild>
                  <Link href="/sell">Vendre le premier article</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Troisième Bannière Pub */}
        {!loading && (
          <div className="container mx-auto px-4 py-6">
            <AdBanner imageUrl="https://picsum.photos/seed/sdvcommercial/1200/200" />
          </div>
        )}

        {/* Rayons de Produits par Sous-Catégorie */}
        {!loading && Object.keys(productsBySubcategory).map((subName, index) => {
          const subProducts = productsBySubcategory[subName] || [];
          if (subProducts.length === 0) return null;

          const parentCat = getParentCategory(subName);
          const catId = parentCat?.id || "";
          const catName = parentCat?.name || "";

          // Trier pour afficher les PRO en premier, puis prendre jusqu'à 6 produits d'échantillons
          const sampleProducts = [...subProducts]
            .sort((a, b) => (b.isPro ? 1 : 0) - (a.isPro ? 1 : 0))
            .slice(0, 6);

          return (
            <div key={subName}>
              <section className="py-8 border-t border-border/40">
                {/* En-tête de sous-catégorie interactif */}
                <div className="w-full bg-white border-y border-border/40 py-3 mb-6 shadow-sm">
                  <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link 
                      href={`/products?category=${catId}&subcategory=${encodeURIComponent(subName)}`} 
                      className="group relative cursor-pointer inline-flex items-center"
                    >
                      <span className="text-sm font-black tracking-wider uppercase text-primary group-hover:text-amber-500 transition-colors duration-300 flex items-center gap-2">
                        📁 {catName} <span className="text-amber-500 font-bold">›</span> {subName}
                        <span className="text-muted-foreground font-body font-medium normal-case text-xs opacity-60">
                          ({subProducts.length} articles)
                        </span>
                      </span>
                      {/* Barre de soulignement premium */}
                      <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full shadow-sm" />
                      {/* Indicateur de glissement */}
                      <span className="text-amber-500 font-black text-sm transform transition-transform duration-300 group-hover:translate-x-2 ml-2">
                        →
                      </span>
                    </Link>

                    <div className="flex items-center gap-3">
                      {/* Switcher */}
                      <div className="flex items-center gap-1 lg:hidden">
                        <button 
                          onClick={() => setProductCols(2)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                            productCols === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                          )}
                        >
                          <Grid2X2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setProductCols(3)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                            productCols === 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                          )}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </button>
                      </div>

                      <Link 
                        href={`/products?category=${catId}&subcategory=${encodeURIComponent(subName)}`}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-500 hover:scale-105 transition-all duration-300 hidden sm:block"
                      >
                        Tout afficher
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Rayon responsive de produits */}
                <div className="container mx-auto px-4">
                  <div className={cn(
                    "grid gap-3 md:gap-4",
                    productCols === 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-5",
                    "lg:grid-cols-6"
                  )}>
                    {sampleProducts.map((p) => (
                      <ProductCard key={p.id} product={{
                        id: p.id,
                        title: p.title,
                        basePrice: p.basePrice,
                        image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                        condition: p.condition as any,
                        category: catName,
                        subcategory: p.subcategory,
                        isPro: p.isPro
                      }} />
                    ))}
                  </div>
                </div>
              </section>

              {/* Troisième Bannière Pub : Insérée après le 2ème rayon de sous-catégorie */}
              {index === 1 && (
                <div className="container mx-auto px-4 py-6 border-t border-border/40">
                  <AdBanner imageUrl="https://picsum.photos/seed/sdvadsense/1200/200" />
                </div>
              )}
            </div>
          );
        })}

        {/* Troisième Bannière Pub (fallback de sécurité si moins de 2 rayons de sous-catégories) */}
        {!loading && Object.keys(productsBySubcategory).filter(subName => (productsBySubcategory[subName]?.length || 0) > 0).length < 2 && (
          <div className="container mx-auto px-4 py-6 border-t border-border/40">
            <AdBanner imageUrl="https://picsum.photos/seed/sdvadsense/1200/200" />
          </div>
        )}

        {/* Section Catégories - LE GRAND LÈCHE-VITRINE */}
        <section className="border-t border-border/50 py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary">🛍️ Le Grand Lèche-Vitrine</h2>
                <p className="text-muted-foreground font-bold text-sm md:text-base">Explorez de nouveaux rayons d&apos;échantillons à chaque visite.</p>
              </div>
              <Button 
                onClick={handleShuffleShowcase} 
                variant="outline" 
                className="rounded-full font-black uppercase text-xs h-10 gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                🔄 Autre vitrine
              </Button>
            </div>
            
            {/* Grille responsive parfaite pour les échantillons de sous-catégories */}
            <div className="grid grid-cols-3 lg:grid-cols-8 gap-3 md:gap-4">
              {showcaseItems.map((item, index) => (
                <Link 
                  key={item.name + index}
                  href={`/products?category=${item.category}&search=${encodeURIComponent(item.name)}`}
                  className={cn(
                    "group relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white border border-border/50 hover:border-primary/30 transition-all duration-350 hover:shadow-lg",
                    index >= 6 ? "hidden lg:block" : ""
                  )}
                >
                  <Image 
                    src={item.image} 
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 12vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute bottom-3 left-2.5 right-2.5 text-center">
                    <p className="text-[8px] md:text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5 truncate">
                      {item.parentName.split(" ")[0]}
                    </p>
                    <span className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-wide leading-none drop-shadow-md block truncate">
                      {item.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Rayons de Produits par Catégorie */}
        {!loading && CATEGORIES.map((cat) => {
          const categoryProducts = productsByCategory[cat.id] || [];
          if (categoryProducts.length === 0) return null;

          // Trier pour afficher les PRO en premier, puis prendre jusqu'à 6 produits d'échantillons
          const sampleProducts = [...categoryProducts]
            .sort((a, b) => (b.isPro ? 1 : 0) - (a.isPro ? 1 : 0))
            .slice(0, 6);

          return (
            <section key={cat.id} className="py-8 border-t border-border/40">
              {/* En-tête de catégorie interactif */}
              <div className="w-full bg-white border-y border-border/40 py-3 mb-6 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between">
                  <Link 
                    href={`/products?category=${cat.id}`} 
                    className="group relative cursor-pointer inline-flex items-center"
                  >
                    <span className="text-sm font-black tracking-wider uppercase text-primary group-hover:text-amber-500 transition-colors duration-300 flex items-center gap-2">
                      📁 {cat.name} 
                      <span className="text-muted-foreground font-body font-medium normal-case text-xs opacity-60">
                        ({categoryProducts.length} articles)
                      </span>
                    </span>
                    {/* Barre de soulignement premium */}
                    <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full shadow-sm" />
                    {/* Indicateur de glissement */}
                    <span className="text-amber-500 font-black text-sm transform transition-transform duration-300 group-hover:translate-x-2 ml-2">
                      →
                    </span>
                  </Link>

                  <div className="flex items-center gap-3">
                    {/* Switcher */}
                    <div className="flex items-center gap-1 lg:hidden">
                      <button 
                        onClick={() => setProductCols(2)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                          productCols === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                        )}
                      >
                        <Grid2X2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setProductCols(3)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                          productCols === 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-white"
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                    </div>

                    <Link 
                      href={`/products?category=${cat.id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-500 hover:scale-105 transition-all duration-300 hidden sm:block"
                    >
                      Tout afficher
                    </Link>
                  </div>
                </div>
              </div>

              {/* Rayon responsive de produits */}
              <div className="container mx-auto px-4">
                <div className={cn(
                  "grid gap-3 md:gap-4",
                  productCols === 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-5",
                  "lg:grid-cols-6"
                )}>
                  {sampleProducts.map((p) => (
                    <ProductCard key={p.id} product={{
                      id: p.id,
                      title: p.title,
                      basePrice: p.basePrice,
                      image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                      condition: p.condition as any,
                      category: cat.name,
                      subcategory: p.subcategory,
                      isPro: p.isPro
                    }} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Section d'incitation à vendre */}
        <section className="py-12 md:py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="bg-secondary p-8 md:p-16 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-secondary-foreground overflow-hidden relative">
              <div className="space-y-4 max-w-xl relative z-10">
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase leading-none text-center md:text-left">
                  Videz votre grenier <br className="hidden md:block" />& Gagnez de l&apos;argent
                </h2>
                <p className="text-sm md:text-lg font-medium opacity-90 text-center md:text-left">
                  Vendez vos articles d&apos;occasion en quelques clics. Les acheteurs vous contactent directement pour finaliser la vente.
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
