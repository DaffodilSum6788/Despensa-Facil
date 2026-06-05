import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { CategorySection } from '@/components/CategorySection';
import { ReorderCategoriesModal } from '@/components/ReorderCategoriesModal';
import { Product } from '@/types/product';

export default function DashboardScreen() {
  const { products, loading: productsLoading, editProduct } = useProducts();
  const { categories, loading: categoriesLoading, reorder } = useCategories();
  const router = useRouter();
  const [showReorder, setShowReorder] = useState(false);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);

  const loading = productsLoading || categoriesLoading;

  const handleProductPress = (product: Product) => {
    router.push(`/(app)/products/${product.id}`);
  };

  const handleProductLongPress = (product: Product) => {
    setMovingProduct(product);
  };

  const handleMoveToCategory = async (categoryId: string | null) => {
    if (!movingProduct) return;
    try {
      await editProduct(movingProduct.id, { categoryId });
    } catch {
      // error handled by hook
    }
    setMovingProduct(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          Sua despensa está vazia.{'\n'}Toque no botão + para adicionar seu primeiro produto.
        </Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/products/new')}
        >
          <FontAwesome name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  // Group products by category
  const categorized: Record<string, Product[]> = {};
  const uncategorized: Product[] = [];

  products.forEach((p) => {
    if (p.categoryId) {
      if (!categorized[p.categoryId]) categorized[p.categoryId] = [];
      categorized[p.categoryId].push(p);
    } else {
      uncategorized.push(p);
    }
  });

  return (
    <View style={styles.container}>
      {categories.length > 1 && (
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => setShowReorder(true)}
        >
          <FontAwesome name="bars" size={14} color={Colors.primary} />
          <Text style={styles.reorderText}>Reordenar categorias</Text>
        </TouchableOpacity>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const catProducts = categorized[cat.id];
          if (!catProducts || catProducts.length === 0) return null;
          return (
            <CategorySection
              key={cat.id}
              title={cat.name}
              products={catProducts}
              onProductPress={handleProductPress}
              onProductLongPress={handleProductLongPress}
            />
          );
        })}
        {uncategorized.length > 0 && (
          <CategorySection
            title="Sem categoria"
            products={uncategorized}
            onProductPress={handleProductPress}
            onProductLongPress={handleProductLongPress}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/products/new')}
      >
        <FontAwesome name="plus" size={22} color={Colors.white} />
      </TouchableOpacity>
      <ReorderCategoriesModal
        visible={showReorder}
        categories={categories}
        onClose={() => setShowReorder(false)}
        onSave={reorder}
      />

      {/* Move to category modal */}
      <Modal
        visible={!!movingProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setMovingProduct(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMovingProduct(null)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mover para categoria</Text>
            <Text style={styles.modalSubtitle}>
              {movingProduct?.name}
            </Text>
            <FlatList
              data={[
                ...categories.map((c) => ({ id: c.id, name: c.name })),
                { id: '__none__', name: 'Sem categoria' },
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isCurrentCategory =
                  (item.id === '__none__' && !movingProduct?.categoryId) ||
                  item.id === movingProduct?.categoryId;
                return (
                  <TouchableOpacity
                    style={[styles.modalOption, isCurrentCategory && styles.modalOptionActive]}
                    onPress={() => handleMoveToCategory(item.id === '__none__' ? null : item.id)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isCurrentCategory && styles.modalOptionTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isCurrentCategory && (
                      <FontAwesome name="check" size={14} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reorderText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: Colors.grayLight,
  },
  modalOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
