"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, PlusCircle, ExternalLink, Clock, CheckCircle2, XCircle, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { CATEGORIES } from '@/lib/constants';

export default function MyListingsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'products'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: listings, loading: dataLoading } = useCollection(listingsQuery);

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4 rounded-3xl border-border/50">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-normal uppercase">Accès restreint</h1>
            <p className="text-muted-foreground font-medium">Connectez-vous pour voir vos annonces.</p>
            <Button asChild className="w-full rounded-xl font-bold"><Link href="/">Retour à l'accueil</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" /> En ligne</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Refusée</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500 hover:bg-blue-600 gap-1"><Tag className="h-3 w-3" /> Vendue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <main className="flex-1">
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase text-primary">Mes Annonces</h1>
            <Button asChild size="sm" className="rounded-xl font-bebas text-[14px] tracking-widest gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4">
              <Link href="/sell"><PlusCircle className="h-4 w-4" /> Vendre un article</Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {listings.map((item: any) => (
                <Card key={item.id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-all rounded-2xl shadow-sm bg-white">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-56 aspect-square md:aspect-auto">
                      <Image 
                        src={item.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                        alt={item.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(item.status)}
                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                              {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-black uppercase leading-tight">{item.title}</h3>
                          <p className="text-2xl font-black text-primary">{item.basePrice.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl font-bold gap-2" asChild>
                            <Link href={`/products/${item.id}`}><ExternalLink className="h-4 w-4" /> Voir l'annonce</Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <p>Publié le {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                        {item.status === 'pending' && (
                          <p className="text-secondary italic">Validation en cours (moins de 24h)</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center space-y-4">
              <Package className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">Vous n'avez pas encore d'annonces.</p>
              <Button asChild className="rounded-xl font-black uppercase">
                <Link href="/sell">Vendre mon premier article</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
