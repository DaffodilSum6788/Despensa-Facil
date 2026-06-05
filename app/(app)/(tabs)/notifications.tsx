import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/NotificationItem';
import { AppNotification } from '@/types/notification';

export default function NotificationsScreen() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePress = (notification: AppNotification) => {
    if (selectedIds.size > 0) {
      toggleSelect(notification.id);
    } else {
      // Navigate to product
      router.push(`/(app)/products/${notification.productId}`);
    }
  };

  const handleMarkSelected = async () => {
    if (selectedIds.size === 0) return;
    await markAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <FontAwesome name="bell-o" size={48} color={Colors.grayLight} />
        <Text style={styles.emptyText}>Nenhuma notificação por enquanto.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMarkAll} style={styles.markAllButton}>
          <FontAwesome name="check-square-o" size={16} color={Colors.primary} />
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
        {selectedIds.size > 0 && (
          <TouchableOpacity onPress={handleMarkSelected} style={styles.markSelectedButton}>
            <Text style={styles.markSelectedText}>
              Marcar {selectedIds.size} como lida{selectedIds.size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            selected={selectedIds.has(item.id)}
            onPress={() => handlePress(item)}
            onLongPress={() => toggleSelect(item.id)}
          />
        )}
      />
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
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  markSelectedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markSelectedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
