import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ordersService } from '@/services/orders';
import { Order } from '@/types';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, MapPin, Calendar, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    checkUserAndLoadOrders();
  }, []);

  const checkUserAndLoadOrders = async () => {
    try {
      const currentUser = await authService.getUser();
      setUser(currentUser);

      if (currentUser) {
        const token = await authService.getToken();
        if (token) {
          await loadOrders('ALL');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (status?: string) => {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      let response;
      if (status && status !== 'ALL') {
        response = await fetch(`https://gamoiwere.ge/api/mobile/orders/status/${status}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch('https://gamoiwere.ge/api/mobile/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      }

      let orders = [];
      let total = 0;

      if (Array.isArray(data)) {
        orders = data;
        total = data.length;
      } else {
        orders = data.orders || [];
        total = data.total || orders.length;
      }

      setOrders(orders);

      if (status === 'ALL' || !status) {
        setTotalCount(total);
        await loadStatusCounts(token);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setTotalCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(selectedFilter);
    setRefreshing(false);
  };

  const handleFilterChange = async (filter: string) => {
    setSelectedFilter(filter);
    setLoading(true);
    await loadOrders(filter);
    setLoading(false);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { icon: any; color: string; bgColor: string; text: string } } = {
      PENDING: { icon: Clock, color: '#f59e0b', bgColor: '#fef3c7', text: 'მუშავდება' },
      PROCESSING: { icon: Package, color: '#3b82f6', bgColor: '#dbeafe', text: 'მზადდება' },
      PAID: { icon: CreditCard, color: '#10b981', bgColor: '#d1fae5', text: 'გადახდილია' },
      SHIPPED: { icon: Truck, color: '#000', bgColor: '#f5f5f5', text: 'გზაშია' },
      DELIVERED: { icon: CheckCircle, color: '#10b981', bgColor: '#d1fae5', text: 'მიწოდებულია' },
      CANCELLED: { icon: XCircle, color: '#ef4444', bgColor: '#fee2e2', text: 'გაუქმებულია' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const loadStatusCounts = async (token: string) => {
    try {
      const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
      const counts: { [key: string]: number } = {};

      await Promise.all(
        statuses.map(async (status) => {
          try {
            const response = await fetch(`https://gamoiwere.ge/api/mobile/orders/status/${status}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            const data = await response.json();
            if (response.ok) {
              counts[status] = data.total || 0;
            }
          } catch (error) {
            counts[status] = 0;
          }
        })
      );

      setStatusCounts(counts);
    } catch (error) {
      console.error('Error loading status counts:', error);
    }
  };

  const getFilteredOrdersCount = (filterKey: string) => {
    if (filterKey === 'ALL') return totalCount;
    return statusCounts[filterKey] || 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.modernHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.modernTitle}>შეკვეთები</Text>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <Package size={56} color="#e0e0e0" strokeWidth={1.5} />
            <Text style={styles.loadingText}>იტვირთება...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.modernHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.modernTitle}>შეკვეთები</Text>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authContent}>
            <View style={styles.authIconBox}>
              <ShoppingBag size={72} color="#d1d5db" strokeWidth={1.5} />
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authSubtitle}>
              თქვენი შეკვეთების სანახავად{'\n'}გაიარეთ ავტორიზაცია
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push('/auth/login')}
            >
              <LinearGradient
                colors={['#000', '#1a1a1a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authGradient}
              >
                <Text style={styles.authButtonText}>შესვლა</Text>
                <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const filters = [
    { key: 'ALL', label: 'ყველა', icon: Package },
    { key: 'PENDING', label: 'მუშავდება', icon: Clock },
    { key: 'PAID', label: 'გადახდილია', icon: CreditCard },
    { key: 'SHIPPED', label: 'გზაშია', icon: Truck },
    { key: 'DELIVERED', label: 'მიწოდებულია', icon: CheckCircle },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.modernHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.modernTitle}>შეკვეთები</Text>
            {totalCount > 0 && (
              <Text style={styles.orderCount}>{totalCount} შეკვეთა</Text>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.key;
            const count = getFilteredOrdersCount(filter.key);

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => handleFilterChange(filter.key)}
              >
                <Icon
                  size={16}
                  color={isActive ? '#fff' : '#666'}
                  strokeWidth={2.5}
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {filter.label}
                </Text>
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconBox}>
                <Package size={72} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>შეკვეთები არ მოიძებნა</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'ALL'
                  ? 'ჯერ არ გაქვთ არცერთი შეკვეთა'
                  : `"${filters.find(f => f.key === selectedFilter)?.label}" სტატუსით შეკვეთები არ მოიძებნა`}
              </Text>
              {selectedFilter === 'ALL' && (
                <TouchableOpacity
                  style={styles.startShoppingButton}
                  onPress={() => router.push('/(tabs)')}
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
              )}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { marginTop: index === 0 ? 0 : 12 }]}
                  onPress={() => router.push(`/order/${order.id}`)}
                  activeOpacity={0.95}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderLabel}>შეკვეთა</Text>
                      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                      <StatusIcon size={14} color={statusInfo.color} strokeWidth={2.5} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  {order.items && order.items.length > 0 && (
                    <View style={styles.itemsSection}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.itemsScroll}
                      >
                        {order.items.slice(0, 4).map((item, idx) => (
                          <View key={idx} style={styles.itemCard}>
                            {item.imageUrl ? (
                              <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
                            ) : (
                              <View style={styles.itemImgPlaceholder}>
                                <Package size={20} color="#999" strokeWidth={2} />
                              </View>
                            )}
                            <Text style={styles.itemQtyBadge}>×{item.quantity}</Text>
                          </View>
                        ))}
                        {order.items.length > 4 && (
                          <View style={styles.moreItemsCard}>
                            <Text style={styles.moreItemsText}>+{order.items.length - 4}</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <View style={styles.orderInfo}>
                      <View style={styles.infoRow}>
                        <MapPin size={14} color="#999" strokeWidth={2} />
                        <Text style={styles.infoText}>{order.shippingCity}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Calendar size={14} color="#999" strokeWidth={2} />
                        <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.orderTotal}>
                      <Text style={styles.totalLabel}>სულ</Text>
                      <Text style={styles.totalAmount}>₾{order.totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={styles.viewDetailsBar}>
                    <Text style={styles.viewDetailsText}>დეტალების ნახვა</Text>
                    <ArrowRight size={16} color="#000" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1.5,
  },
  orderCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  filtersScroll: {
    marginHorizontal: -20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 22,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
  },
  filterBadgeTextActive: {
    color: '#fff',
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
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  authContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  authIconBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  authSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  authGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
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
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderMeta: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemsSection: {
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  itemCard: {
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  itemQtyBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  moreItemsCard: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreItemsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  orderInfo: {
    flex: 1,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  viewDetailsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  bottomSpace: {
    height: 40,
  },
});
