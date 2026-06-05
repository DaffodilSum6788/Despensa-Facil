import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGroupProps {
  name: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onProductLongPress?: (product: Product) => void;
}

export function ProductGroup({ name, products, onProductPress, onProductLongPress }: ProductGroupProps) {
  const [expanded, setExpanded] = useState(false);

  if (products.length === 1) {
    return (
      <ProductCard
        product={products[0]}
        onPress={() => onProductPress(products[0])}
        onLongPress={() => onProductLongPress?.(products[0])}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.name}>{name}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{products.length} entradas</Text>
          <FontAwesome
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={Colors.gray}
          />
        </View>
      </TouchableOpacity>
      {expanded &&
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => onProductPress(product)}
            onLongPress={() => onProductLongPress?.(product)}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  count: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
