import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { AppNotification } from '@/types/notification';
import {
  subscribeToNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  requestNotificationPermissions,
  saveNotificationToHistory,
} from '@/services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let responseSubscription: Notifications.EventSubscription | undefined;
    let receivedSubscription: Notifications.EventSubscription | undefined;

    const setup = async () => {
      try {
        await requestNotificationPermissions();
      } catch (e) {
        // Permissions may fail in Expo Go - non-critical
        console.warn('Notification permissions error:', e);
      }

      try {
        unsubscribe = subscribeToNotifications(
          (data) => {
            setNotifications(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (e: any) {
        // subscribeToNotifications may throw if user not ready
        setError(e.message);
        setLoading(false);
      }

      // Listen for notification taps (deep link)
      responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const productId = response.notification.request.content.data?.productId;
          if (productId) {
            router.push(`/(app)/products/${productId}`);
          }
        }
      );

      // Listen for received notifications to save to history
      receivedSubscription = Notifications.addNotificationReceivedListener(
        async (notification) => {
          const data = notification.request.content.data;
          if (data?.productId) {
            const body = notification.request.content.body || '';
            let daysRemaining = 0;
            if (body.includes('vence hoje')) daysRemaining = 0;
            else if (body.includes('amanhã')) daysRemaining = 1;
            else {
              const match = body.match(/em (\d+) dias/);
              if (match) daysRemaining = parseInt(match[1], 10);
            }

            await saveNotificationToHistory({
              productId: data.productId as string,
              productName: (data.productName as string) || '',
              expirationDate: new Date(),
              daysRemaining,
            });
          }
        }
      );
    };

    setup();

    return () => {
      unsubscribe?.();
      responseSubscription?.remove();
      receivedSubscription?.remove();
    };
  }, []);

  const markAsRead = async (ids: string[]) => {
    try {
      await markNotificationsAsRead(ids);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, error, unreadCount, markAsRead, markAllAsRead };
}
