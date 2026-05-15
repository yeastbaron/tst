
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculatePriceWithCommission } from '@/lib/constants';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    basePrice: number;
    image: string;
    condition: 'new' | 'used' | 'refurbished';
    category: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const finalPrice = calculatePriceWithCommission(product.basePrice);

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md border-border/50 group">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
          />
          <div className="absolute top-1 left-1">
            <Badge variant={product.condition === 'new' ? 'default' : 'secondary'} className="capitalize text-[8px] md:text-[10px] px-1.5 py-0 h-auto">
              {product.condition === 'new' ? 'Neuf' : product.condition === 'used' ? 'Occasion' : 'Recond.'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-2 md:p-3">
          <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5 md:mb-1">
            {product.category}
          </p>
          <h3 className="font-bold text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </CardContent>
        <CardFooter className="px-2 md:px-3 pb-2 md:pb-3 pt-0">
          <div className="flex items-baseline gap-0.5 md:gap-1">
            <span className="text-sm md:text-lg font-black text-primary">
              {finalPrice.toLocaleString('fr-FR')}
            </span>
            <span className="text-[8px] md:text-[10px] font-bold text-primary">FCFA</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
