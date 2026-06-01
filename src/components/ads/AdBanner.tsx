"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AdBannerProps {
  className?: string;
  id?: string;
  imageUrl?: string;
}

export function AdBanner({ className = "", id = "ad-banner", imageUrl }: AdBannerProps) {
  const ad = PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];
  const src = imageUrl || ad.imageUrl;

  return (
    <div className={`w-full overflow-hidden rounded-xl border bg-muted/30 group cursor-pointer hover:border-primary/30 transition-colors ${className}`}>
      <div className="relative w-full h-[80px] sm:h-[100px] md:h-[120px]">
        <Image
          src={src}
          alt="Espace Publicitaire"
          fill
          className="object-cover transition-transform group-hover:scale-[1.01]"
          sizes="100vw"
          data-ai-hint="advertisement banner"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
            Sponsorisé
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-black uppercase tracking-tighter text-sm drop-shadow-md">
            Votre publicité ici
          </span>
        </div>
      </div>
    </div>
  );
}