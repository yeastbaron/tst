
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function Home() {
  // Mock products for the home page
  const featuredProducts = [
    { id: '1', title: 'iPhone 13 Pro 256GB', basePrice: 350000, image: PlaceHolderImages[0].imageUrl, condition: 'used' as const, category: 'Électronique' },
    { id: '2', title: 'MacBook Air M2 2023', basePrice: 750000, image: PlaceHolderImages[0].imageUrl, condition: 'new' as const, category: 'Électronique' },
    { id: '3', title: 'Nike Air Max Jordan', basePrice: 45000, image: PlaceHolderImages[1].imageUrl, condition: 'new' as const, category: 'Mode' },
    { id: '4', title: 'Canapé 3 places Cuir', basePrice: 200000, image: PlaceHolderImages[2].imageUrl, condition: 'used' as const, category: 'Maison' },
    { id: '5', title: 'Mercedes-Benz C200', basePrice: 8500000, image: PlaceHolderImages[3].imageUrl, condition: 'used' as const, category: 'Véhicules' },
    { id: '6', title: 'Réfrigérateur Samsung', basePrice: 280000, image: PlaceHolderImages[4].imageUrl, condition: 'new' as const, category: 'Maison' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Featured Products Section */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Articles Mis en Avant</h2>
              <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm md:text-base">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Carousel for Mobile/Tablet */}
            <div className="lg:hidden">
              <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((p) => (
                    <CarouselItem key={p.id} className="pl-4 basis-[75%] sm:basis-1/2 md:basis-1/3">
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Grid for Desktop */}
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid - 3 Columns on all sizes */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Parcourir les catégories</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-8">
              {CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.id}`}
                  className="group flex flex-col"
                >
                  <div className="relative w-full aspect-square md:aspect-[16/9] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all mb-2 md:mb-4">
                    <Image 
                      src={cat.image || 'https://picsum.photos/seed/placeholder/800/450'} 
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 33vw, 33vw"
                      data-ai-hint={cat.id === 'electronics' ? 'smartphone laptop' : cat.id === 'fashion' ? 'fashion clothing' : 'product category'}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                       <span className="text-white text-[10px] sm:text-sm md:text-2xl font-black uppercase tracking-tight md:tracking-widest drop-shadow-lg text-center leading-tight">
                         {cat.name}
                       </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="bg-secondary p-8 md:p-16 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-secondary-foreground overflow-hidden relative">
              <div className="space-y-4 max-w-xl relative z-10">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-center md:text-left">
                  Videz votre grenier <br className="hidden md:block" />& Gagnez de l&apos;argent
                </h2>
                <p className="text-base md:text-lg font-medium opacity-90 text-center md:text-left">
                  Vendez vos articles d&apos;occasion en quelques clics. Nous ajoutons une marge de 10% et nous nous occupons du reste.
                </p>
                <div className="flex justify-center md:justify-start">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg font-bold rounded-xl" asChild>
                    <Link href="/sell">Commencer à vendre</Link>
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-white/20 rounded-full blur-3xl absolute -bottom-24 -right-24" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
