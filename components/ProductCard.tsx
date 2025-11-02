import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '@/types';
import { ShoppingCart, Heart, Star, TrendingUp, Package } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />

        {!product.in_stock && (
          <View style={styles.outOfStockOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
              style={styles.outOfStockGradient}
            >
              <Package size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.topActions}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category_ka}</Text>
          </View>

          <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
            <LinearGradient
              colors={['#ffffff', '#f8f8f8']}
              style={styles.favoriteBg}
            >
              <Heart size={16} color="#ff4d4d" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomInfo}>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.ratingCount}>(128)</Text>
            </View>
          </View>

          <View style={styles.trendingBadge}>
            <TrendingUp size={12} color="#22c55e" strokeWidth={2.5} />
            <Text style={styles.trendingText}>ტოპ</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name_ka}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.stockInfo}>
            <View style={[styles.stockDot, product.in_stock && styles.stockDotActive]} />
            <Text style={[styles.stockText, product.in_stock && styles.stockTextActive]}>
              {product.in_stock ? 'მარაგშია' : 'არ არის'}
            </Text>
          </View>

          <Text style={styles.deliveryText}>მიწოდება: 2-3 დღე</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>ფასი</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₾{product.price.toFixed(2)}</Text>
              {product.original_price && (
                <Text style={styles.originalPrice}>₾{product.original_price.toFixed(2)}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.cartButton, !product.in_stock && styles.cartButtonDisabled]}
            activeOpacity={0.8}
            disabled={!product.in_stock}
          >
            <LinearGradient
              colors={product.in_stock ? ['#3b82f6', '#2563eb'] : ['#d1d5db', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartButtonGradient}
            >
              <ShoppingCart size={18} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  favoriteBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteBg: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingCount: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  stockDotActive: {
    backgroundColor: '#22c55e',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  stockTextActive: {
    color: '#22c55e',
  },
  deliveryText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cartButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cartButtonDisabled: {
    shadowColor: '#9ca3af',
    shadowOpacity: 0.2,
  },
  cartButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
