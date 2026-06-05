import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ShoppingItem } from '@/types/shoppingItem';
import { normalizeString } from '@/utils/normalizeString';

function shoppingCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'shoppingList');
}

function productsCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'products');
}

export function subscribeToShoppingList(
  callback: (items: ShoppingItem[]) => void,
  onError: (error: Error) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onError(new Error('User not authenticated'));
    return () => {};
  }
  const q = query(
    collection(db, 'users', uid, 'shoppingList'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items: ShoppingItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ShoppingItem[];
      callback(items);
    },
    onError
  );
}

export async function addShoppingItem(data: {
  name: string;
  description?: string;
  quantity?: number;
}): Promise<string> {
  const docRef = await addDoc(shoppingCollection(), {
    name: data.name.trim(),
    nameNormalized: normalizeString(data.name),
    description: data.description || '',
    quantity: data.quantity || 1,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  await deleteDoc(doc(db, 'users', uid, 'shoppingList', id));
}

export async function transferToProducts(
  item: ShoppingItem,
  expirationDate?: Date
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');

  const batch = writeBatch(db);

  // Create product in pantry
  const productRef = doc(productsCollection());
  const now = Timestamp.now();
  batch.set(productRef, {
    name: item.name,
    nameNormalized: normalizeString(item.name),
    quantity: item.quantity || 1,
    description: item.description || '',
    expirationDate: expirationDate ? Timestamp.fromDate(expirationDate) : null,
    categoryId: null,
    notificationIds: [],
    createdAt: now,
    updatedAt: now,
  });

  // Remove from shopping list
  const shoppingRef = doc(db, 'users', uid, 'shoppingList', item.id);
  batch.delete(shoppingRef);

  await batch.commit();
}
