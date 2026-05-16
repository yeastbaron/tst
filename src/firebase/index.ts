
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services with robust error handling and explicit database reference.
 */
export function initializeFirebase() {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Explicitly target the (default) database instance to ensure rules are correctly applied.
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    return { app, db, auth };
  } catch (error) {
    console.error("Critical Firebase Initialization Error:", error);
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
