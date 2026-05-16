
"use client";

import Link from 'next/link';
import { Search, PlusCircle, Menu, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/lib/constants';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronisation du profil utilisateur lors de la connexion
  useEffect(() => {
    if (user && db) {
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.email === 'ndaw22@gmail.com' ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };
      
      setDoc(userRef, userData, { merge: true })
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  }, [user, db]);

  const handleLogin = async () => {
    if (!auth || !db) return;

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${result.user.displayName} !`,
      });

      if (result.user.email === 'ndaw22@gmail.com') {
        router.push('/admin');
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter avec Google.",
      });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion",
        description: "À bientôt !",
      });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {mounted && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SheetDescription className="sr-only">Accédez aux catégories et services</SheetDescription>
              <ScrollArea className="h-full px-6 py-8">
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-bold">Accueil</Link>
                  <div className="space-y-2">
                    <p className="font-semibold text-muted-foreground uppercase text-xs">Catégories</p>
                    {CATEGORIES.map((cat) => (
                      <Link key={cat.id} href={`/products?category=${cat.id}`} className="block py-2 text-lg">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <hr />
                  <Link href="/sell" className="flex items-center gap-2 py-2 text-lg text-primary font-bold">
                    <PlusCircle className="h-5 w-5" /> Vendre
                  </Link>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter text-primary">SalleDeVente.sn</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/products" className="transition-colors hover:text-primary">Acheter</Link>
          <Link href="/sell" className="transition-colors hover:text-primary text-primary font-bold">Vendre</Link>
          {isAdmin && <Link href="/admin" className="text-secondary font-bold">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-md">
          <div className="hidden sm:flex flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher..." className="pl-9 w-full bg-muted/50 border-none" />
          </div>

          {mounted && !loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-white">
                        {user.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem asChild><Link href="/profile">Profil</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/my-listings">Mes Annonces</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link href="/admin" className="text-secondary font-bold">Administration</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold">Déconnexion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="secondary" className="rounded-full font-bold">
                Connexion
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
