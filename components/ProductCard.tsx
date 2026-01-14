import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Product } from '@/types';
import { Heart, Star } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.8}>
          <Heart size={18} color="#6b7280" strokeWidth={2} />
        </TouchableOpacity>

        {!product.in_stock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name_ka}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₾{product.price.toFixed(0)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₾{product.original_price!.toFixed(0)}</Text>
            )}
          </View>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
    paddingTop: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#7816d6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
