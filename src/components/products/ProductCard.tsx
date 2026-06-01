"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    basePrice: number;
    image: string;
    condition: 'new' | 'used' | 'refurbished';
    category: string;
    subcategory?: string;
    isPro?: boolean;
    isSuperSeller?: boolean;
    sellerIsSuper?: boolean;
    sellerSuperExpiresAt?: string | null;
    allowWholesale?: boolean;
    wholesaleOnly?: boolean;
    minWholesaleQuantity?: number;
    wholesalePrice?: number;
    isAuction?: boolean;
    currentBid?: number;
    bidsCount?: number;
    auctionEndAt?: any;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const finalPrice = product.basePrice;

  // Déterminer en temps réel si le badge Super-Vendeur est actif et non expiré
  const isSuperActive = (product.isSuperSeller || product.sellerIsSuper) && (
    !product.sellerSuperExpiresAt || 
    new Date(product.sellerSuperExpiresAt) > new Date()
  );

  const isEnded = product.isAuction && product.auctionEndAt && (
    typeof product.auctionEndAt.toDate === 'function'
      ? product.auctionEndAt.toDate()
      : new Date(product.auctionEndAt)
  ) < new Date();

  const targetHref = product.isAuction ? `/encheres/${product.id}` : `/products/${product.id}`;

  return (
    <Link href={targetHref}>
      <Card className={cn(
        "overflow-hidden h-full transition-all hover:shadow-lg border group relative",
        isSuperActive
          ? "border-amber-400 bg-amber-50/10 hover:border-yellow-500 shadow-sm ring-1 ring-amber-300"
          : product.isPro 
            ? "border-amber-400 bg-amber-50/5 hover:border-amber-500 shadow-sm" 
            : "border-border/50"
      )}>
        {product.isAuction ? (
          isEnded ? (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-500 text-white text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
              Terminée
            </div>
          ) : (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-primary text-white text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
              🔨 Enchère
            </div>
          )
        ) : isSuperActive ? (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md animate-bounce">
            ✨ Super-Vendeur
          </div>
        ) : product.isPro ? (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500 text-white text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
            <Sparkles className="h-2.5 w-2.5 fill-white animate-pulse" /> Pro
          </div>
        ) : null}
        
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
          />
          <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
            <Badge variant={product.condition === 'new' ? 'default' : 'secondary'} className="capitalize text-[8px] md:text-[10px] px-1.5 py-0 h-auto w-fit">
              {product.condition === 'new' ? 'Neuf' : product.condition === 'used' ? 'Occasion' : 'Recond.'}
            </Badge>
            {product.allowWholesale && (
              product.wholesaleOnly ? (
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0 h-auto w-fit border-none">
                  En Gros Uniquement
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0 h-auto w-fit border-none">
                  Gros Dispo
                </Badge>
              )
            )}
          </div>
        </div>
        <CardContent className="p-2 md:p-3">
          <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5 md:mb-1 truncate">
            {product.category} {product.subcategory && `› ${product.subcategory}`}
          </p>
          <h3 className="font-bold text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </CardContent>
        <CardFooter className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
          {product.isAuction ? (
            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-0.5 md:gap-1">
                <span className="text-sm md:text-lg font-black text-indigo-650">
                  {(product.currentBid || product.basePrice).toLocaleString('fr-FR')}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-indigo-650">FCFA</span>
                <span className="text-[8.5px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 uppercase ml-1.5">
                  Offre
                </span>
              </div>
              <div className="text-[9px] md:text-[10px] font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                <span>{product.bidsCount || 0} offre(s)</span>
                <span>•</span>
                {isEnded ? (
                  <span className="text-red-500 font-black">Terminée</span>
                ) : (
                  <span className="text-green-600 font-black animate-pulse">En cours</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-0.5 md:gap-1">
                <span className={cn(
                  "text-sm md:text-lg font-black",
                  product.wholesaleOnly ? "text-purple-600" : product.isPro ? "text-amber-600" : "text-primary"
                )}>
                  {(product.wholesaleOnly && product.wholesalePrice ? product.wholesalePrice : finalPrice).toLocaleString('fr-FR')}
                </span>
                <span className={cn(
                  "text-[8px] md:text-[10px] font-bold",
                  product.wholesaleOnly ? "text-purple-600" : product.isPro ? "text-amber-600" : "text-primary"
                )}>FCFA</span>
                {product.wholesaleOnly && (
                  <span className="text-[8px] md:text-[9px] font-black text-purple-600 bg-purple-50 px-1 py-0.2 rounded border border-purple-200 uppercase ml-1">
                    Gros
                  </span>
                )}
              </div>
              {product.allowWholesale && !product.wholesaleOnly && product.wholesalePrice && (
                <div className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase mt-1">
                  Gros : {product.wholesalePrice.toLocaleString('fr-FR')} FCFA / u (dès {product.minWholesaleQuantity} pces)
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
