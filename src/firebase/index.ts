
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  try {
    const existingApp = getApps().length > 0 ? getApp() : null;
    const app = existingApp || initializeApp(firebaseConfig);
    
    // Utilisation de la base de données (default) pour assurer le déploiement des règles de sécurité
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
