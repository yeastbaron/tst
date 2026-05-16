
"use client";

import { useAuth, useUser, useFirestore } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogIn, ShieldCheck } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, Suspense } from 'react';
import { LoadingLogo } from '@/components/ui/loading-logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
  
  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

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
      const loggedUser = result.user;
      const userRef = doc(db, 'users', loggedUser.uid);
      
      const userSnap = await getDoc(userRef).catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw e;
      });

      const now = new Date().toISOString();

      if (!userSnap.exists()) {
        const userData = {
          uid: loggedUser.uid,
          email: loggedUser.email,
          CompleteName: loggedUser.displayName || '',
          photoURL: loggedUser.photoURL || '',
          role: loggedUser.email === 'ndaw22@gmail.com' ? 'admin' : 'user',
          lastLogin: now
        };
        setDoc(userRef, userData).catch(async (e) => {
           const permErr = new FirestorePermissionError({
             path: userRef.path,
             operation: 'create',
             requestResourceData: userData
           });
           errorEmitter.emit('permission-error', permErr);
        });
      } else {
        setDoc(userRef, {
          lastLogin: now,
          photoURL: loggedUser.photoURL || '',
          CompleteName: loggedUser.displayName || userSnap.data().CompleteName
        }, { merge: true }).catch(async (e) => {
           const permErr = new FirestorePermissionError({
             path: userRef.path,
             operation: 'update',
             requestResourceData: { lastLogin: now }
           });
           errorEmitter.emit('permission-error', permErr);
        });
      }

      toast({
        title: "Bienvenue !",
        description: `Content de vous revoir, ${loggedUser.displayName}`,
      });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      console.error("Login Error:", error);
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
