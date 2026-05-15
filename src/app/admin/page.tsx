
"use client";

import { useUser, useFirestore, useCollection } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { collection, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Eye, Loader2, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '@/firebase';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  const pendingQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(
      collection(db, 'products'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
  }, [db, isAdmin]);

  const { data: pendingProducts, loading: productsLoading } = useCollection(pendingQuery);

  const handleApprove = (productId: string) => {
    const docRef = doc(db, 'products', productId);
    updateDoc(docRef, { status: 'active' })
      .then(() => {
        toast({ title: "Produit approuvé !", description: "L'annonce est maintenant visible par tous." });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({ path: docRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', error);
      });
  };

  const handleReject = (productId: string) => {
    const docRef = doc(db, 'products', productId);
    updateDoc(docRef, { status: 'rejected' })
      .then(() => {
        toast({ variant: "destructive", title: "Annonce rejetée", description: "L'annonce ne sera pas publiée." });
      })
      .catch(async () => {
        const error = new FirestorePermissionError({ path: docRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', error);
      });
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4 border-destructive/20">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-black uppercase">Accès Refusé</h1>
            <p className="text-muted-foreground font-medium">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
            <Button asChild className="w-full rounded-xl font-bold"><Link href="/">Retour à l'accueil</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Tableau de bord Admin</h1>
              <p className="text-muted-foreground font-medium">Gestion des annonces en attente de validation.</p>
            </div>
            <Badge variant="outline" className="text-primary font-bold border-primary/20 px-4 py-1">
              {pendingProducts?.length || 0} en attente
            </Badge>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
          ) : pendingProducts && pendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pendingProducts.map((p: any) => (
                <Card key={p.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 aspect-square md:aspect-auto">
                      <Image 
                        src={p.images[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                        alt={p.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="secondary" className="mb-2 uppercase text-[10px] font-bold">
                            {p.category}
                          </Badge>
                          <h3 className="text-xl font-black uppercase leading-tight">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">{p.basePrice.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 font-bold gap-2 rounded-xl" onClick={() => handleApprove(p.id)}>
                          <Check className="h-4 w-4" /> Approuver
                        </Button>
                        <Button size="sm" variant="destructive" className="font-bold gap-2 rounded-xl" onClick={() => handleReject(p.id)}>
                          <X className="h-4 w-4" /> Rejeter
                        </Button>
                        <Button size="sm" variant="outline" className="font-bold gap-2 rounded-xl" asChild>
                          <Link href={`/products/${p.id}`}><Eye className="h-4 w-4" /> Voir</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30">
              <p className="text-xl font-bold text-muted-foreground">Aucune annonce en attente pour le moment.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
