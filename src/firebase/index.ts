
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  try {
    // On vérifie si une application est déjà initialisée
    const existingApp = getApps().length > 0 ? getApp() : null;
    
    // Si aucune application n'existe et que la clé API est vide, on ne peut pas initialiser Firebase proprement
    if (!existingApp && (!firebaseConfig.apiKey || firebaseConfig.apiKey === "")) {
      console.warn("Firebase: La clé API est manquante. L'authentification et Firestore ne fonctionneront pas tant que vous n'aurez pas configuré votre projet dans la console Firebase.");
      // On retourne des nulls castés pour satisfaire les types sans faire planter l'initialisation
      return { 
        app: null as unknown as FirebaseApp, 
        db: null as unknown as Firestore, 
        auth: null as unknown as Auth 
      };
    }

    const app = existingApp || initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    return { app, db, auth };
  } catch (error) {
    console.error("Erreur critique lors de l'initialisation de Firebase:", error);
    return { 
      app: null as unknown as FirebaseApp, 
      db: null as unknown as Firestore, 
      auth: null as unknown as Auth 
    };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export { useMemoFirebase } from './firestore/use-memo-firebase';
