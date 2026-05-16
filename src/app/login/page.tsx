
"use client";

import { useAuth, useUser } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn, ShieldCheck } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, Suspense } from 'react';
import { LoadingLogo } from '@/components/ui/loading-logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function LoginContent() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast({
        title: "Bienvenue !",
        description: `Content de vous revoir, ${result.user.displayName}`,
      });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      toast({
        variant: "destructive",
        title: "Échec de connexion",
        description: "Une erreur est survenue lors de l'authentification Google.",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-8 rounded-[2.5rem] border-primary/5 shadow-2xl bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="space-y-6">
          <div className="relative w-48 h-20 mx-auto">
            <Image src={logoUrl} alt="Logo" fill className="object-contain" />
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
            onClick={handleLogin} 
            size="lg" 
            className="w-full h-16 rounded-2xl font-black uppercase bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 text-lg transition-all active:scale-95"
          >
            <LogIn className="h-6 w-6" />
            Continuer avec Google
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest pt-4 opacity-60">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Environnement 100% Sécurisé
          </div>
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><LoadingLogo /></div>}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
