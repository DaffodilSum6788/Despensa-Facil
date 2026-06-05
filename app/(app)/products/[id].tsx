import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { CategoryModal } from '@/components/CategoryModal';
import { CategoryPicker } from '@/components/CategoryPicker';
import { Product } from '@/types/product';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, loading: productsLoading, editProduct, removeProduct } = useProducts();
  const { categories, addCategory } = useCategories();

  const product = products.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (product && !initialized) {
      setName(product.name);
      setQuantity(String(product.quantity));
      setDescription(product.description || '');
      setExpirationDate(product.expirationDate ? product.expirationDate.toDate() : undefined);
      setCategoryId(product.categoryId || undefined);
      setInitialized(true);
    }
  }, [product, initialized]);

  // Product not found (may have been deleted)
  if (!productsLoading && !product && initialized === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Este produto não existe mais.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!quantity.trim() || isNaN(qty) || qty <= 0) {
      setError('Quantidade deve ser um número positivo.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await editProduct(id!, {
        name: name.trim(),
        quantity: qty,
        description: description.trim(),
        expirationDate: expirationDate || null,
        categoryId: categoryId || null,
      });
      router.back();
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir produto',
      `Tem certeza que deseja excluir "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProduct(id!);
              router.back();
            } catch (e: any) {
              setError(e.message || 'Erro ao excluir.');
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(t) => { setName(t); setError(null); }}
      />

      <Text style={styles.label}>Quantidade *</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={(t) => { setQuantity(t); setError(null); }}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Data de validade</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={expirationDate ? styles.dateText : styles.datePlaceholder}>
          {expirationDate
            ? expirationDate.toLocaleDateString('pt-BR')
            : 'Selecionar data (opcional)'}
        </Text>
      </TouchableOpacity>
      {expirationDate && (
        <TouchableOpacity onPress={() => setExpirationDate(undefined)}>
          <Text style={styles.clearDate}>Remover data</Text>
        </TouchableOpacity>
      )}
      {showDatePicker && (
        <DateTimePicker
          value={expirationDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Categoria</Text>
      <CategoryPicker
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onNewCategory={() => setShowCategoryModal(true)}
      />

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.saveText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Excluir Produto</Text>
      </TouchableOpacity>

      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onConfirm={async (catName) => {
          const newId = await addCategory(catName);
          setCategoryId(newId);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
    color: Colors.text,
  },
  datePlaceholder: {
    fontSize: 15,
    color: Colors.gray,
  },
  clearDate: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: 4,
  },

  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
