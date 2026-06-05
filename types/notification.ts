import { Timestamp } from 'firebase/firestore';

export interface AppNotification {
  id: string;
  productId: string;
  productName: string;
  expirationDate: Timestamp;
  daysRemaining: number;
  read: boolean;
  triggeredAt: Timestamp;
}
