
"use client";

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculatePriceWithCommission, CATEGORIES } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Truck, MessageSquare, Heart, Share2, Info } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  // Mock product data - in a real app, fetch by ID
  const product = {
    id: id as string,
    title: 'iPhone 13 Pro 256GB - Bleu Alpin',
    basePrice: 350000,
    description: "Cet iPhone est en excellent état, quasiment neuf. Aucune rayure sur l'écran. La batterie est à 92% de sa capacité. Livré avec sa boîte d'origine et le câble de recharge. Parfait pour un usage quotidien avec une superbe qualité photo.",
    condition: 'used' as const,
    category: 'electronics',
    images: [
      PlaceHolderImages[0].imageUrl,
      PlaceHolderImages[1].imageUrl,
      PlaceHolderImages[2].imageUrl,
    ],
    features: ['Stockage: 256GB', 'Batterie: 92%', 'Écran OLED Super Retina', 'iOS 17 compatible'],
    publishedAt: 'Il y a 2 heures'
  };

  const finalPrice = calculatePriceWithCommission(product.basePrice);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-white border shadow-sm">
                <Image 
                  src={product.images[activeImage]} 
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square relative rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase bg-primary/10 text-primary border-none">
                    {product.condition === 'new' ? 'Neuf' : 'Occasion'}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">Publié {product.publishedAt}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-6xl font-black text-primary">
                    {finalPrice.toLocaleString('fr-FR')} 
                  </span>
                  <span className="text-xl font-bold text-primary">FCFA</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 h-16 text-xl font-black uppercase rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20">
                  Acheter Maintenant
                </Button>
                <Button size="lg" variant="outline" className="h-16 w-16 p-0 rounded-2xl border-2">
                  <Heart className="h-6 w-6" />
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">Achat Sécurisé</p>
                    <p className="text-xs text-muted-foreground">Nous vérifions l&apos;article</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <Truck className="h-8 w-8 text-secondary" />
                  <div>
                    <p className="font-bold text-sm">Livraison Rapide</p>
                    <p className="text-xs text-muted-foreground">Sous 24-48h à Dakar</p>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-accent p-6 rounded-2xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Info className="h-5 w-5" />
                  <h3 className="uppercase tracking-tight">Anonymat Garanti</h3>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  L&apos;identité du vendeur est protégée. SalleDeVente.sn agit comme tiers de confiance. Toutes les communications et transactions passent par nous.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-black uppercase tracking-tight border-b pb-2">Description</h3>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-bold">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-8 border-t">
                <Button variant="ghost" className="font-bold gap-2">
                  <Share2 className="h-5 w-5" /> Partager
                </Button>
                <Button variant="ghost" className="font-bold gap-2 text-destructive">
                  Signaler un abus
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
