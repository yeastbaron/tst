import { PlaceHolderImages } from './placeholder-images';

export const COMMISSION_RATE = 0.00;

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Électronique & Multimédia',
    icon: 'Smartphone',
    image: 'https://picsum.photos/seed/elec1/800/600',
    subcategories: [
      'Téléphonie & Tablettes', 
      'Informatique & Bureau', 
      'Image & Son', 
      'Consoles & Jeux vidéo'
    ]
  },
  {
    id: 'fashion',
    name: 'Mode, Beauté & Accessoires',
    icon: 'Shirt',
    image: 'https://picsum.photos/seed/fash1/800/600',
    subcategories: [
      'Vêtements', 
      'Chaussures', 
      'Accessoires de mode', 
      'Bijoux & Montres', 
      'Beauté & Cosmétiques'
    ]
  },
  {
    id: 'home',
    name: 'Maison, Déco & Jardin',
    icon: 'Home',
    image: 'https://picsum.photos/seed/furn1/800/600',
    subcategories: [
      'Ameublement', 
      'Déco & Luminaire', 
      'Électroménager', 
      'Linge de maison', 
      'Jardin & Extérieur', 
      'Bricolage & Quincaillerie'
    ]
  },
  {
    id: 'vehicles',
    name: 'Véhicules, Auto & Moto',
    icon: 'Car',
    image: 'https://picsum.photos/seed/car1/800/600',
    subcategories: [
      'Véhicules (Vente/Location)', 
      'Pièces & Accessoires Auto/Moto', 
      'Entretien & Outillage'
    ]
  },
  {
    id: 'loisirs',
    name: 'Loisirs, Culture & Divertissement',
    icon: 'Dumbbell',
    image: 'https://picsum.photos/seed/sports1/800/600',
    subcategories: [
      'Livres & Revues', 
      'Musique & Films', 
      'Sports & Outdoor', 
      'Jeux & Jouets', 
      'Art & Collections'
    ]
  },
  {
    id: 'baby',
    name: 'Bébé & Puériculture',
    icon: 'Baby',
    image: 'https://picsum.photos/seed/baby1/800/600',
    subcategories: [
      'Équipement de voyage', 
      'Chambre & Sommeil', 
      'Repas & Hygiène'
    ]
  },
  {
    id: 'grocery',
    name: 'Épicerie & Produits Locaux',
    icon: 'Apple',
    image: 'https://picsum.photos/seed/grocery1/800/600',
    subcategories: [
      'Épicerie fine & Sèche', 
      'Boissons'
    ]
  },
  {
    id: 'pro',
    name: 'Services & Professionnels',
    icon: 'Briefcase',
    image: 'https://picsum.photos/seed/pro1/800/600',
    subcategories: [
      'Fournitures de bureau', 
      'Matériel professionnel & Industriel', 
      'Services'
    ]
  }
];

export const MOCK_PRODUCTS = [];

export function calculatePriceWithCommission(basePrice: number): number {
  return Math.ceil(basePrice * (1 + COMMISSION_RATE));
}
