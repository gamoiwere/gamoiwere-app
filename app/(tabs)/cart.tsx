import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { cartService, CartItem } from '@/services/cart';
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, ShoppingBag, Package } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        await loadCart();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      setItems(response.items || []);
      setTotalItems(response.summary?.totalItems || 0);
      setTotalPrice(response.summary?.totalPrice || 0);
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateQuantity(itemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('შეცდომა', 'რაოდენობის განახლება ვერ მოხერხდა');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert(
      'წაშლის დადასტურება',
      'დარწმუნებული ხართ, რომ გსურთ პროდუქტის კალათიდან წაშლა?',
      [
        { text: 'გაუქმება', style: 'cancel' },
        {
          text: 'წაშლა',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.removeItem(itemId);
              await loadCart();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('შეცდომა', 'პროდუქტის წაშლა ვერ მოხერხდა');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'კალათის გაწმენდა',
      'დარწმუნებული ხართ, რომ გსურთ კალათის სრული გაწმენდა?',
      [
        { text: 'გაუქმება', style: 'cancel' },
        {
          text: 'გაწმენდა',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.clearCart();
              await loadCart();
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('შეცდომა', 'კალათის გაწმენდა ვერ მოხერხდა');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToAuth = () => {
    router.push('/auth/login');
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
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>კალათა</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ShoppingCart size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
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
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>კალათა</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <LinearGradient
                colors={['#7c3aed', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authIcon}
              >
                <ShoppingCart size={48} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              კალათის სანახავად და პროდუქტების შესაძენად
              გთხოვთ გაიარეთ ავტორიზაცია
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleNavigateToAuth}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6e39ea', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authButtonGradient}
              >
                <Text style={styles.authButtonText}>შესვლა</Text>
                <ChevronRight size={20} color="#fff" strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>კალათა</Text>
            </View>
            <View style={styles.statsCompact}>
              <View style={styles.statBoxCompact}>
                <Text style={styles.statNumberCompact}>{totalItems}</Text>
                <Text style={styles.statTextCompact}>ნივთი</Text>
              </View>
            </View>
          </View>

          {items.length > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ჯამური თანხა:</Text>
                <Text style={styles.summaryAmount}>{totalPrice.toFixed(2)} ₾</Text>
              </View>
            </View>
          )}
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
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <ShoppingCart size={60} color="#bbb" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>კალათა ცარიელია</Text>
              <Text style={styles.emptyDescription}>
                დაამატეთ პროდუქტები კალათაში და განახორციელეთ შეკვეთა
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/')}
              >
                <LinearGradient
                  colors={['#6e39ea', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButtonGradient}
                >
                  <Package size={20} color="#fff" strokeWidth={2} />
                  <Text style={styles.emptyButtonText}>პროდუქტების ნახვა</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.variations && Object.keys(item.variations).length > 0 && (
                      <View style={styles.variationsContainer}>
                        {Object.entries(item.variations).map(([key, value]) => (
                          <View key={key} style={styles.variationTag}>
                            <Text style={styles.variationText}>
                              {key}: {value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)} ₾</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} color="#666" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} color="#666" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={18} color="#dc2626" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCart}
                >
                  <Trash2 size={18} color="#dc2626" strokeWidth={2} />
                  <Text style={styles.clearButtonText}>კალათის გაწმენდა</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => {
                    Alert.alert('შეკვეთა', 'შეკვეთის გაფორმება მალე დაემატება');
                  }}
                >
                  <LinearGradient
                    colors={['#6e39ea', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.checkoutButtonGradient}
                  >
                    <ShoppingBag size={20} color="#fff" strokeWidth={2} />
                    <Text style={styles.checkoutButtonText}>შეკვეთის გაფორმება</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
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
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statTextCompact: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'MarkGEO-Regular',
  },
  summaryAmount: {
    fontSize: 20,
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
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 120,
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  authIconWrapper: {
    marginBottom: 24,
  },
  authIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  authDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: 'MarkGEO-Regular',
  },
  authButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
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
    color: '#1a1a1a',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: 'MarkGEO-Regular',
  },
  emptyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    fontFamily: 'MarkGEO-Regular',
  },
  variationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  variationTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  variationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'MarkGEO-Regular',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6e39ea',
    fontFamily: 'MarkGEO-Regular',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
    fontFamily: 'MarkGEO-Regular',
  },
  checkoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
