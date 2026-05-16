
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);
  const logoUrl = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl;

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t bg-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-12">
                {logoUrl && (
                  <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                )}
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-medium">
              SalleDeVente.sn est la plateforme intermédiaire de confiance au Sénégal. Nous connectons acheteurs et vendeurs en garantissant sécurité, anonymat et qualité de service.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wider text-xs mb-6 text-primary">Explorer</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/products" className="hover:text-primary transition-colors">Tous les produits</Link></li>
              <li><Link href="/sell" className="hover:text-secondary transition-colors">Vendre un article</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Questions Fréquentes</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Support Client</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wider text-xs mb-6 text-primary">Confidentialité</h4>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed font-medium">
              <p>
                Propriété exclusive de <strong>Ogo&apos;o SARL</strong><br />
                Dakar, BP 25000, Sénégal<br />
                RC : SN-DKR-2024-B-XXXX
              </p>
              <Link href="/terms" className="inline-block text-primary font-bold hover:underline">Conditions Générales d&apos;Utilisation</Link>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-primary/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            &copy; {year ?? '...'} SalleDeVente.sn par Ogo&apos;o SARL. Expertise & Confiance Digitale.
          </p>
        </div>
      </div>
    </footer>
  );
}
