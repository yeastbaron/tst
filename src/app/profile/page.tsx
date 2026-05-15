
"use client";

import { useUser, useAuth } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, Package, Settings, User as UserIcon, ShieldCheck, ChevronRight } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  if (loading) {
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
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/10">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2rem] border-border/50 shadow-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-normal uppercase">Accès restreint</h1>
              <p className="text-muted-foreground font-medium">Vous devez être connecté pour accéder à votre profil.</p>
            </div>
            <Button asChild className="w-full rounded-xl font-bold h-12">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-border/50 mb-8 flex items-center gap-4">
            <h1 className="text-lg md:text-xl font-normal tracking-wide uppercase">Mon Profil</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 border-border/50 rounded-[2rem] overflow-hidden shadow-sm h-fit bg-white">
              <CardContent className="p-8 text-center space-y-4">
                <Avatar className="h-32 w-32 mx-auto border-4 border-primary/10 shadow-lg">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-primary text-white text-3xl font-black">
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 pt-4">
                  <h2 className="text-xl font-black uppercase tracking-tight">{user.displayName}</h2>
                  <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
                </div>
                <div className="flex flex-col items-center gap-2 pt-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full font-bold">
                    Membre Vérifié
                  </Badge>
                  {isAdmin && (
                    <Badge variant="secondary" className="gap-1 px-4 py-1">
                      <ShieldCheck className="h-3 w-3" /> Administrateur
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              {isAdmin && (
                <Card className="border-secondary/30 bg-secondary/5 rounded-[2rem] overflow-hidden shadow-sm border-2">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary rounded-2xl">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-secondary tracking-tight">Espace Administrateur</h3>
                          <p className="text-sm text-muted-foreground font-medium">Gérer les validations et le contenu.</p>
                        </div>
                      </div>
                      <Button asChild variant="secondary" className="rounded-xl font-black uppercase">
                        <Link href="/admin">Y accéder <ChevronRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-secondary" />
                      Mes Activités
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 group hover:border-primary/50 transition-all" asChild>
                      <Link href="/my-listings">
                        <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">Gérer</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mes Annonces</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 group hover:border-secondary/50 transition-all">
                      <Package className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mes Achats</span>
                    </Button>
                  </div>

                  <div className="space-y-4 pt-4">
                     <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="font-bold flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          Paramètres
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start font-bold rounded-xl h-12" asChild>
                          <Link href="/settings">Modifier mes informations</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start font-bold rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                        </Button>
                      </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-[2rem] space-y-2">
                <p className="text-sm font-bold text-secondary uppercase tracking-wider">Tiers de Confiance</p>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Votre sécurité est notre priorité. Toutes vos données personnelles sont protégées et ne sont jamais partagées avec les acheteurs ou les vendeurs sans votre consentement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
