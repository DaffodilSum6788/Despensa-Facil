import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import {
  subscribeToProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/productService';
import {
  scheduleProductNotifications,
  cancelProductNotifications,
} from '@/services/notificationService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const addProduct = async (data: {
    name: string;
    quantity: number;
    description?: string;
    expirationDate?: Date;
    categoryId?: string;
  }) => {
    try {
      const productId = await createProduct(data);

      // Schedule notifications if expiration date is set
      if (data.expirationDate) {
        const notificationIds = await scheduleProductNotifications(
          productId,
          data.name,
          data.expirationDate
        );
        if (notificationIds.length > 0) {
          await updateProduct(productId, { notificationIds });
        }
      }

      return productId;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const editProduct = async (
    id: string,
    data: Partial<{
      name: string;
      quantity: number;
      description: string;
      expirationDate: Date | null;
      categoryId: string | null;
      notificationIds: string[];
    }>
  ) => {
    try {
      // If expiration date changed, cancel old and reschedule
      if (data.expirationDate !== undefined) {
        const product = products.find((p) => p.id === id);
        if (product?.notificationIds?.length) {
          await cancelProductNotifications(product.notificationIds);
        }

        if (data.expirationDate) {
          const productName = data.name || product?.name || '';
          const newIds = await scheduleProductNotifications(
            id,
            productName,
            data.expirationDate
          );
          data.notificationIds = newIds;
        } else {
          data.notificationIds = [];
        }
      }

      await updateProduct(id, data);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      // Cancel pending notifications
      const product = products.find((p) => p.id === id);
      if (product?.notificationIds?.length) {
        await cancelProductNotifications(product.notificationIds);
      }

      await deleteProduct(id);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  return { products, loading, error, addProduct, editProduct, removeProduct };
}
