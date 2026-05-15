
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    setServices(initializeFirebase());
  }, []);

  // Si Firebase n'est pas encore initialisé (pendant le montage), on ne rend rien
  if (!services) return null;

  // Si les services sont null (config manquante), on rend quand même les enfants 
  // mais les fonctionnalités Firebase seront inactives/échoueront silencieusement
  if (!services.app) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider app={services.app} db={services.db} auth={services.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
