import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Category } from '@/types/category';
import { normalizeString } from '@/utils/normalizeString';

function categoriesCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'categories');
}

export function subscribeToCategories(
  callback: (categories: Category[]) => void,
  onError: (error: Error) => void
) {
  const q = query(categoriesCollection(), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const categories: Category[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      callback(categories);
    },
    onError
  );
}

export async function createCategory(name: string): Promise<string> {
  const normalized = normalizeString(name);

  // Check for duplicate
  const q = query(categoriesCollection(), where('nameNormalized', '==', normalized));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('Já existe uma categoria com esse nome.');
  }

  // Get max order
  const allQuery = query(categoriesCollection(), orderBy('order', 'desc'));
  const allDocs = await getDocs(allQuery);
  const maxOrder = allDocs.empty ? 0 : (allDocs.docs[0].data().order || 0);

  const docRef = await addDoc(categoriesCollection(), {
    name: name.trim(),
    nameNormalized: normalized,
    order: maxOrder + 1,
  });
  return docRef.id;
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');

  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const ref = doc(db, 'users', uid, 'categories', id);
    batch.update(ref, { order: index + 1 });
  });
  await batch.commit();
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(categoriesCollection(), categoryId));
}
