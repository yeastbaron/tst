
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Search, PlusCircle, Menu, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  const handleLogin = async () => {
    if (!auth) return;
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
      toast({ title: "Déconnexion", description: "À bientôt !" });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {mounted && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-primary/10">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Catégories et services</SheetDescription>
              <ScrollArea className="h-full px-6 py-8">
                <div className="mb-8">
                  <Image src={logoUrl} alt="Logo" width={140} height={50} className="object-contain" />
                </div>
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-bold hover:text-primary transition-colors">Accueil</Link>
                  <div className="space-y-2">
                    <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Catégories</p>
                    {CATEGORIES.map((cat) => (
                      <Link key={cat.id} href={`/products?category=${cat.id}`} className="block py-2 text-lg hover:text-primary transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <hr className="border-primary/10" />
                  <Link href="/sell" className="flex items-center gap-2 py-2 text-lg text-secondary font-black uppercase">
                    <PlusCircle className="h-5 w-5" /> Vendre
                  </Link>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        <Link href="/" className="flex items-center">
          <div className="relative w-40 h-12 md:w-56 md:h-16">
            <Image src={logoUrl} alt="SalleDeVente.sn" fill className="object-contain" priority />
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-wide">
          <Link href="/products" className="transition-colors hover:text-primary">Acheter</Link>
          <Link href="/sell" className="transition-colors text-secondary hover:text-secondary/80 flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4" /> Vendre
          </Link>
          {isAdmin && <Link href="/admin" className="text-primary hover:text-primary/80 flex items-center gap-1">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-md">
          <div className="hidden lg:flex flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher..." className="pl-10 w-full bg-muted/30 border-none rounded-full focus-visible:ring-primary/20" />
          </div>

          {mounted && !loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all overflow-hidden">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {user.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-primary/10 shadow-xl">
                  <div className="px-3 py-4 bg-muted/30 rounded-xl mb-2">
                    <p className="font-black text-sm uppercase truncate">{user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="rounded-lg font-bold"><Link href="/profile" className="w-full">Mon Profil</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg font-bold"><Link href="/my-listings" className="w-full">Mes Annonces</Link></DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg font-black text-primary uppercase">
                      <Link href="/admin" className="w-full flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Administration</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg font-black uppercase text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="default" className="rounded-full font-black uppercase tracking-tight px-6 shadow-lg shadow-primary/20">
                Connexion
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
