'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, PlusCircle, Menu, LogOut, User as UserIcon, 
  LogIn, X, ChevronDown, ChevronRight, Sparkles,
  Bell, ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, useNotifications } from '@/firebase';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, profile } = useUser();
  const { unreadCount } = useNotifications(user?.uid);

  const isPro = profile?.type === 'professionnel';
  const shopLink = isPro ? `/shops/${profile?.shopSlug || profile?.uid || user?.uid}` : '/profile';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setIsSearchOpen(false);
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
        
        {/* MOBILE MENU SHEET */}
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
                
                {/* ACCORDION MOBILE CATEGORIES */}
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-sm font-black uppercase hover:text-primary transition-colors border-b pb-2">Accueil</Link>
                  <Link href="/shops" className="text-sm font-black uppercase hover:text-primary transition-colors border-b pb-2">Nos boutiques</Link>
                  <Link href="/encheres" className="text-sm font-black uppercase hover:text-primary transition-colors border-b pb-2">Enchères</Link>
                  
                  {/* Lien Premium mobile avec haute visibilité */}
                  <Link 
                    href="/badges" 
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 border border-amber-300 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-pulse"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 fill-white" />
                      Services Premium & Badges
                    </span>
                    <span className="bg-red-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                      Nouveau
                    </span>
                  </Link>

                  <div className="space-y-1">
                    <p className="font-black text-muted-foreground uppercase text-[10px] tracking-widest mb-2">Catégories</p>
                    {CATEGORIES.map((cat) => {
                      const isExpanded = expandedMobileCategory === cat.id;
                      return (
                        <div key={cat.id} className="border-b border-border/40 py-1">
                          <button
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                            className="w-full flex items-center justify-between text-left py-2 text-xs font-bold text-foreground hover:text-primary transition-all"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
                          </button>
                          
                          {isExpanded && (
                            <div className="pl-3 pr-2 py-2 bg-muted/40 rounded-xl space-y-1 animate-in slide-in-from-top-1 duration-150 my-1">
                              <Link 
                                href={`/products?category=${cat.id}`}
                                className="block py-1 text-[11px] font-black text-primary hover:underline"
                              >
                                Tout afficher dans {cat.name}
                              </Link>
                              {cat.subcategories.map((subcat) => (
                                <Link
                                  key={subcat}
                                  href={`/products?category=${cat.id}&subcategory=${encodeURIComponent(subcat)}`}
                                  className="block py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all"
                                >
                                  {subcat}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <hr className="border-primary/10" />
                  <Link href="/sell" className="flex items-center gap-2 py-2 text-xs text-secondary font-black uppercase">
                    <PlusCircle className="h-5 w-5" /> Vendre
                  </Link>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <div className="relative w-40 h-12 md:w-56 md:h-16">
            {mounted && logoUrl && (
              <Image src={logoUrl} alt="SalleDeVente.sn" fill className="object-contain" priority />
            )}
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-[11px] font-black uppercase tracking-widest text-foreground/80">
          <Link href="/products" className="transition-colors hover:text-primary py-2">Acheter</Link>
          <Link href="/shops" className="transition-colors hover:text-primary py-2">Nos boutiques</Link>
          <Link href="/encheres" className="transition-colors hover:text-primary py-2">Enchères</Link>
          
          {/* Bouton Premium & Badges luxueux avec fort impact visuel */}
          <Link 
            href="/badges" 
            className="relative transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-450 to-yellow-400 text-white font-black text-[9px] tracking-wider uppercase shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/40 border border-amber-300 ml-1 mr-1"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white animate-pulse" />
            <span>Premium & Badges</span>
            {/* Glowing gold dot indicator */}
            <span className="absolute top-[-2px] right-[-2px] w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-ping" />
            <span className="absolute top-[-2px] right-[-2px] w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          </Link>
          
          {/* Dropdown Catégories Premium avec Cascading Hovers */}
          <div className="relative group">
            <button className="flex items-center gap-1 py-2 text-[11px] font-black uppercase tracking-widest text-foreground/80 hover:text-primary transition-all focus:outline-none">
              Catégories <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Mega Dropdown Panel */}
            <div className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-border/60 rounded-2xl shadow-xl p-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="relative group/sub">
                    <Link 
                      href={`/products?category=${cat.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-primary transition-colors" />
                    </Link>
                    
                    {/* Subcategories Cascade Flyer to the Right */}
                    <div className="absolute top-[-12px] left-full ml-1 w-[260px] bg-white border border-border/60 rounded-2xl shadow-xl p-3 opacity-0 invisible translate-x-1 group-hover/sub:opacity-100 group-hover/sub:visible group-hover/sub:translate-x-0 transition-all duration-300 z-50">
                      <div className="px-2 pb-2 mb-2 border-b">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary">{cat.name}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Link 
                          href={`/products?category=${cat.id}`}
                          className="block px-2 py-1.5 rounded-lg text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 transition-colors mb-1.5"
                        >
                          Tout afficher
                        </Link>
                        {cat.subcategories.map((subcat) => (
                          <Link
                            key={subcat}
                            href={`/products?category=${cat.id}&subcategory=${encodeURIComponent(subcat)}`}
                            className="block px-2 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                          >
                            {subcat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/sell" className="transition-colors text-secondary hover:text-secondary/80 flex items-center gap-1 font-black py-2">
            <PlusCircle className="h-4 w-4" /> Vendre
          </Link>
        </nav>

        {/* RIGHT SIDE: SEARCH AND USER ACCOUNT */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end max-w-[200px]">
          
          {/* Icône Loupe précédant la connexion pour la recherche rapide */}
          <Button 
            onClick={() => setIsSearchOpen(true)} 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-foreground hover:bg-muted h-10 w-10 flex-shrink-0"
            title="Recherche rapide"
          >
            <Search className="h-5 w-5" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative focus:outline-none transition-transform hover:scale-105 active:scale-95 flex-shrink-0">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Utilisateur'} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-black uppercase text-sm">
                      {user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || 'SD'}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50 bg-white">
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
                
                {/* Nouveau : Ma boutique */}
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary font-bold my-1 cursor-pointer">
                  <Link href={shopLink} className="w-full flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Ma boutique
                  </Link>
                </DropdownMenuItem>

                {/* Nouveau : Notifications */}
                <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-primary font-bold my-1 cursor-pointer">
                  <Link href="/notifications" className="w-full flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-[10px] font-black text-white px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
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
            /* Icône de connexion au lieu du texte "Connexion" */
            <Button variant="default" size="icon" className="rounded-full shadow-lg shadow-primary/20 h-10 w-10 bg-primary text-white hover:bg-primary/95 flex-shrink-0" asChild>
              <Link href="/login" title="Se connecter">
                <LogIn className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* MODAL DE RECHERCHE RAPIDE INTERACTIF & LUXUEUX */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200" 
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-primary/10 animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="font-black uppercase text-xs tracking-widest text-primary">Recherche Rapide</h3>
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                autoFocus
                type="search" 
                placeholder="Que recherchez-vous aujourd'hui ?" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="pl-12 pr-4 h-14 w-full bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/20 text-base font-bold" 
              />
            </form>
            
            <div className="mt-6 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Catégories Populaires</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/products?category=${cat.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all text-foreground/80"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
