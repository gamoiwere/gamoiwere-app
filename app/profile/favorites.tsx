import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, ArrowLeft, Trash2, ExternalLink, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Favorite } from '@/types';
import { api } from '@/services/api';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
  };

  const handleRemoveFavorite = async (productId: string) => {
    const success = await api.removeFromFavorites(productId);
    if (success) {
      setFavorites(favorites.filter(f => f.productId !== productId));
    }
  };

  const handleOpenProduct = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>რჩეულები</Text>
            </View>
            <View style={styles.statsCompact}>
              <View style={styles.statBoxCompact}>
                <Text style={styles.statNumberCompact}>0</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Heart size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>რჩეულები</Text>
          </View>
          <View style={styles.statsCompact}>
            <View style={styles.statBoxCompact}>
              <Text style={styles.statNumberCompact}>{favorites.length}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6e39ea" />
        }
      >
        <View style={styles.content}>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Heart size={64} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>რჩეულები ცარიელია</Text>
              <Text style={styles.emptySubtitle}>
                დაამატეთ პროდუქტები რჩეულებში{'\n'}რათა მოგვიანებით მარტივად იხილოთ
              </Text>
              <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => router.push('/(tabs)')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#6e39ea', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shopNowGradient}
                >
                  <ShoppingBag size={20} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.shopNowText}>დაიწყე შოპინგი</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            favorites.map((favorite, index) => (
              <View
                key={favorite.id}
                style={[styles.favoriteCard, { marginTop: index === 0 ? 0 : 16 }]}
              >
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() => handleOpenProduct(favorite.productUrl)}
                  activeOpacity={0.7}
                >
                  <View style={styles.imageWrapper}>
                    {favorite.productImage ? (
                      <Image
                        source={{ uri: favorite.productImage }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Heart size={32} color="#e5e7eb" strokeWidth={2} />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {favorite.productTitle}
                    </Text>
                    <Text style={styles.productPrice}>
                      {favorite.productPrice.toFixed(2)} ₾
                    </Text>
                    {favorite.productUrl && (
                      <View style={styles.linkRow}>
                        <ExternalLink size={14} color="#7c3aed" strokeWidth={2} />
                        <Text style={styles.linkText}>გახსნა</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(favorite.productId)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#dc2626" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  statsCompact: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBoxCompact: {
    alignItems: 'center',
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bbb',
    fontFamily: 'MarkGEO-Regular',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: 'MarkGEO-Regular',
  },
  shopNowButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shopNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 10,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 14,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'MarkGEO-Regular',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7c3aed',
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: 'MarkGEO-Regular',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  removeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpace: {
    height: 100,
  },
});
