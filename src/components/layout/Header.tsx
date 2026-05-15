
"use client";

import Link from 'next/link';
import { Search, PlusCircle, User, Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CATEGORIES } from '@/lib/constants';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu - Hydration safe */}
        {mounted ? (
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
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="md:hidden" disabled>
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter text-primary">SalleDeVente.sn</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/products" className="transition-colors hover:text-primary">Acheter</Link>
          <Link href="/sell" className="transition-colors hover:text-primary text-primary font-bold">Vendre</Link>
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

          <Button variant="secondary" size="icon" className="rounded-full bg-secondary text-secondary-foreground">
            <User className="h-5 w-5" />
          </Button>
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
