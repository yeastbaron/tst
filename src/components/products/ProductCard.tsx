
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
      <Card className="overflow-hidden h-full transition-all hover:shadow-md border-border/50">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2">
            <Badge variant={product.condition === 'new' ? 'default' : 'secondary'} className="capitalize">
              {product.condition === 'new' ? 'Neuf' : product.condition === 'used' ? 'Occasion' : 'Reconditionné'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary">
              {finalPrice.toLocaleString('fr-FR')} <small className="text-xs font-normal">FCFA</small>
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
