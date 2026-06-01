"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface LoadingLogoProps {
  message?: string;
}

export function LoadingLogo({ message = "Produits en cours de chargement..." }: LoadingLogoProps) {
  const logo = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in duration-500">
      <div className="relative w-32 h-32 animate-pulse-logo">
        {logo && (
          <Image 
            src={logo} 
            alt="Chargement SalleDeVente.sn" 
            fill 
            className="object-contain"
            priority
          />
        )}
      </div>
      <div className="flex flex-col items-center space-y-3">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
        </div>
        {message && (
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
