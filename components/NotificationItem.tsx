import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { AppNotification } from '@/types/notification';
import { formatDate } from '@/utils/formatDate';

interface NotificationItemProps {
  notification: AppNotification;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function NotificationItem({
  notification,
  selected,
  onPress,
  onLongPress,
}: NotificationItemProps) {
  const { productName, daysRemaining, read, triggeredAt } = notification;

  let urgencyText: string;
  let urgencyColor: string;
  if (daysRemaining <= 0) {
    urgencyText = 'Vencido';
    urgencyColor = Colors.red;
  } else if (daysRemaining === 1) {
    urgencyText = 'Vence amanhã';
    urgencyColor = Colors.yellow;
  } else {
    urgencyText = `Vence em ${daysRemaining} dias`;
    urgencyColor = daysRemaining <= 7 ? Colors.yellow : Colors.green;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !read && styles.unread,
        selected && styles.selected,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        {selected && (
          <FontAwesome name="check-circle" size={18} color={Colors.primary} style={styles.check} />
        )}
        <View style={styles.info}>
          <Text style={[styles.productName, !read && styles.boldText]} numberOfLines={1}>
            {productName}
          </Text>
          <Text style={[styles.urgency, { color: urgencyColor }]}>{urgencyText}</Text>
          <Text style={styles.date}>{formatDate(triggeredAt)}</Text>
        </View>
      </View>
      {!read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unread: {
    backgroundColor: '#f8faff',
  },
  selected: {
    backgroundColor: '#eef4fd',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  check: {
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    color: Colors.text,
  },
  boldText: {
    fontWeight: '600',
  },
  urgency: {
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
});
