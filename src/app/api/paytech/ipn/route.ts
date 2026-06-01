import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import * as admin from 'firebase-admin';

// Initialisation sécurisée du SDK d'administration Firebase (Isomorphe)
if (!admin.apps.length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(sa))
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    // 1. Lire le corps de la requête (supporte JSON et URL-encoded)
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    const { 
      ref_command, 
      item_price, 
      api_key_sha256, 
      api_secret_sha256, 
      custom_field 
    } = body;

    // 2. Valider l'authenticité de la requête en comparant les empreintes SHA256 des clés API locales
    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_SECRET_KEY || process.env.PAYTECH_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Missing PayTech credentials for IPN validation.");
      return new Response("Configuration Error", { status: 500 });
    }

    const expectedApiKeyHash = createHash('sha256').update(apiKey).digest('hex');
    const expectedApiSecretHash = createHash('sha256').update(apiSecret).digest('hex');

    if (api_key_sha256 !== expectedApiKeyHash || api_secret_sha256 !== expectedApiSecretHash) {
      console.warn("Unauthorized IPN call: Hash mismatch.");
      return new Response("Unauthorized", { status: 401 });
    }

    // 3. Parser les métadonnées de transaction
    if (!custom_field) {
      console.error("Missing custom_field in IPN payload.");
      return new Response("Bad Request", { status: 400 });
    }

    const customData = JSON.parse(custom_field);
    const { userId, type, durationDays } = customData;

    if (!userId || !type) {
      console.error("Incomplete customData inside custom_field:", customData);
      return new Response("Bad Request", { status: 400 });
    }

    // 4. Mettre à jour l'utilisateur et ses annonces via Admin SDK
    const userDocRef = db.collection('users').doc(userId);
    const userSnap = await userDocRef.get();

    if (!userSnap.exists) {
      console.error(`User with UID ${userId} not found in Firestore.`);
      return new Response("User Not Found", { status: 404 });
    }

    const userData = userSnap.data() || {};
    const batch = db.batch();

    // Calculer les dates d'expiration
    const now = new Date();
    
    if (type === 'pro') {
      const proExpiresAt = new Date();
      proExpiresAt.setDate(proExpiresAt.getDate() + 30);
      const expiresAtStr = proExpiresAt.toISOString();

      // Mettre à jour le profil de l'utilisateur
      batch.update(userDocRef, {
        type: 'professionnel',
        proStatus: 'approved',
        isProPending: false,
        proExpiresAt: expiresAtStr
      });

      // Propager le statut PRO sur toutes ses annonces existantes
      const productsQuery = await db.collection('products').where('sellerId', '==', userId).get();
      productsQuery.forEach((docSnap) => {
        batch.update(docSnap.ref, { isPro: true });
      });

      // Envoyer une notification in-app à l'utilisateur
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const notifRef = userDocRef.collection('notifications').doc(notifId);
      batch.set(notifRef, {
        title: "Boutique PRO Activée ! 👑",
        message: "Félicitations ! Votre paiement a été validé et votre abonnement Professionnel est actif pour 30 jours. Votre vitrine commerciale est en ligne.",
        type: "profile",
        link: "/profile",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } else if (type === 'super_seller') {
      const days = parseInt(durationDays || '7', 10);
      const superExpiresAt = new Date();
      superExpiresAt.setDate(superExpiresAt.getDate() + days);
      const expiresAtStr = superExpiresAt.toISOString();

      // Mettre à jour le profil de l'utilisateur
      batch.update(userDocRef, {
        isSuperSeller: true,
        superSellerExpiresAt: expiresAtStr,
        superSellerRequest: {
          status: 'approved',
          approvedAt: now.toISOString(),
          durationDays: days
        }
      });

      // Propager le badge Super-Vendeur sur toutes ses annonces existantes
      const productsQuery = await db.collection('products').where('sellerId', '==', userId).get();
      productsQuery.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          sellerIsSuper: true,
          sellerSuperExpiresAt: expiresAtStr
        });
      });

      // Envoyer une notification in-app à l'utilisateur
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const notifRef = userDocRef.collection('notifications').doc(notifId);
      batch.set(notifRef, {
        title: "Badge Super-Vendeur Activé ! ✨",
        message: `Votre paiement a été validé. Votre badge Super-Vendeur est actif pour une durée de ${days} jours. Vos annonces sont maintenant mises en avant !`,
        type: "profile",
        link: "/profile",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 5. Enregistrer / Mettre à jour le statut de la transaction
    const txDocRef = db.collection('transactions').doc(ref_command);
    batch.set(txDocRef, {
      status: 'completed',
      userId: userId,
      type: type,
      amount: parseInt(item_price || '0', 10),
      durationDays: durationDays ? parseInt(durationDays, 10) : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Exécuter toutes les écritures atomiquement
    await batch.commit();

    console.log(`PayTech IPN: Payment validated and activated successfully for user ${userId} (Tx: ${ref_command}).`);
    
    // Répondre 200 OK à PayTech pour couper la boucle de retouches de notifications
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Error processing PayTech IPN webhook:", err);
    return new Response(err.message || "Internal Server Error", { status: 500 });
  }
}
