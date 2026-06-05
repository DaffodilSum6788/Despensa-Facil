import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ExpirationBadgeProps {
  daysRemaining: number | null;
}

export function ExpirationBadge({ daysRemaining }: ExpirationBadgeProps) {
  if (daysRemaining === null) return null;

  let backgroundColor: string;
  let label: string;

  if (daysRemaining < 0) {
    backgroundColor = Colors.red;
    label = 'Vencido';
  } else if (daysRemaining === 0) {
    backgroundColor = Colors.red;
    label = 'Vence hoje';
  } else if (daysRemaining <= 7) {
    backgroundColor = Colors.yellow;
    label = `${daysRemaining}d`;
  } else {
    backgroundColor = Colors.green;
    label = `${daysRemaining}d`;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
