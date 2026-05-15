
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';

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
        {/* Hero Section */}
        <section className="relative bg-primary py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
                ACHETEZ ET VENDEZ <br />
                <span className="text-secondary underline decoration-4 underline-offset-8">EN TOUTE CONFIANCE</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 font-medium max-w-xl">
                La plateforme intermédiaire qui sécurise vos transactions. Neuf ou occasion, nous gérons tout pour vous.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-8 h-14 text-lg rounded-xl" asChild>
                  <Link href="/products">Découvrir les articles</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold px-8 h-14 text-lg rounded-xl" asChild>
                  <Link href="/sell">Vendre maintenant</Link>
                </Button>
              </div>
            </div>
          </div>
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 transform translate-x-1/4" />
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Anonymat Garanti", desc: "L'identité du vendeur reste confidentielle pour votre sécurité." },
                { icon: Zap, title: "Intermédiaire de Confiance", desc: "Nous gérons la transaction et la vérification des articles." },
                { icon: Truck, title: "Paiement à la Livraison", desc: "Payez en ligne ou directement à la réception de votre commande." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-6 rounded-2xl shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black tracking-tight uppercase">Parcourir les catégories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.id}`}
                  className="group flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-white border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all mb-4">
                    <Image 
                      src={cat.image || 'https://picsum.photos/seed/placeholder/200/200'} 
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 15vw"
                      data-ai-hint={cat.id === 'electronics' ? 'smartphone laptop' : cat.id === 'fashion' ? 'fashion clothing' : 'product category'}
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-center uppercase group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black tracking-tight uppercase">Articles Mis en Avant</h2>
              <Link href="/products" className="text-primary font-bold flex items-center gap-1 hover:underline">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-secondary p-8 md:p-16 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-secondary-foreground overflow-hidden relative">
              <div className="space-y-4 max-w-xl relative z-10">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                  Videz votre grenier <br />& Gagnez de l&apos;argent
                </h2>
                <p className="text-lg font-medium opacity-90">
                  Vendez vos articles d&apos;occasion en quelques clics. Nous ajoutons une marge de 10% et nous nous occupons du reste.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg font-bold rounded-xl" asChild>
                  <Link href="/sell">Commencer à vendre</Link>
                </Button>
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
