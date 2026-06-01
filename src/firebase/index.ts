
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initialisation sécurisée de Firebase pour éviter les blocages au démarrage.
 */
export function initializeFirebase() {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // On force l'utilisation de l'instance Firestore par défaut.
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    return { app, db, auth };
  } catch (error) {
    console.warn("Firebase n'a pas pu être initialisé correctement, l'application fonctionnera en mode limité.");
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
export * from './notifications/use-notifications';
