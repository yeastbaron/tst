
"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function LoadingLogo() {
  const logo = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-48 h-48 animate-pulse-logo">
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
      <div className="flex gap-3">
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
      </div>
    </div>
  );
}
