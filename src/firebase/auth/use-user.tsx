
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

import { sendNotification, sendAdminNotification } from '../notifications/use-notifications';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  type: 'particulier' | 'professionnel' | '';
  isBanned: boolean;
  createdAt: any;
  proStatus?: 'pending' | 'approved' | 'rejected' | null;
  requestedProMonths?: number;
  proExpiresAt?: any;
  isSuperSeller?: boolean;
  superSellerExpiresAt?: any;
  superSellerRequest?: { status: string; durationDays: number; [key: string]: any } | null;
  shopName?: string;
  shopLogo?: string;
  shopCover?: string;
  shopDescription?: string;
  shopSlug?: string;
}

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              // Vérifier si l'abonnement pro a expiré
              if (data.type === 'professionnel' && data.proExpiresAt) {
                const expirationDate = new Date(data.proExpiresAt);
                if (expirationDate < new Date()) {
                  // Mettre à jour Firestore
                  updateDoc(userDocRef, {
                    type: 'particulier',
                    proStatus: null
                  }).then(() => {
                    sendNotification(db, firebaseUser.uid, {
                      title: "Abonnement PRO expiré ⚠️",
                      message: "Votre abonnement professionnel a expiré. Votre boutique a été temporairement fermée et vous êtes repassé en compte particulier.",
                      type: "profile",
                      link: "/badges"
                    });
                  }).catch((err) => {
                    console.error("Erreur lors du retour automatique au statut particulier :", err);
                  });
                  // Ajuster localement l'état avant le prochain snapshot
                  data.type = 'particulier';
                  data.proStatus = null;
                }
              }

              // Vérifier si le badge super-vendeur a expiré
              if (data.isSuperSeller && data.superSellerExpiresAt) {
                const expirationDate = new Date(data.superSellerExpiresAt);
                if (expirationDate < new Date()) {
                  // Ajuster localement l'état avant le prochain snapshot
                  // (Nous ne mettons pas à jour Firestore car ce champ est restreint par les règles de sécurité pour les utilisateurs standard)
                  data.isSuperSeller = false;
                }
              }
              setProfile(data);
            } else {
              // Créer le profil par défaut dans Firestore
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                address: '',
                phone: '',
                type: '',
                isBanned: false,
                createdAt: serverTimestamp()
              };
              setDoc(userDocRef, defaultProfile).then(() => {
                sendNotification(db, firebaseUser.uid, {
                  title: "Bienvenue sur SalleDeVente.sn ! 🎉",
                  message: "Nous sommes ravis de vous compter parmi nos membres ! Explorez les meilleures opportunités, publiez vos annonces en quelques clics et développez votre activité. Complétez dès maintenant votre profil pour configurer vos informations et, si vous êtes un professionnel, demander l'activation de votre boutique dédiée afin de booster vos ventes !",
                  type: "profile",
                  link: "/profile"
                });
                sendAdminNotification(db, {
                  title: "👥 Nouvel inscrit",
                  message: `Un nouvel utilisateur s'est inscrit : ${defaultProfile.name || defaultProfile.email || 'Utilisateur'} (${defaultProfile.email}).`,
                  type: "profile",
                  link: "/admin"
                });
              }).catch((err) => {
                console.error("Erreur d'initialisation du profil :", err);
              });
              setProfile(defaultProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Erreur onSnapshot profil :", err);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [auth, db]);

  return { user, profile, loading };
}

