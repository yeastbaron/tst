
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  try {
    // Évite les erreurs d'initialisation multiple en vérifiant l'existence d'une app
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Utilise explicitement l'instance par défaut pour s'assurer que les règles SalleDeVente sont appliquées
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    return { app, db, auth };
  } catch (error) {
    console.error("Erreur critique d'initialisation Firebase:", error);
    // Retourne un objet vide structuré pour ne pas faire planter le client-provider
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
