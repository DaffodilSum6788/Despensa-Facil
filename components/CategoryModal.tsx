import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}

export function CategoryModal({ visible, onClose, onConfirm }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onConfirm(name.trim());
      setName('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erro ao criar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Nova Categoria</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Nome da categoria"
            placeholderTextColor={Colors.gray}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            autoFocus
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.confirmText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  error: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.gray,
    fontSize: 15,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
