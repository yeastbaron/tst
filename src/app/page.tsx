import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES, calculatePriceWithCommission } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AdBanner } from '@/components/ads/AdBanner';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const featuredProducts = [
    { id: '1', title: 'iPhone 13 Pro', basePrice: 350000, image: PlaceHolderImages[0].imageUrl, condition: 'used' as const, category: 'Électronique' },
    { id: '2', title: 'MacBook Air M2', basePrice: 750000, image: PlaceHolderImages[0].imageUrl, condition: 'new' as const, category: 'Électronique' },
    { id: '3', title: 'Jordan Retro 4', basePrice: 45000, image: PlaceHolderImages[1].imageUrl, condition: 'new' as const, category: 'Mode' },
    { id: '4', title: 'Canapé Scandinave', basePrice: 200000, image: PlaceHolderImages[2].imageUrl, condition: 'used' as const, category: 'Maison' },
  ];

  const recentProducts = [
    { id: '5', title: 'Mercedes C200', basePrice: 8500000, image: PlaceHolderImages[3].imageUrl, condition: 'used' as const, category: 'Véhicules' },
    { id: '6', title: 'Montre Seiko 5', basePrice: 120000, image: PlaceHolderImages[1].imageUrl, condition: 'new' as const, category: 'Mode' },
    { id: '7', title: 'Parfum Sauvage', basePrice: 65000, image: PlaceHolderImages[4].imageUrl, condition: 'new' as const, category: 'Beauté' },
    { id: '8', title: 'PS5 Slim 1To', basePrice: 380000, image: PlaceHolderImages[5].imageUrl, condition: 'new' as const, category: 'Sports' },
  ];

  // Mock function to get samples for a category
  const getCategorySamples = (categoryName: string) => {
    return [
      { id: `s1-${categoryName}`, title: `Article ${categoryName} 1`, basePrice: 25000, image: PlaceHolderImages[0].imageUrl, condition: 'used' as const, category: categoryName },
      { id: `s2-${categoryName}`, title: `Article ${categoryName} 2`, basePrice: 45000, image: PlaceHolderImages[1].imageUrl, condition: 'new' as const, category: categoryName },
      { id: `s3-${categoryName}`, title: `Article ${categoryName} 3`, basePrice: 15000, image: PlaceHolderImages[2].imageUrl, condition: 'used' as const, category: categoryName },
      { id: `s4-${categoryName}`, title: `Article ${categoryName} 4`, basePrice: 85000, image: PlaceHolderImages[3].imageUrl, condition: 'new' as const, category: categoryName },
    ];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Ad Banner 1: Top of Page */}
        <div className="container mx-auto px-4 pt-6">
          <AdBanner />
        </div>

        {/* Featured Products Section */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary fill-secondary" />
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Articles à la Une</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section - Carousel on Mobile/Tablet, Grid on Desktop */}
        <section className="py-8 border-t bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Catégories</h2>
            </div>
            
            {/* Mobile/Tablet Carousel */}
            <div className="block lg:hidden">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {CATEGORIES.map((cat) => (
                    <CarouselItem key={cat.id} className="pl-2 basis-1/3 sm:basis-1/4">
                      <Link href={`/products?category=${cat.id}`} className="group flex flex-col">
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-border/50">
                          <Image 
                            src={cat.image || 'https://picsum.photos/seed/placeholder/400/400'} 
                            alt={cat.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="33vw"
                            data-ai-hint="product category"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center p-1">
                             <span className="text-white text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight drop-shadow-md">
                               {cat.name}
                             </span>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Desktop Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-8">
              {CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.id}`}
                  className="group flex flex-col"
                >
                  <div className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-white border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all mb-4">
                    <Image 
                      src={cat.image || 'https://picsum.photos/seed/placeholder/800/450'} 
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="33vw"
                      data-ai-hint="product category"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                       <span className="text-white text-xl font-black uppercase tracking-widest drop-shadow-lg text-center leading-tight">
                         {cat.name}
                       </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Banner 2: Middle */}
        <div className="container mx-auto px-4 py-4">
          <AdBanner id="ad-banner" />
        </div>

        {/* Recent Products Section */}
        <section className="py-8 md:py-12 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Articles Récents</h2>
              <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline text-xs md:text-sm">
                Voir tout <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
              <div className="w-full md:w-1/3 aspect-square bg-white/20 rounded-full blur-3xl absolute -bottom-24 -right-24" />
            </div>
          </div>
        </section>

        {/* Category Samples Sections - Full page content */}
        {CATEGORIES.map((cat) => (
          <section key={cat.id} className="py-10 border-t last:mb-10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">{cat.name}</h2>
                <Link href={`/products?category=${cat.id}`} className="text-primary font-bold flex items-center gap-1 hover:underline text-xs md:text-sm">
                  Voir plus <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                {getCategorySamples(cat.name).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Ad Banner 3: Bottom */}
        <div className="container mx-auto px-4 py-8">
          <AdBanner id="ad-banner" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
