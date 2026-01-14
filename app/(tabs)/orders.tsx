import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ordersService } from '@/services/orders';
import { Order } from '@/types';
import { Package, Clock, Truck, CheckCircle, XCircle, CreditCard, MapPin, Calendar, ShoppingBag, ChevronRight, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Loader from '@/components/Loader';

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
      const currentUser = await authService.getUser();
      setUser(currentUser);

      if (currentUser) {
        const token = await authService.getToken();
        if (token) {
          await loadOrders('ALL');
        }
      }
    } catch (error) {
      console.error('Error in checkUserAndLoadOrders:', error);
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

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('სერვერის პასუხი არასწორია');
      }

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
      PENDING: { icon: Clock, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', text: 'მუშავდება' },
      PROCESSING: { icon: Package, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', text: 'მზადდება' },
      PAID: { icon: CreditCard, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', text: 'გადახდილია' },
      SHIPPED: { icon: Truck, color: '#7816d6', bgColor: 'rgba(120, 22, 214, 0.08)', text: 'გზაშია' },
      DELIVERED: { icon: CheckCircle, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', text: 'მიწოდებულია' },
      CANCELLED: { icon: XCircle, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', text: 'გაუქმებულია' },
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
                  <Package size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>შეკვეთები</Text>
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

  if (!user) {
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
                  <Package size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>შეკვეთები</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <View style={styles.authIcon}>
                <ShoppingBag size={48} color="#7816d6" strokeWidth={2} />
              </View>
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
              <Text style={styles.authButtonText}>შესვლა</Text>
              <ChevronRight size={20} color="#fff" strokeWidth={3} />
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
                <Package size={20} color="#7816d6" strokeWidth={2.5} />
              </View>
              <Text style={styles.headerTitle}>შეკვეთები</Text>
            </View>
            <View style={styles.statsCompact}>
              <Text style={styles.statNumberCompact}>{totalCount}</Text>
              <Text style={styles.statTextCompact}>სულ</Text>
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
                      size={16}
                      color={isActive ? '#7816d6' : 'rgba(255, 255, 255, 0.5)'}
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
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Package size={64} color="rgba(255, 255, 255, 0.3)" strokeWidth={1.5} />
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
                  <ShoppingBag size={20} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.shopNowText}>დაიწყე შოპინგი</Text>
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
                                <Package size={16} color="rgba(255, 255, 255, 0.4)" strokeWidth={2} />
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
                        <MapPin size={16} color="rgba(255, 255, 255, 0.4)" strokeWidth={2} />
                        <Text style={styles.detailText}>{order.shippingCity}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Calendar size={16} color="rgba(255, 255, 255, 0.4)" strokeWidth={2} />
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
                    <ChevronRight size={16} color="#7816d6" strokeWidth={2.5} />
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
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
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
  filterScroll: {
    marginHorizontal: -20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterCardActive: {
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    borderColor: 'rgba(120, 22, 214, 0.15)',
  },
  filterIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconBgActive: {
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  filterLabelActive: {
    color: '#1f2937',
  },
  filterBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(120, 22, 214, 0.25)',
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  filterCountActive: {
    color: '#7816d6',
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
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'MarkGEO-Regular',
    marginBottom: 24,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7816d6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 8,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'MarkGEO-Regular',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.08)',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orderLeft: {
    gap: 2,
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.3,
    fontFamily: 'MarkGEO-Regular',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'MarkGEO-Regular',
  },
  itemsContainer: {
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'MarkGEO-Regular',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7816d6',
    fontFamily: 'MarkGEO-Regular',
  },
  moreItems: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7816d6',
    fontFamily: 'MarkGEO-Regular',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orderDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  totalWrapper: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7816d6',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
