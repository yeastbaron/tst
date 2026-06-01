import { Metadata } from 'next';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ShopClient from './ShopClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function getShopData(id: string) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Try slug query
    const q = query(collection(db, 'users'), where('shopSlug', '==', id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return {
        uid: docData.uid,
        name: docData.name,
        type: docData.type,
        isBanned: docData.isBanned,
        proExpiresAt: docData.proExpiresAt || null,
        shopName: docData.shopName || null,
        shopLogo: docData.shopLogo || null,
        shopCover: docData.shopCover || null,
        shopDescription: docData.shopDescription || null,
        shopSlug: docData.shopSlug || null,
      };
    }

    // 2. Try direct doc fetch by UID (id)
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const docData = docSnap.data();
      return {
        uid: docData.uid,
        name: docData.name,
        type: docData.type,
        isBanned: docData.isBanned,
        proExpiresAt: docData.proExpiresAt || null,
        shopName: docData.shopName || null,
        shopLogo: docData.shopLogo || null,
        shopCover: docData.shopCover || null,
        shopDescription: docData.shopDescription || null,
        shopSlug: docData.shopSlug || null,
      };
    }
  } catch (error) {
    console.error("Error fetching shop data on server:", error);
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = await getShopData(id);

  if (!shop) {
    return {
      title: 'Boutique introuvable - SalleDeVente.sn',
      description: 'Cette boutique est introuvable ou a été désactivée sur SalleDeVente.sn.',
    };
  }

  // Vérifier si la boutique est active, PRO et non bannie
  const isProActive = shop.type === 'professionnel' && 
    !shop.isBanned &&
    (!shop.proExpiresAt || new Date(shop.proExpiresAt) > new Date());

  if (!isProActive) {
    return {
      title: 'Boutique provisoirement fermée - SalleDeVente.sn',
      description: 'Cette boutique n\'est plus accessible car l\'abonnement professionnel du vendeur a expiré ou le profil est repassé en compte particulier.',
    };
  }

  const finalShopName = shop.shopName || shop.name || "Boutique Officielle";
  const title = `${finalShopName} - SalleDeVente.sn`;
  const description = shop.shopDescription || `Découvrez la boutique officielle de ${finalShopName} sur SalleDeVente.sn.`;
  const image = shop.shopLogo || shop.shopCover || 'https://salledevente.sn/logo-sdv.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: image,
          alt: finalShopName,
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
  return <ShopClient />;
}
