import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Product } from '@/types/product';
import { normalizeString } from '@/utils/normalizeString';

function productsCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'products');
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError: (error: Error) => void
) {
  const q = query(productsCollection(), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const products: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      callback(products);
    },
    onError
  );
}

export async function createProduct(data: {
  name: string;
  quantity: number;
  description?: string;
  expirationDate?: Date;
  categoryId?: string;
}): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(productsCollection(), {
    name: data.name,
    nameNormalized: normalizeString(data.name),
    quantity: data.quantity,
    description: data.description || '',
    expirationDate: data.expirationDate ? Timestamp.fromDate(data.expirationDate) : null,
    categoryId: data.categoryId || null,
    notificationIds: [],
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string;
    quantity: number;
    description: string;
    expirationDate: Date | null;
    categoryId: string | null;
    notificationIds: string[];
  }>
): Promise<void> {
  const updateData: Record<string, any> = { updatedAt: Timestamp.now() };

  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.nameNormalized = normalizeString(data.name);
  }
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.expirationDate !== undefined) {
    updateData.expirationDate = data.expirationDate
      ? Timestamp.fromDate(data.expirationDate)
      : null;
  }
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.notificationIds !== undefined) updateData.notificationIds = data.notificationIds;

  await updateDoc(doc(productsCollection(), productId), updateData);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(productsCollection(), productId));
}
