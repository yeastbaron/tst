
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

// Mock products are removed to ensure only Firestore data is displayed
export const MOCK_PRODUCTS = [];

export function calculatePriceWithCommission(basePrice: number): number {
  return Math.ceil(basePrice * (1 + COMMISSION_RATE));
}
