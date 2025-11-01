import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Product } from '@/types';
import { ShoppingCart, Heart, Star } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />

        {!product.in_stock && (
          <View style={styles.outOfStockBadge}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
                <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
              </BlurView>
            ) : (
              <View style={styles.badgeBlur}>
                <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.8}>
          <View style={styles.favoriteBg}>
            <Heart size={16} color="#fff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        <View style={styles.ratingBadge}>
          <Star size={12} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#fff', '#fafafa']}
        style={styles.content}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.category}>{product.category_ka}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name_ka}
        </Text>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>ფასი</Text>
            <Text style={styles.price}>₾{product.price.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.cartButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6e39ea', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartButtonGradient}
            >
              <ShoppingCart size={16} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(110, 57, 234, 0.1)',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeBlur: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  favoriteBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110, 57, 234, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  category: {
    fontSize: 10,
    color: '#6e39ea',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    lineHeight: 18,
    letterSpacing: -0.3,
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
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  cartButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cartButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
