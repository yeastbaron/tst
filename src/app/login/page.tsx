
"use client";

import { useAuth, useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, Suspense } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function LoginContent() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleLogin = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: result.user.email === 'ndaw22@gmail.com' ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };

      const userRef = doc(db, 'users', result.user.uid);
      
      // Utilisation du pattern non-bloquant pour Firestore
      setDoc(userRef, userData, { merge: true })
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Connexion réussie",
        description: `Bienvenue sur SalleDeVente.sn, ${result.user.displayName} !`,
      });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      
      let title = "Erreur d'authentification";
      let message = "Une erreur est survenue lors de la connexion.";

      if (error.code === 'auth/configuration-not-found') {
        message = "La connexion Google n'est pas activée dans la console Firebase.";
      } else if (error.code === 'auth/unauthorized-domain') {
        title = "Domaine non autorisé";
        message = "Ce domaine doit être ajouté dans la console Firebase.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: message,
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-8 rounded-[2rem] border-border/50 shadow-sm bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="space-y-6">
          <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto rotate-3">
            <LogIn className="h-12 w-12 text-primary -rotate-3" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Connexion</h1>
            <p className="text-muted-foreground font-medium px-4">
              Connectez-vous avec votre compte Google pour accéder à cet espace et gérer vos annonces en toute sécurité.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="w-full h-16 rounded-2xl font-black uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20 gap-3 text-lg"
          >
            <LogIn className="h-6 w-6" />
            Se connecter avec Google
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest pt-2">
            <ShieldCheck className="h-3 w-3 text-green-500" />
            Tiers de confiance certifié
          </div>
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
