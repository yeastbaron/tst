
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({
        title: "Erreur",
        description: "Le service d'authentification n'est pas disponible pour le moment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur SalleDeVente.sn !",
      });
      router.push('/');
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter avec Google.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-8 rounded-[2.5rem] border-primary/5 shadow-2xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          <div className="space-y-6">
            <div className="relative w-48 h-20 mx-auto">
              <Image src={logoUrl} alt="Logo" fill className="object-contain" priority />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Accès Sécurisé</h1>
              <p className="text-muted-foreground font-medium px-4 leading-relaxed">
                Connectez-vous pour acheter, vendre et gérer vos annonces sur la plateforme de référence au Sénégal.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading || authLoading}
              size="lg" 
              className="w-full h-16 rounded-2xl font-black uppercase bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 text-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogIn className="h-6 w-6" />
              )}
              {isLoading ? "Connexion..." : "Se connecter avec Google"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest pt-4 opacity-60">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Environnement 100% Sécurisé
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

