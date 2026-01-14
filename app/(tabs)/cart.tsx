import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { cartService, CartItem } from '@/services/cart';
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, ShoppingBag, Package } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Loader from '@/components/Loader';

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
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['#f8f9fa', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <View style={styles.iconBadge}>
                  <ShoppingCart size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>კალათა</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['#f8f9fa', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <View style={styles.iconBadge}>
                  <ShoppingCart size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>კალათა</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <View style={styles.authIcon}>
                <ShoppingCart size={48} color="#7816d6" strokeWidth={2} />
              </View>
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
              <Text style={styles.authButtonText}>შესვლა</Text>
              <ChevronRight size={20} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#f8f9fa', '#f8f9fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <View style={styles.iconBadge}>
                <ShoppingCart size={20} color="#7816d6" strokeWidth={2.5} />
              </View>
              <Text style={styles.headerTitle}>კალათა</Text>
            </View>
            <View style={styles.statsCompact}>
              <Text style={styles.statNumberCompact}>{totalItems}</Text>
              <Text style={styles.statTextCompact}>ნივთი</Text>
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
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7816d6" />
        }
      >
        <View style={styles.content}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <ShoppingCart size={60} color="rgba(255, 255, 255, 0.3)" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>კალათა ცარიელია</Text>
              <Text style={styles.emptyDescription}>
                დაამატეთ პროდუქტები კალათაში და განახორციელეთ შეკვეთა
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/')}
              >
                <Package size={20} color="#fff" strokeWidth={2} />
                <Text style={styles.emptyButtonText}>პროდუქტების ნახვა</Text>
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
                          <Minus size={16} color="#7816d6" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} color="#7816d6" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCart}
                >
                  <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                  <Text style={styles.clearButtonText}>კალათის გაწმენდა</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => {
                    Alert.alert('შეკვეთა', 'შეკვეთის გაფორმება მალე დაემატება');
                  }}
                >
                  <ShoppingBag size={20} color="#fff" strokeWidth={2} />
                  <Text style={styles.checkoutButtonText}>შეკვეთის გაფორმება</Text>
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
    backgroundColor: '#f8f9fa',
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 200,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.25)',
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  statTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 120,
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  authIconWrapper: {
    marginBottom: 24,
  },
  authIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
  },
  authTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  authDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: 'MarkGEO-Regular',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#7816d6',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
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
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: 'MarkGEO-Regular',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7816d6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'MarkGEO-Regular',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  variationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7816d6',
    fontFamily: 'MarkGEO-Regular',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: 'MarkGEO-Regular',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7816d6',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
