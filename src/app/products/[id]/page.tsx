
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
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
          <h1 className="text-2xl font-black uppercase">Oups ! Article introuvable.</h1>
          <Button asChild className="rounded-xl"><Link href="/products">Retour aux articles</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = calculatePriceWithCommission(product.basePrice);
  const images = product.images || ['https://picsum.photos/seed/placeholder/800/800'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à la liste
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-white border shadow-sm">
                <Image src={images[activeImage]} alt={product.title} fill className="object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase bg-primary/10 text-primary">
                    {product.condition === 'new' ? 'Neuf' : 'Occasion'}
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
                <Button size="lg" className="flex-1 h-16 text-xl font-black uppercase rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Acheter Maintenant
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div><p className="font-bold text-sm">Achat Sécurisé</p></div>
                </div>
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <Truck className="h-8 w-8 text-secondary" />
                  <div><p className="font-bold text-sm">Livraison Rapide</p></div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-2xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Info className="h-5 w-5" />
                  <h3 className="uppercase tracking-tight">Anonymat Garanti</h3>
                </div>
                <p className="text-sm text-muted-foreground font-medium">L'identité du vendeur est protégée par SalleDeVente.sn.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-xl border">
                  <h3 className="text-lg font-normal uppercase">Description</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
