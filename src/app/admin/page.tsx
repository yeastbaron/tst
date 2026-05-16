
"use client";

import { useUser } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Eye, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { LoadingLogo } from '@/components/ui/loading-logo';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  const pendingProducts = MOCK_PRODUCTS.filter(p => p.status === 'pending');

  const handleApprove = (productId: string) => {
    toast({ title: "Approbation réussie", description: "L'annonce est désormais en ligne." });
  };

  const handleReject = (productId: string) => {
    toast({ variant: "destructive", title: "Annonce rejetée", description: "Le vendeur sera notifié." });
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><LoadingLogo /></div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-10 text-center space-y-6 border-destructive/20 rounded-[2.5rem] shadow-xl">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight">Accès Refusé</h1>
              <p className="text-muted-foreground font-medium">Seuls les administrateurs certifiés peuvent accéder à cet espace.</p>
            </div>
            <Button asChild className="w-full rounded-2xl font-black uppercase h-12" variant="outline"><Link href="/">Retour à l'accueil</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8 bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">Gestion des Annonces</h1>
              <p className="text-muted-foreground text-sm font-medium">Validez ou rejetez les nouvelles soumissions.</p>
            </div>
            <Badge variant="default" className="bg-secondary text-white font-black px-6 py-2 rounded-full text-sm">
              {pendingProducts.length} EN ATTENTE
            </Badge>
          </div>

          {pendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pendingProducts.map((p: any) => (
                <Card key={p.id} className="overflow-hidden border-primary/5 hover:border-primary/20 transition-all rounded-[2rem] bg-white shadow-lg group">
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-64 aspect-square md:aspect-auto overflow-hidden">
                      <Image 
                        src={p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                        alt={p.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1 p-8 space-y-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="space-y-2">
                          <Badge variant="secondary" className="uppercase text-[10px] font-black tracking-widest px-3">
                            {p.category}
                          </Badge>
                          <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">{p.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-primary tracking-tighter">{p.basePrice?.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-6 border-t border-primary/5">
                        <Button className="bg-green-600 hover:bg-green-700 font-black uppercase gap-2 rounded-xl h-12 px-6" onClick={() => handleApprove(p.id)}>
                          <Check className="h-5 w-5" /> Approuver
                        </Button>
                        <Button variant="destructive" className="font-black uppercase gap-2 rounded-xl h-12 px-6" onClick={() => handleReject(p.id)}>
                          <X className="h-5 w-5" /> Rejeter
                        </Button>
                        <Button variant="outline" className="font-black uppercase gap-2 rounded-xl h-12 px-6 ml-auto" asChild>
                          <Link href={`/products/${p.id}`}><Eye className="h-5 w-5" /> Examiner</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-primary/10 shadow-inner flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-primary opacity-30" />
              </div>
              <p className="text-2xl font-black uppercase text-muted-foreground opacity-40">Tout est à jour !</p>
              <p className="text-muted-foreground font-medium">Aucune nouvelle annonce en attente de modération.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
