import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Product } from '@/types/product';
import { ProductGroup } from './ProductGroup';

interface CategorySectionProps {
  title: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onProductLongPress?: (product: Product) => void;
}

export function CategorySection({ title, products, onProductPress, onProductLongPress }: CategorySectionProps) {
  // Group products by nameNormalized
  const groups: Record<string, Product[]> = {};
  products.forEach((p) => {
    const key = p.nameNormalized;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {Object.entries(groups).map(([nameNorm, groupProducts]) => (
        <ProductGroup
          key={nameNorm}
          name={groupProducts[0].name}
          products={groupProducts}
          onProductPress={onProductPress}
          onProductLongPress={onProductLongPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});
