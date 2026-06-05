import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useShoppingList } from '@/hooks/useShoppingList';
import { ShoppingItem } from '@/types/shoppingItem';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ShoppingListScreen() {
  const { items, loading, addItem, removeItem, transferItem } = useShoppingList();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);

  // Transfer modal state
  const [transferringItem, setTransferringItem] = useState<ShoppingItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do item é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
      });
      setName('');
      setDescription('');
      setQuantity('');
      setShowAddForm(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: ShoppingItem) => {
    Alert.alert('Remover item', `Remover "${item.name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeItem(item.id),
      },
    ]);
  };

  const handleCheckbox = (item: ShoppingItem) => {
    setTransferringItem(item);
    setExpirationDate(undefined);
  };

  const handleTransfer = async (withDate: boolean) => {
    if (!transferringItem) return;

    if (withDate && !expirationDate) {
      setShowDatePicker(true);
      return;
    }

    try {
      await transferItem(transferringItem, withDate ? expirationDate : undefined);
      setTransferringItem(null);
      setExpirationDate(undefined);
    } catch {
      Alert.alert('Erro', 'Não foi possível transferir o item para a despensa.');
    }
  };

  const handleDateConfirm = async () => {
    setShowDatePicker(false);
    if (!transferringItem) return;
    try {
      await transferItem(transferringItem, expirationDate);
      setTransferringItem(null);
      setExpirationDate(undefined);
    } catch {
      Alert.alert('Erro', 'Não foi possível transferir o item para a despensa.');
    }
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleCheckbox(item)}
      >
        <FontAwesome name="square-o" size={22} color={Colors.primary} />
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.quantity && item.quantity > 1 && (
          <Text style={styles.itemQty}>Qtd: {item.quantity}</Text>
        )}
        {item.description ? (
          <Text style={styles.itemDesc}>{item.description}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <FontAwesome name="trash-o" size={20} color={Colors.red} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      {items.length === 0 && !showAddForm ? (
        <View style={styles.empty}>
          <FontAwesome name="shopping-cart" size={48} color={Colors.gray} />
          <Text style={styles.emptyText}>Sua lista de compras está vazia</Text>
          <Text style={styles.emptySubtext}>
            Toque no botão + para adicionar itens
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Nome do item *"
            placeholderTextColor={Colors.gray}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Quantidade"
              placeholderTextColor={Colors.gray}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Descrição"
              placeholderTextColor={Colors.gray}
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAddForm(false);
                setName('');
                setDescription('');
                setQuantity('');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, saving && styles.disabled]}
              onPress={handleAdd}
              disabled={saving}
            >
              <Text style={styles.confirmBtnText}>
                {saving ? 'Salvando...' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showAddForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
        >
          <FontAwesome name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Transfer Modal */}
      <Modal
        visible={!!transferringItem}
        transparent
        animationType="fade"
        onRequestClose={() => setTransferringItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Item comprado!</Text>
            <Text style={styles.modalSubtitle}>
              Deseja informar a data de validade antes de adicionar à despensa?
            </Text>

            {showDatePicker && (
              <DateTimePicker
                value={expirationDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'dismissed') return;
                  if (date) setExpirationDate(date);
                }}
              />
            )}

            {expirationDate && (
              <Text style={styles.selectedDate}>
                Validade: {expirationDate.toLocaleDateString('pt-BR')}
              </Text>
            )}

            <View style={styles.modalButtons}>
              {!expirationDate ? (
                <>
                  <TouchableOpacity
                    style={styles.modalBtnSecondary}
                    onPress={() => handleTransfer(false)}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Pular</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnPrimary}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.modalBtnPrimaryText}>Informar data</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.modalBtnSecondary}
                    onPress={() => setExpirationDate(undefined)}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Alterar data</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnPrimary}
                    onPress={handleDateConfirm}
                  >
                    <Text style={styles.modalBtnPrimaryText}>Confirmar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setTransferringItem(null);
                setShowDatePicker(false);
                setExpirationDate(undefined);
              }}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  itemQty: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  addForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: Colors.gray,
    fontSize: 15,
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  // Modal
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
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnSecondaryText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  modalBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  modalBtnPrimaryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  modalCancel: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.gray,
    fontSize: 14,
  },
  selectedDate: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
});
