import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Heart, ChevronLeft, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { api } from '@/services/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    const success = await api.removeFromFavorites(productId);
    if (success) {
      setFavorites(favorites.filter(p => p.id !== productId));
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Heart size={24} color="#fff" strokeWidth={2.5} fill="#fff" />
            <Text style={styles.headerTitle}>რჩეულები</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>იტვირთება...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Heart size={64} color="#e5e7eb" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>რჩეულები ცარიელია</Text>
            <Text style={styles.emptySubtitle}>
              დაამატეთ პროდუქტები რჩეულებში რათა მოგვიანებით მარტივად იხილოთ
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/index')}
            >
              <Text style={styles.browseButtonText}>დათვალიერება</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.countContainer}>
              <Text style={styles.countText}>
                {favorites.length} პროდუქტი
              </Text>
            </View>

            <View style={styles.productsGrid}>
              {favorites.map((product) => (
                <View key={product.id} style={styles.productColumn}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  productColumn: {
    width: '50%',
    paddingHorizontal: 4,
  },
  bottomSpacer: {
    height: 120,
  },
});
