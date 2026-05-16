"use client";

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { calculatePriceWithCommission, CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Truck, Heart, Share2, Info, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const db = useFirestore();

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, loading } = useDoc(productRef);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
          <h1 className="text-2xl font-black uppercase">Oups ! Article introuvable.</h1>
          <p className="text-muted-foreground">Cette annonce n'existe plus ou a été retirée.</p>
          <Button asChild className="rounded-xl"><Link href="/products">Retour aux articles</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = calculatePriceWithCommission(product.basePrice);
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://picsum.photos/seed/placeholder/800/800'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à la liste
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-white border shadow-sm">
                <Image 
                  src={images[activeImage]} 
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {images.map((img: string, i: number) => (
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

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase bg-primary/10 text-primary border-none">
                    {product.condition === 'new' ? 'Neuf' : product.condition === 'used' ? 'Occasion' : 'Reconditionné'}
                  </Badge>
                  <Badge variant="outline" className="text-xs uppercase font-bold">
                    {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                  </Badge>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">Achat Sécurisé</p>
                    <p className="text-xs text-muted-foreground">Nous vérifions l'article</p>
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

              <div className="bg-accent p-6 rounded-2xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Info className="h-5 w-5" />
                  <h3 className="uppercase tracking-tight">Anonymat Garanti</h3>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  L'identité du vendeur est protégée. SalleDeVente.sn agit comme tiers de confiance.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-muted p-3 md:p-4 rounded-xl border border-border/50">
                  <h3 className="text-base md:text-lg font-normal uppercase tracking-wide">Description</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

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
