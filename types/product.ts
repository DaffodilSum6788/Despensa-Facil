import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  nameNormalized: string;
  quantity: number;
  description?: string;
  expirationDate?: Timestamp;
  categoryId?: string;
  notificationIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
