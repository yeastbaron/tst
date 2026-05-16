
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
    title: 'iPhone 13 Pro Max - 256Go', 
    description: 'État impeccable, toujours protégé par une coque et un film. Batterie à 92%. Vendu avec boîte originale et chargeur.',
    basePrice: 450000, 
    condition: 'used', 
    category: 'electronics', 
    status: 'active',
    images: ['https://picsum.photos/seed/iphone/800/800', 'https://picsum.photos/seed/iphone2/800/800'],
    sellerId: 'demo-user',
    createdAt: new Date()
  },
  { 
    id: '2', 
    title: 'MacBook Air M2 2023', 
    description: 'Neuf sous emballage. Modèle 13 pouces, 8Go RAM, 256Go SSD. Couleur Minuit. Garantie Apple 1 an.',
    basePrice: 750000, 
    condition: 'new', 
    category: 'electronics', 
    status: 'active',
    images: ['https://picsum.photos/seed/macbook/800/800'],
    sellerId: 'demo-user-2',
    createdAt: new Date()
  },
  { 
    id: '3', 
    title: 'Chaussures Jordan Retro 4', 
    description: 'Authentiques. Jamais portées. Pointure 42. Édition limitée.',
    basePrice: 85000, 
    condition: 'new', 
    category: 'fashion', 
    status: 'active',
    images: ['https://picsum.photos/seed/jordan/800/800'],
    sellerId: 'demo-user',
    createdAt: new Date()
  },
  { 
    id: '4', 
    title: 'Canapé Scandinave 3 Places', 
    description: 'Tissu gris anthracite. Très confortable. Pieds en bois clair. Dimensions : 210cm x 90cm.',
    basePrice: 150000, 
    condition: 'new', 
    category: 'home', 
    status: 'active',
    images: ['https://picsum.photos/seed/sofa/800/800'],
    sellerId: 'demo-user-3',
    createdAt: new Date()
  },
  { 
    id: '5', 
    title: 'PlayStation 5 + 2 Manettes', 
    description: 'Version disque. Utilisée 3 mois. Vendue avec FIFA 24 et Spider-Man 2.',
    basePrice: 380000, 
    condition: 'used', 
    category: 'sports', 
    status: 'active',
    images: ['https://picsum.photos/seed/ps5/800/800'],
    sellerId: 'demo-user',
    createdAt: new Date()
  },
  { 
    id: '6', 
    title: 'Montre Rolex Datejust Gold', 
    description: 'Modèle de collection. Certificat d\'authenticité fourni. Excellent état de marche.',
    basePrice: 2500000, 
    condition: 'used', 
    category: 'fashion', 
    status: 'pending',
    images: ['https://picsum.photos/seed/rolex/800/800'],
    sellerId: 'demo-user-4',
    createdAt: new Date()
  },
];

export function calculatePriceWithCommission(basePrice: number): number {
  return Math.ceil(basePrice * (1 + COMMISSION_RATE));
}
