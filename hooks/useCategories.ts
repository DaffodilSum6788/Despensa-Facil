import { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import {
  subscribeToCategories,
  createCategory,
  reorderCategories,
} from '@/services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const addCategory = async (name: string) => {
    try {
      return await createCategory(name);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const reorder = async (orderedIds: string[]) => {
    try {
      await reorderCategories(orderedIds);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const clearError = () => setError(null);

  return { categories, loading, error, addCategory, reorder, clearError };
}
