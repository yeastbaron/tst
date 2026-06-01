
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isRedirectProcessing, setIsRedirectProcessing] = useState(false);
  const [redirectProvider, setRedirectProvider] = useState<string | null>(null);

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectProvider(localStorage.getItem('login_provider'));
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!auth) return;
    
    setIsRedirectProcessing(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue sur SalleDeVente.sn !",
          });
          router.push('/');
        }
      })
      .catch((error) => {
        console.error("Redirect auth error:", error);
        const cleanedMessage = (error.message || "Impossible de se connecter.").replace(/Firebase/gi, 'SalleDeVente');
        toast({
          title: "Erreur de connexion",
          description: cleanedMessage,
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsRedirectProcessing(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('login_provider');
        }
      });
  }, [auth, router, toast]);

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({
        title: "Erreur",
        description: "Le service d'authentification n'est pas disponible pour le moment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      if (isMobile()) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('login_provider', 'google');
        }
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur SalleDeVente.sn !",
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const cleanedMessage = (error.message || "Impossible de se connecter avec Google.").replace(/Firebase/gi, 'SalleDeVente');
      toast({
        title: "Erreur de connexion",
        description: cleanedMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!auth) {
      toast({
        title: "Erreur",
        description: "Le service d'authentification n'est pas disponible pour le moment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingFacebook(true);
    const provider = new FacebookAuthProvider();
    
    try {
      if (isMobile()) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('login_provider', 'facebook');
        }
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur SalleDeVente.sn !",
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const cleanedMessage = (error.message || "Impossible de se connecter avec Facebook.").replace(/Firebase/gi, 'SalleDeVente');
      toast({
        title: "Erreur de connexion",
        description: cleanedMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingFacebook(false);
    }
  };

  const isGoogleLoading = isLoadingGoogle || (isRedirectProcessing && redirectProvider === 'google');
  const isFacebookLoading = isLoadingFacebook || (isRedirectProcessing && redirectProvider === 'facebook');

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
              disabled={isLoadingGoogle || isLoadingFacebook || authLoading || isRedirectProcessing}
              size="lg" 
              className="w-full h-16 rounded-2xl font-black uppercase bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3 text-lg transition-all"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogIn className="h-6 w-6" />
              )}
              {isGoogleLoading ? "Connexion..." : "Se connecter avec Google"}
            </Button>

{/* 
            <Button 
              onClick={handleFacebookLogin}
              disabled={isLoadingGoogle || isLoadingFacebook || authLoading || isRedirectProcessing}
              size="lg" 
              className="w-full h-16 rounded-2xl font-black uppercase bg-[#1877F2] text-white hover:bg-[#1877F2]/90 shadow-xl shadow-[#1877F2]/20 gap-3 text-lg transition-all"
            >
              {isFacebookLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              )}
              {isFacebookLoading ? "Connexion..." : "Se connecter avec Facebook"}
            </Button>
            */}

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

