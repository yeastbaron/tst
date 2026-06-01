'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch, 
  getDocs,
  Firestore,
  serverTimestamp,
  getDoc,
  where
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'profile' | 'global' | 'commercial';
  createdAt: any;
  read: boolean;
  link?: string;
}

/**
 * Hook to listen and manage user notifications, and sync them with global announcements.
 */
export function useNotifications(userId: string | undefined) {
  const db = useFirestore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!db || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Subscribe to personal notifications
    const personalNotificationsRef = collection(db, 'users', userId, 'notifications');
    const personalQuery = query(personalNotificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribePersonal = onSnapshot(personalQuery, (snapshot) => {
      const list: AppNotification[] = [];
      let unread = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<AppNotification, 'id'>;
        const item: AppNotification = {
          id: docSnap.id,
          ...data,
          // Format Firestore timestamp if exists, or use current date fallback
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
        list.push(item);
        if (!item.read) {
          unread++;
        }
      });
      setNotifications(list);
      setUnreadCount(unread);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to personal notifications:", err);
      setLoading(false);
    });

    // 2. Fetch and sync global notifications
    const globalNotificationsRef = collection(db, 'global_notifications');
    const globalQuery = query(globalNotificationsRef, orderBy('createdAt', 'desc'));

    const syncGlobalNotifications = async () => {
      try {
        const globalSnap = await getDocs(globalQuery);
        if (globalSnap.empty) return;

        // Check already existing notification IDs in user subcollection to avoid overwrites
        const userNotificationsSnap = await getDocs(personalNotificationsRef);
        const existingIds = new Set<string>();
        userNotificationsSnap.forEach(d => existingIds.add(d.id));

        const batch = writeBatch(db);
        let hasUpdates = false;

        globalSnap.forEach((globalDoc) => {
          const globalId = globalDoc.id;
          // If user doesn't have this global notification copied yet
          if (!existingIds.has(globalId)) {
            const globalData = globalDoc.data();
            const newNotifRef = doc(db, 'users', userId, 'notifications', globalId);
            batch.set(newNotifRef, {
              title: globalData.title,
              message: globalData.message,
              type: globalData.type || 'global',
              link: globalData.link || '',
              read: false,
              createdAt: globalData.createdAt || new Date().toISOString()
            });
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          await batch.commit();
        }
      } catch (err) {
        console.error("Error syncing global notifications:", err);
      }
    };

    syncGlobalNotifications();

    return () => {
      unsubscribePersonal();
    };
  }, [db, userId]);

  // Actions
  const markAsRead = async (notificationId: string) => {
    if (!db || !userId) return;
    try {
      const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!db || !userId || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      let updated = false;

      notifications.forEach((n) => {
        if (!n.read) {
          const notifRef = doc(db, 'users', userId, 'notifications', n.id);
          batch.update(notifRef, { read: true });
          updated = true;
        }
      });

      if (updated) {
        await batch.commit();
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!db || !userId) return;
    try {
      const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
      await deleteDoc(notifRef);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!db || !userId || notifications.length === 0) return;
    if (!confirm("Voulez-vous supprimer toutes vos notifications ?")) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const notifRef = doc(db, 'users', userId, 'notifications', n.id);
        batch.delete(notifRef);
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
}

/**
 * Sends an individual notification to a specific user.
 */
export async function sendNotification(
  db: Firestore, 
  userId: string, 
  notification: {
    title: string;
    message: string;
    type: 'profile' | 'global' | 'commercial';
    link?: string;
  }
) {
  try {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notifRef = doc(db, 'users', userId, 'notifications', notifId);
    await setDoc(notifRef, {
      ...notification,
      read: false,
      createdAt: serverTimestamp()
    });
    return notifId;
  } catch (err) {
    console.error("Error sending notification to user:", userId, err);
    return null;
  }
}

/**
 * Publishes a global or commercial announcement.
 */
export async function sendGlobalNotification(
  db: Firestore,
  notification: {
    title: string;
    message: string;
    type: 'global' | 'commercial';
    link?: string;
  }
) {
  try {
    const globalId = `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const globalRef = doc(db, 'global_notifications', globalId);
    await setDoc(globalRef, {
      ...notification,
      createdAt: new Date().toISOString()
    });
    return globalId;
  } catch (err) {
    console.error("Error sending global notification:", err);
    return null;
  }
}

/**
 * Sends a notification to the administrator (ndaw22@gmail.com).
 */
export async function sendAdminNotification(
  db: Firestore,
  notification: {
    title: string;
    message: string;
    type: 'profile' | 'global' | 'commercial';
    link?: string;
  }
) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'ndaw22@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const adminDoc = querySnapshot.docs[0];
      const adminUid = adminDoc.id;
      return await sendNotification(db, adminUid, notification);
    } else {
      console.warn("Administrator user (ndaw22@gmail.com) not found in Firestore.");
      return null;
    }
  } catch (err) {
    console.error("Error sending admin notification:", err);
    return null;
  }
}
