
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, PlusCircle, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';


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
                <div className="mb-8 h-12 relative">
                  {logoUrl && (
                    <Image src={logoUrl} alt="Logo" fill className="object-contain" priority />
                  )}
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
            {mounted && logoUrl && (
              <Image src={logoUrl} alt="SalleDeVente.sn" fill className="object-contain" priority />
            )}
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-wide">
          <Link href="/products" className="transition-colors hover:text-primary">Acheter</Link>
          <Link href="/sell" className="transition-colors text-secondary hover:text-secondary/80 flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4" /> Vendre
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-md">
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Rechercher..." 
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="pl-10 w-full bg-muted/30 border-none rounded-full focus-visible:ring-primary/20" 
            />
          </form>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none transition-transform hover:scale-105 active:scale-95">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Utilisateur'} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-black uppercase text-sm">
                      {user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || 'SD'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50">
                <DropdownMenuLabel className="font-bold text-xs uppercase text-muted-foreground px-3 py-2">
                  Mon Compte
                </DropdownMenuLabel>
                <div className="px-3 py-1.5 mb-2">
                  <p className="text-sm font-black truncate">{user.displayName || 'Utilisateur'}</p>
                  <p className="text-[10px] font-medium text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary font-bold my-1 cursor-pointer">
                  <Link href="/my-listings" className="w-full flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Mes annonces
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary font-bold my-1 cursor-pointer">
                  <Link href="/profile" className="w-full flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-xl focus:bg-red-50 focus:text-red-600 font-bold my-1 text-red-500 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" className="rounded-full font-black uppercase tracking-tight px-6 shadow-lg shadow-primary/20" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
