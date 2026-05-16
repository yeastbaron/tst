
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { LoadingLogo } from '@/components/ui/loading-logo';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    setServices(initializeFirebase());
  }, []);

  // Afficher le loader pendant l'initialisation de Firebase
  if (!services) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <LoadingLogo />
      </div>
    );
  }

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
