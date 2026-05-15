
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  // On vérifie si une application est déjà initialisée
  const existingApp = getApps().length > 0 ? getApp() : null;
  
  // Si aucune application n'existe et que la config est invalide, on ne peut pas continuer proprement
  if (!existingApp && !firebaseConfig.apiKey) {
    console.warn("Firebase: Configuration manquante ou clé API invalide. Vérifiez vos variables d'environnement.");
    // On initialise quand même pour éviter des crashs immédiats de hooks, 
    // mais les appels aux services échoueront de manière plus contrôlée
  }

  const app = existingApp || initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  return { app, db, auth };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export { useMemoFirebase } from './firestore/use-memo-firebase';
