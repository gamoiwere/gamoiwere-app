import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '@/types';
import { Heart, Star } from 'lucide-react-native';

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
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />

        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.8}>
          <Heart size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        {!product.in_stock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
          </View>
        )}

        <View style={styles.ratingBadge}>
          <Star size={12} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.priceOverlay}
        >
          <Text style={styles.price}>₾{product.price.toFixed(2)}</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name_ka}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    height: 120,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '800',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
});
