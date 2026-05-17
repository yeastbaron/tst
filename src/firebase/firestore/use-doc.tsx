
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc(ref: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      async (serverError: FirestoreError) => {
        console.error('Firestore server error in useDoc:', serverError);
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        setError(permissionError);
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
