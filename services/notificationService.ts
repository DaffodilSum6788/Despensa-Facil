import * as Notifications from 'expo-notifications';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { AppNotification } from '@/types/notification';
import { NOTIFICATION_INTERVALS_DAYS } from '@/constants/notificationIntervals';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function notificationsCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'notifications');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync() as any;
  let finalStatus = settings.status;

  if (finalStatus !== 'granted') {
    const result = await Notifications.requestPermissionsAsync() as any;
    finalStatus = result.status;
  }

  return finalStatus === 'granted';
}

export async function scheduleProductNotifications(
  productId: string,
  productName: string,
  expirationDate: Date
): Promise<string[]> {
  const notificationIds: string[] = [];

  for (const daysBefore of NOTIFICATION_INTERVALS_DAYS) {
    const triggerDate = new Date(expirationDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(9, 0, 0, 0); // Notificar às 9h

    // Só agenda se a data for no futuro
    if (triggerDate.getTime() <= Date.now()) continue;

    let body: string;
    if (daysBefore === 0) {
      body = `"${productName}" vence hoje!`;
    } else if (daysBefore === 1) {
      body = `"${productName}" vence amanhã!`;
    } else {
      body = `"${productName}" vence em ${daysBefore} dias.`;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Despensa Fácil',
        body,
        data: { productId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    notificationIds.push(id);
  }

  return notificationIds;
}

export async function cancelProductNotifications(
  notificationIds: string[]
): Promise<void> {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Notification may already have fired
    }
  }
}

export async function saveNotificationToHistory(data: {
  productId: string;
  productName: string;
  expirationDate: Date;
  daysRemaining: number;
}): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await addDoc(collection(db, 'users', uid, 'notifications'), {
    productId: data.productId,
    productName: data.productName,
    expirationDate: Timestamp.fromDate(data.expirationDate),
    daysRemaining: data.daysRemaining,
    read: false,
    triggeredAt: Timestamp.now(),
  });
}

export function subscribeToNotifications(
  callback: (notifications: AppNotification[]) => void,
  onError: (error: Error) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onError(new Error('User not authenticated'));
    return () => {};
  }
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('triggeredAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const notifications: AppNotification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      callback(notifications);
    },
    onError
  );
}

export async function markNotificationsAsRead(ids: string[]): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, 'users', uid, 'notifications', id);
    batch.update(ref, { read: true });
  });
  await batch.commit();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const q = query(
    collection(db, 'users', uid, 'notifications'),
    where('read', '==', false)
  );

  const snapshot = await (await import('firebase/firestore')).getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}
