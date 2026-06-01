import { Metadata } from 'next';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ProductClient from './ProductClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProductData(id: string) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const docData = docSnap.data();
      return {
        id: docSnap.id,
        title: docData.title,
        basePrice: docData.basePrice,
        images: docData.images || [],
        description: docData.description || '',
        allowWholesale: docData.allowWholesale || false,
        wholesaleOnly: docData.wholesaleOnly || false,
        wholesalePrice: docData.wholesalePrice || null,
        minWholesaleQuantity: docData.minWholesaleQuantity || null,
      };
    }
  } catch (error) {
    console.error("Error fetching product data on server:", error);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductData(id);

  if (!product) {
    return {
      title: 'Article introuvable - SalleDeVente.sn',
      description: 'Cet article est introuvable ou a été désactivé sur SalleDeVente.sn.',
    };
  }

  let priceText = '';
  if (product.wholesaleOnly && product.wholesalePrice) {
    priceText = `En gros : ${product.wholesalePrice.toLocaleString('fr-FR')} FCFA/u`;
  } else if (product.basePrice) {
    priceText = `${product.basePrice.toLocaleString('fr-FR')} FCFA`;
  }

  const title = priceText ? `${product.title} - ${priceText} sur SalleDeVente.sn` : `${product.title} - SalleDeVente.sn`;
  const description = product.description 
    ? (product.description.length > 160 ? `${product.description.substring(0, 157)}...` : product.description)
    : `Découvrez cet article "${product.title}" sur SalleDeVente.sn.`;
  const image = product.images?.[0] || 'https://salledevente.sn/logo-sdv.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: image,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function Page() {
  return <ProductClient />;
}
