'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('SalleDeVente Error:', error);
      
      let title = 'Erreur';
      let description = 'Une erreur est survenue. Veuillez réessayer.';

      // Extraire le code ou le message d'erreur original
      const errCode = error?.code || '';
      const errMsg = error?.message || error?.toString() || '';

      // Gestion spécifique des problèmes de connexion
      if (
        errCode === 'unavailable' ||
        errCode === 'network-request-failed' ||
        errMsg.toLowerCase().includes('offline') ||
        errMsg.toLowerCase().includes('network')
      ) {
        title = 'Problème de connexion';
        description = 'Votre connexion internet est trop faible. Veuillez vérifier votre réseau et réessayer ultérieurement.';
      } 
      // Gestion des erreurs de permissions et autres
      else {
        if (errCode === 'permission-denied' || errMsg.includes('Permission Denied')) {
          title = 'Action non autorisée';
          description = "Vous n'avez pas l'autorisation d'effectuer cette action.";
        } else {
          // Remplacement générique de Firebase/Firestore
          description = errMsg
            .replace(/Firebase/gi, 'SalleDeVente')
            .replace(/Firestore/gi, 'SalleDeVente')
            .replace(/Permission Denied/gi, 'Action non autorisée');
        }
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    };

    errorEmitter.on('permission-error', handleError);
    errorEmitter.on('app-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
      errorEmitter.off('app-error', handleError);
    };
  }, [toast]);

  return null;
}
