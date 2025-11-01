import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, Linking, Alert } from 'react-native';
import { Heart, ExternalLink, Trash2 } from 'lucide-react-native';
import { authService } from '@/services/auth';
import { Favorite } from '@/types';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await authService.getFavorites();
      setFavorites(data);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
  };

  const handleRemoveFavorite = (productId: string, productTitle: string) => {
    Alert.alert(
      'წაშლის დადასტურება',
      `გსურთ ${productTitle} წაშლა რჩეულებიდან?`,
      [
        { text: 'გაუქმება', style: 'cancel' },
        {
          text: 'წაშლა',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.removeFavorite(productId);
              await loadFavorites();
              Alert.alert('წარმატება', 'პროდუქტი რჩეულებიდან წაიშალა');
            } catch (error: any) {
              Alert.alert('შეცდომა', error.message || 'წაშლა ვერ მოხერხდა');
            }
          },
        },
      ]
    );
  };

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('შეცდომა', 'ბმულის გახსნა ვერ მოხერხდა');
      }
    } catch (error) {
      Alert.alert('შეცდომა', 'ბმულის გახსნა ვერ მოხერხდა');
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)} ₾`;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#6e39ea"
          colors={['#6e39ea']}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Heart size={32} color="#6e39ea" strokeWidth={2.5} fill="#6e39ea" />
          <Text style={styles.title}>რჩეული პროდუქტები</Text>
        </View>
        <Text style={styles.subtitle}>
          {favorites.length > 0
            ? `თქვენ გაქვთ ${favorites.length} რჩეული პროდუქტი`
            : 'რჩეული პროდუქტები არ გაქვთ'}
        </Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>იტვირთება...</Text>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Heart size={64} color="#e0e0e0" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>რჩეულები ცარიელია</Text>
            <Text style={styles.emptyText}>
              დაამატეთ პროდუქტები რჩეულებში რათა მოგვიანებით იხილოთ
            </Text>
          </View>
        ) : (
          favorites.map((favorite) => (
            <View key={favorite.id} style={styles.favoriteCard}>
              <Image
                source={{ uri: favorite.productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {favorite.productTitle}
                </Text>
                <Text style={styles.productPrice}>
                  {formatPrice(favorite.productPrice)}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleOpenUrl(favorite.productUrl)}
                  >
                    <ExternalLink size={18} color="#007AFF" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>ნახვა</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleRemoveFavorite(favorite.productId, favorite.productTitle)}
                  >
                    <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>წაშლა</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginLeft: 44,
  },
  content: {
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6e39ea',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#fee',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteText: {
    color: '#ef4444',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomSpacer: {
    height: 100,
  },
});
