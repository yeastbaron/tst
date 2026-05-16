
import { PlaceHolderImages } from './placeholder-images';

export const COMMISSION_RATE = 0.10;

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Électronique',
    icon: 'Smartphone',
    image: PlaceHolderImages.find(img => img.id === 'electronics')?.imageUrl,
    subcategories: ['Téléphones', 'Ordinateurs', 'Tablettes', 'Téléviseurs', 'Audio', 'Accessoires']
  },
  {
    id: 'fashion',
    name: 'Mode',
    icon: 'Shirt',
    image: PlaceHolderImages.find(img => img.id === 'fashion')?.imageUrl,
    subcategories: ['Vêtements Homme', 'Vêtements Femme', 'Enfants', 'Chaussures', 'Sacs', 'Montres']
  },
  {
    id: 'home',
    name: 'Maison',
    icon: 'Home',
    image: PlaceHolderImages.find(img => img.id === 'home')?.imageUrl,
    subcategories: ['Meubles', 'Électroménager', 'Décoration', 'Linge de maison', 'Cuisine']
  },
  {
    id: 'vehicles',
    name: 'Véhicules',
    icon: 'Car',
    image: PlaceHolderImages.find(img => img.id === 'cars')?.imageUrl,
    subcategories: ['Voitures', 'Motos', 'Pièces Détachées', 'Vélos']
  },
  {
    id: 'beauty',
    name: 'Beauté & Santé',
    icon: 'Sparkles',
    image: PlaceHolderImages.find(img => img.id === 'beauty')?.imageUrl,
    subcategories: ['Maquillage', 'Soins Cheveux', 'Parfums', 'Hygiène']
  },
  {
    id: 'sports',
    name: 'Sports & Loisirs',
    icon: 'Dumbbell',
    image: PlaceHolderImages.find(img => img.id === 'sports')?.imageUrl,
    subcategories: ['Fitness', 'Jeux Vidéo', 'Jouets', 'Instruments de Musique']
  },
  {
    id: 'pro',
    name: 'Matériel Pro',
    icon: 'Briefcase',
    image: PlaceHolderImages.find(img => img.id === 'pro')?.imageUrl,
    subcategories: ['Outillage', 'Fournitures de Bureau', 'Agriculture']
  }
];

export const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max - 256GB',
    description: 'État comme neuf, batterie 100%. Vendu avec boîte et accessoires.',
    basePrice: 750000,
    condition: 'used',
    category: 'electronics',
    images: ['https://picsum.photos/seed/phone1/800/800'],
    status: 'active'
  },
  {
    id: '2',
    title: 'MacBook Air M2 13"',
    description: 'Neuf scellé, 8GB RAM, 256GB SSD. Garantie 1 an.',
    basePrice: 650000,
    condition: 'new',
    category: 'electronics',
    images: ['https://picsum.photos/seed/mac1/800/800'],
    status: 'active'
  },
  {
    id: '3',
    title: 'Nike Air Jordan 4 Retro',
    description: 'Taille 42, jamais portées. Édition limitée.',
    basePrice: 120000,
    condition: 'new',
    category: 'fashion',
    images: ['https://picsum.photos/seed/shoes1/800/800'],
    status: 'active'
  },
  {
    id: '4',
    title: 'Canapé Scandinave 3 Places',
    description: 'Tissu gris anthracite, pieds en bois naturel. Très bon état.',
    basePrice: 180000,
    condition: 'used',
    category: 'home',
    images: ['https://picsum.photos/seed/sofa1/800/800'],
    status: 'active'
  }
];

export function calculatePriceWithCommission(basePrice: number): number {
  return Math.ceil(basePrice * (1 + COMMISSION_RATE));
}
