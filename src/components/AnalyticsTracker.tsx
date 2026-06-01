'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp, increment } from 'firebase/firestore';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile } = useUser();
  
  const sessionIdRef = useRef<string | null>(null);
  const lastPathnameRef = useRef<string>('');
  const sessionCreatedRef = useRef<boolean>(false);

  // Initialisation de la session au démarrage côté client
  useEffect(() => {
    if (typeof window === 'undefined' || !db) return;

    // Récupérer ou générer le Session ID
    let sessId = sessionStorage.getItem('sdv_session_id');
    if (!sessId) {
      sessId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('sdv_session_id', sessId);
    }
    sessionIdRef.current = sessId;

    // Déterminer le type d'appareil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (window.innerWidth < 768);
    const device = isMobile ? 'mobile' : 'desktop';

    // Créer le document de session dans Firestore
    const sessionDocRef = doc(db, 'analytics_sessions', sessId);
    
    const initSession = async () => {
      try {
        await setDoc(sessionDocRef, {
          sessionId: sessId,
          startedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          durationSeconds: 0,
          device: device,
          userId: user?.uid || null,
          email: user?.email || null,
          address: profile?.address || null,
        }, { merge: true });
        sessionCreatedRef.current = true;
      } catch (err) {
        console.error("Failed to initialize analytics session:", err);
      }
    };

    initSession();

    // Heartbeat périodique (toutes les 30 secondes)
    const interval = setInterval(async () => {
      if (!sessionIdRef.current || !sessionCreatedRef.current) return;
      
      const currentSessId = sessionIdRef.current;
      const onlineDocRef = doc(db, 'online_users', currentSessId);
      const sessDocRef = doc(db, 'analytics_sessions', currentSessId);
      
      const nowPage = window.location.pathname;

      try {
        // 1. Mettre à jour le statut en ligne (heartbeat)
        await setDoc(onlineDocRef, {
          sessionId: currentSessId,
          lastActive: serverTimestamp(),
          page: nowPage,
          userId: user?.uid || null,
          email: user?.email || null,
          address: profile?.address || null,
        });

        // 2. Mettre à jour la session (durée et profil de l'utilisateur s'il s'est connecté)
        const updateData: any = {
          lastActive: serverTimestamp(),
          durationSeconds: increment(30)
        };
        if (user?.uid) {
          updateData.userId = user.uid;
          updateData.email = user.email || null;
        }
        if (profile?.address) {
          updateData.address = profile.address;
        }
        await setDoc(sessDocRef, updateData, { merge: true });
      } catch (err) {
        console.error("Error updating analytics heartbeat:", err);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [db, user?.uid, profile?.address]);

  // Enregistrer chaque changement de page (page view)
  useEffect(() => {
    if (!db || !sessionIdRef.current) return;
    
    // Éviter de logger le même chemin plusieurs fois consécutivement (ex: re-renders)
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (lastPathnameRef.current === fullPath) return;
    lastPathnameRef.current = fullPath;

    const logPageView = async () => {
      try {
        await addDoc(collection(db, 'analytics_page_views'), {
          sessionId: sessionIdRef.current,
          page: pathname,
          fullPath: fullPath,
          timestamp: serverTimestamp(),
          userId: user?.uid || null,
        });
      } catch (err) {
        console.error("Error logging page view:", err);
      }
    };

    // Attendre que la session soit créée ou en cours
    if (sessionCreatedRef.current) {
      logPageView();
    } else {
      const checkTimer = setTimeout(() => {
        logPageView();
      }, 1000);
      return () => clearTimeout(checkTimer);
    }
  }, [pathname, searchParams, db, user?.uid]);

  return null;
}
