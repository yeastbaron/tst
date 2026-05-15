
export const COMMISSION_RATE = 0.10;

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Électronique',
    icon: 'Smartphone',
    subcategories: ['Téléphones', 'Ordinateurs', 'Tablettes', 'Téléviseurs', 'Audio', 'Accessoires']
  },
  {
    id: 'fashion',
    name: 'Mode',
    icon: 'Shirt',
    subcategories: ['Vêtements Homme', 'Vêtements Femme', 'Enfants', 'Chaussures', 'Sacs', 'Montres']
  },
  {
    id: 'home',
    name: 'Maison',
    icon: 'Home',
    subcategories: ['Meubles', 'Électroménager', 'Décoration', 'Linge de maison', 'Cuisine']
  },
  {
    id: 'vehicles',
    name: 'Véhicules',
    icon: 'Car',
    subcategories: ['Voitures', 'Motos', 'Pièces Détachées', 'Vélos']
  },
  {
    id: 'beauty',
    name: 'Beauté & Santé',
    icon: 'Sparkles',
    subcategories: ['Maquillage', 'Soins Cheveux', 'Parfums', 'Hygiène']
  },
  {
    id: 'sports',
    name: 'Sports & Loisirs',
    icon: 'Dumbbell',
    subcategories: ['Fitness', 'Jeux Vidéo', 'Jouets', 'Instruments de Musique']
  },
  {
    id: 'pro',
    name: 'Matériel Pro',
    icon: 'Briefcase',
    subcategories: ['Outillage', 'Fournitures de Bureau', 'Agriculture']
  }
];

export function calculatePriceWithCommission(basePrice: number): number {
  return Math.ceil(basePrice * (1 + COMMISSION_RATE));
}
