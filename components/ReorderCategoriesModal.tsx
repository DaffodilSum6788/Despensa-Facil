import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Category>) => (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.item, isActive && styles.itemActive]}
      >
        <FontAwesome name="bars" size={16} color={Colors.gray} />
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reordenar Categorias</Text>
          <Text style={styles.subtitle}>Segure e arraste para reordenar</Text>
        </View>

        <DraggableFlatList
          data={data}
          onDragEnd={({ data: newData }) => setData(newData)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          containerStyle={styles.list}
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
      </GestureHandlerRootView>
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
    flex: 1,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  itemActive: {
    backgroundColor: '#eef4fd',
    borderColor: Colors.primary,
  },
  itemText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
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
