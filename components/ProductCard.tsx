import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { Colors } from '@/constants/Colors';
import { ExpirationBadge } from './ExpirationBadge';
import { daysUntilExpiration, formatDate } from '@/utils/formatDate';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ProductCard({ product, onPress, onLongPress }: ProductCardProps) {
  const days = product.expirationDate
    ? daysUntilExpiration(product.expirationDate)
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.quantity}>Qtd: {product.quantity}</Text>
          {product.expirationDate && (
            <Text style={styles.date}>
              Validade: {formatDate(product.expirationDate)}
            </Text>
          )}
        </View>
        <ExpirationBadge daysRemaining={days} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  quantity: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
