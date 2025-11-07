import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, StatusBar, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { cartService, CartItem } from '@/services/cart';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package, Sparkles, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
      await loadCart();
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

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateQuantity(itemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('შეცდომა', 'რაოდენობის განახლება ვერ მოხერხდა');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartService.removeItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('შეცდომა', 'პროდუქტის წაშლა ვერ მოხერხდა');
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      'კალათის გაწმენდა',
      'დარწმუნებული ხართ?',
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

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.modernHeader, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.modernTitle}>კალათა</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ShoppingCart size={56} color="#e0e0e0" strokeWidth={1.5} />
            <Text style={styles.loadingText}>იტვირთება...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.modernHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.modernTitle}>კალათა</Text>
              {items.length > 0 && (
                <Text style={styles.itemCount}>{totalItems} პროდუქტი</Text>
              )}
            </View>
            {items.length > 0 && (
              <TouchableOpacity
                onPress={handleClearCart}
                style={styles.clearIconButton}
              >
                <Trash2 size={20} color="#ef4444" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconBox}>
                <ShoppingCart size={72} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>თქვენი კალათა ცარიელია</Text>
              <Text style={styles.emptySubtitle}>
                აირჩიეთ საინტერესო პროდუქტები და დაამატეთ კალათაში
              </Text>
              <TouchableOpacity
                style={styles.startShoppingButton}
                onPress={() => router.push('/')}
              >
                <LinearGradient
                  colors={['#000', '#1a1a1a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startShoppingGradient}
                >
                  <Text style={styles.startShoppingText}>დაიწყეთ შოპინგი</Text>
                  <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <View key={item.id} style={[styles.cartCard, { marginTop: index === 0 ? 0 : 12 }]}>
                  <View style={styles.cardImageContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <X size={16} color="#fff" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {item.variations && Object.keys(item.variations).length > 0 && (
                      <View style={styles.variantsList}>
                        {Object.entries(item.variations).map(([key, value]) => (
                          <View key={key} style={styles.variantChip}>
                            <Text style={styles.variantText}>{value}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardPrice}>₾{item.price.toFixed(2)}</Text>

                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} color="#000" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} color="#000" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Sparkles size={20} color="#000" strokeWidth={2} />
                  <Text style={styles.summaryTitle}>შეკვეთის დეტალები</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>პროდუქტების რაოდენობა</Text>
                  <Text style={styles.summaryValue}>{totalItems}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>პროდუქტების ღირებულება</Text>
                  <Text style={styles.summaryValue}>₾{totalPrice.toFixed(2)}</Text>
                </View>

                <View style={[styles.divider, { marginVertical: 16 }]} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>სულ</Text>
                  <Text style={styles.totalValue}>₾{totalPrice.toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => Alert.alert('შეკვეთა', 'შეკვეთის გაფორმება მალე დაემატება')}
              >
                <LinearGradient
                  colors={['#000', '#1a1a1a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.checkoutGradient}
                >
                  <Text style={styles.checkoutText}>შეკვეთის გაფორმება</Text>
                  <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  modernHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1.5,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  clearIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  loadingBox: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyIconBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startShoppingButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  startShoppingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  startShoppingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemsList: {
    marginBottom: 20,
  },
  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  variantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  variantChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  variantText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    paddingHorizontal: 14,
    minWidth: 40,
    textAlign: 'center',
  },
  summarySection: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  checkoutText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  bottomSpace: {
    height: 40,
  },
});
