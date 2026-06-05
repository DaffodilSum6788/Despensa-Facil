import { Timestamp } from 'firebase/firestore';

export interface ShoppingItem {
  id: string;
  name: string;
  nameNormalized: string;
  description?: string;
  quantity?: number;
  createdAt: Timestamp;
}
