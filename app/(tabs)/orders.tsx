import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ordersService } from '@/services/orders';
import { Order } from '@/types';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, MapPin, Calendar, ShoppingBag, ChevronRight, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
      console.log('👤 Checking user...');
      const currentUser = await authService.getUser();
      console.log('👤 User:', currentUser ? 'Found' : 'Not found');
      setUser(currentUser);

      if (currentUser) {
        const token = await authService.getToken();
        console.log('🔑 Token:', token ? 'Found' : 'Not found');
        if (token) {
          await loadOrders('ALL');
        }
      }
    } catch (error) {
      console.error('❌ Error in checkUserAndLoadOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (status?: string) => {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('📦 Loading orders with status:', status);

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

      const responseText = await response.text();
      console.log('📦 Raw Response:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('სერვერის პასუხი არასწორია');
      }

      console.log('📦 Parsed Data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      }

      // Check if response is an array (direct orders array) or object with orders property
      let orders = [];
      let total = 0;

      if (Array.isArray(data)) {
        orders = data;
        total = data.length;
        console.log('📦 Direct array response:', { ordersCount: orders.length });
      } else {
        orders = data.orders || [];
        total = data.total || orders.length;
        console.log('📦 Object response:', { success: data.success, total: data.total, ordersCount: orders.length });
      }

      console.log('✅ Setting orders:', orders.length);
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
      SHIPPED: { icon: Truck, color: '#6e39ea', bgColor: '#ede9fe', text: 'გზაშია' },
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
            console.error(`Error loading count for ${status}:`, error);
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
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>თქვენი</Text>
            <Text style={styles.headerTitle}>შეკვეთები</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Package size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>თქვენი</Text>
            <Text style={styles.headerTitle}>შეკვეთები</Text>
          </View>
        </LinearGradient>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <LinearGradient
                colors={['#6e39ea', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authIcon}
              >
                <ShoppingBag size={48} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>

            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              თქვენი შეკვეთების სანახავად და მართვისთვის{'\n'}გთხოვთ გაიაროთ ავტორიზაცია
            </Text>

            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push('/auth/login')}
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

  const filters = [
    { key: 'ALL', label: 'ყველა', icon: Package },
    { key: 'PENDING', label: 'მუშავდება', icon: Clock },
    { key: 'PAID', label: 'გადახდილია', icon: CreditCard },
    { key: 'SHIPPED', label: 'გზაშია', icon: Truck },
    { key: 'DELIVERED', label: 'მიწოდებულია', icon: CheckCircle },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.headerSubtitle}>თქვენი</Text>
          <Text style={styles.headerTitle}>შეკვეთები</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statText}>სულ</Text>
          </View>
          <View style={styles.statDividerVertical} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statText}>ფილტრი</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.key;
            const count = getFilteredOrdersCount(filter.key);

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterCard, isActive && styles.filterCardActive]}
                onPress={() => handleFilterChange(filter.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.filterIconBg, isActive && styles.filterIconBgActive]}>
                  <Icon
                    size={18}
                    color={isActive ? '#6e39ea' : '#9ca3af'}
                    strokeWidth={2.5}
                  />
                </View>
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {filter.label}
                </Text>
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterCount, isActive && styles.filterCountActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6e39ea" />
        }
      >
        <View style={styles.content}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Package size={64} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>შეკვეთები არ მოიძებნა</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'ALL'
                  ? 'თქვენ ჯერ არ გაქვთ არცერთი შეკვეთა'
                  : `"${filters.find(f => f.key === selectedFilter)?.label}" სტატუსით შეკვეთები არ მოიძებნა`}
              </Text>

              {selectedFilter === 'ALL' && (
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
              )}
            </View>
          ) : (
            orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <View
                  key={order.id}
                  style={[styles.orderCard, { marginTop: index === 0 ? 0 : 16 }]}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderLabel}>შეკვეთა</Text>
                      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: statusInfo.bgColor }]}>
                      <StatusIcon size={14} color={statusInfo.color} strokeWidth={2.5} />
                      <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  {order.items && order.items.length > 0 && (
                    <View style={styles.itemsContainer}>
                      {order.items.slice(0, 3).map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemImageWrapper}>
                            {item.imageUrl ? (
                              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                            ) : (
                              <View style={styles.itemImagePlaceholder}>
                                <Package size={16} color="#9ca3af" strokeWidth={2} />
                              </View>
                            )}
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <View style={styles.itemBottom}>
                              <Text style={styles.itemQty}>რაოდენობა: {item.quantity}</Text>
                              <Text style={styles.itemPrice}>{item.price.toFixed(2)} ₾</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                      {order.items.length > 3 && (
                        <View style={styles.moreItems}>
                          <Text style={styles.moreItemsText}>
                            +{order.items.length - 3} პროდუქტი
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <View style={styles.orderDetails}>
                      <View style={styles.detailRow}>
                        <MapPin size={16} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.detailText}>{order.shippingCity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Calendar size={16} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.detailText}>{formatDate(order.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.totalWrapper}>
                      <Text style={styles.totalLabel}>სულ</Text>
                      <Text style={styles.totalPrice}>{order.totalAmount.toFixed(2)} ₾</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => {
                      router.push(`/order/${order.id}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewMoreText}>დეტალები</Text>
                    <ChevronRight size={16} color="#6e39ea" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              );
            })
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
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  titleContainer: {
    gap: 4,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    fontFamily: 'MarkGEO-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  statDividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
  filterScroll: {
    marginHorizontal: -20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterCard: {
    minWidth: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCardActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterIconBgActive: {
    backgroundColor: '#f3f4f6',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
    fontFamily: 'MarkGEO-Regular',
  },
  filterLabelActive: {
    color: '#1a1a1a',
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#7c3aed',
  },
  filterCount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  filterCountActive: {
    color: '#fff',
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderLeft: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'MarkGEO-Regular',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
  },
  itemImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'MarkGEO-Regular',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  moreItems: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  orderDetails: {
    flex: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  totalWrapper: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  totalPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
