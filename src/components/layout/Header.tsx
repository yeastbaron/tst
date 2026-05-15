
"use client";

import Link from 'next/link';
import { Search, PlusCircle, User, Menu, X, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/lib/constants';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le service d'authentification n'est pas encore prêt. Veuillez patienter ou vérifier votre configuration.",
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue sur SalleDeVente.sn, ${result.user.displayName} !`,
      });

      // Redirection automatique pour l'admin
      if (result.user.email === 'ndaw22@gmail.com') {
        router.push('/admin');
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let title = "Erreur d'authentification";
      let message = "Une erreur est survenue lors de la connexion.";

      if (error.code === 'auth/configuration-not-found') {
        message = "La connexion Google n'est pas activée dans la console Firebase (Authentication > Sign-in method).";
      } else if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'ce domaine';
        title = "Domaine non autorisé";
        message = `Le domaine "${domain}" doit être ajouté dans la console Firebase (Authentication > Settings > Authorized domains).`;
      } else if (error.code === 'auth/popup-blocked') {
        message = "La fenêtre de connexion a été bloquée par votre navigateur.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: message,
      });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion",
        description: "À bientôt sur SalleDeVente.sn !",
      });
      router.push('/');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu */}
        {mounted && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Accédez aux catégories et aux options de vente de SalleDeVente.sn
              </SheetDescription>
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
                    <PlusCircle className="h-5 w-5" /> Vendre un article
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 py-2 text-lg text-secondary font-bold">
                      <ShieldCheck className="h-5 w-5" /> Administration
                    </Link>
                  )}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter text-primary">SalleDeVente.sn</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/products" className="transition-colors hover:text-primary">Acheter</Link>
          <Link href="/sell" className="transition-colors hover:text-primary text-primary font-bold">Vendre</Link>
          {isAdmin && (
            <Link href="/admin" className="transition-colors hover:text-secondary text-secondary font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Search & User Actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-md">
          <div className="hidden sm:flex flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Que cherchez-vous ?"
              className="pl-9 w-full bg-muted/50 border-none focus-visible:ring-primary"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
          </Button>

          {mounted && !loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {user.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="font-bold">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer font-medium">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-listings" className="cursor-pointer font-medium">Mes Annonces</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer font-bold text-secondary flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" /> Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="secondary" className="rounded-full font-bold gap-2 bg-secondary text-secondary-foreground">
                <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Se connecter</span>
              </Button>
            )
          )}
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-2 bg-background animate-in slide-in-from-top duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Ex: iPhone 13 d'occasion..."
              className="pl-10 h-10 w-full"
            />
          </div>
        </div>
      )}
    </header>
  );
}
