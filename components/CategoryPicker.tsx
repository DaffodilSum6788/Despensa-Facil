import { useState } from 'react';
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

interface CategoryPickerProps {
  categories: Category[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  onNewCategory: () => void;
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  onNewCategory,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);

  const selected = categories.find((c) => c.id === selectedId);

  const handleSelect = (id: string | undefined) => {
    onSelect(id);
    setOpen(false);
  };

  const options = [
    { id: undefined, name: 'Sem categoria' },
    ...categories,
  ];

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, selectedId && styles.triggerSelected]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>
          {selected ? selected.name : 'Sem categoria'}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={Colors.gray} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Selecionar categoria</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id ?? '__none__'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === selectedId && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.id === selectedId && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === selectedId && (
                    <FontAwesome name="check" size={14} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.newCategoryOption}
              onPress={() => {
                setOpen(false);
                onNewCategory();
              }}
            >
              <FontAwesome name="plus" size={13} color={Colors.primary} />
              <Text style={styles.newCategoryText}>Nova categoria</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#eef4fd',
  },
  triggerText: {
    fontSize: 15,
    color: Colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    maxHeight: 360,
    overflow: 'hidden',
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: '#eef4fd',
  },
  optionText: {
    fontSize: 15,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  newCategoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  newCategoryText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
});
