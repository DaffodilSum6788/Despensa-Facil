import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types/category';

interface ReorderCategoriesModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (orderedIds: string[]) => Promise<void>;
}

export function ReorderCategoriesModal({
  visible,
  categories,
  onClose,
  onSave,
}: ReorderCategoriesModalProps) {
  const [data, setData] = useState<Category[]>(categories);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setData(categories);
  }, [visible, categories]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data.map((c) => c.id));
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newData = [...data];
    [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    setData(newData);
  };

  const moveDown = (index: number) => {
    if (index === data.length - 1) return;
    const newData = [...data];
    [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
    setData(newData);
  };

  const renderItem = ({ item, index }: { item: Category; index: number }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <View style={styles.arrows}>
        <TouchableOpacity
          onPress={() => moveUp(index)}
          disabled={index === 0}
          style={[styles.arrowBtn, index === 0 && styles.arrowDisabled]}
        >
          <FontAwesome name="chevron-up" size={14} color={index === 0 ? Colors.border : Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => moveDown(index)}
          disabled={index === data.length - 1}
          style={[styles.arrowBtn, index === data.length - 1 && styles.arrowDisabled]}
        >
          <FontAwesome name="chevron-down" size={14} color={index === data.length - 1 ? Colors.border : Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reordenar Categorias</Text>
          <Text style={styles.subtitle}>Use as setas para reordenar</Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>Salvar Ordem</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  arrows: {
    flexDirection: 'row',
    gap: 12,
  },
  arrowBtn: {
    padding: 6,
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.gray,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
