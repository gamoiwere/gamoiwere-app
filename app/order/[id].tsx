import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ordersService } from '@/services/orders';
import { Order } from '@/types';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, CreditCard, MapPin, Calendar, Phone, User, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      if (typeof id === 'string') {
        const orderData = await ordersService.getOrderById(id);
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6e39ea', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>შეკვეთის დეტალები</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Package size={56} color="#6e39ea" strokeWidth={2} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6e39ea', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>შეკვეთის დეტალები</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>შეკვეთა ვერ მოიძებნა</Text>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6e39ea', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შეკვეთა #{order.orderNumber}</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={[styles.statusBanner, { backgroundColor: statusInfo.bgColor }]}>
              <StatusIcon size={32} color={statusInfo.color} strokeWidth={2.5} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>სტატუსი</Text>
                <Text style={[styles.statusValue, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={20} color="#6b7280" strokeWidth={2} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>შეკვეთის თარიღი</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>პროდუქტები</Text>
            <View style={styles.itemsCard}>
              {order.items?.map((item, index) => (
                <View
                  key={index}
                  style={[styles.itemRow, index > 0 && styles.itemRowBorder]}
                >
                  <View style={styles.itemImageWrapper}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    ) : (
                      <View style={styles.itemImagePlaceholder}>
                        <Package size={24} color="#9ca3af" strokeWidth={2} />
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemQty}>რაოდენობა: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>{item.price.toFixed(2)} ₾</Text>
                    </View>
                  </View>
                  <View style={styles.itemTotalContainer}>
                    <Text style={styles.itemTotal}>
                      {(item.price * item.quantity).toFixed(2)} ₾
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>მიწოდების მისამართი</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressRow}>
                <MapPin size={20} color="#6e39ea" strokeWidth={2} />
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>მისამართი</Text>
                  <Text style={styles.addressValue}>{order.shippingAddress}</Text>
                  <Text style={styles.addressCity}>{order.shippingCity}</Text>
                </View>
              </View>

              {order.customerName && (
                <View style={styles.addressRow}>
                  <User size={20} color="#6e39ea" strokeWidth={2} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>მიმღების სახელი</Text>
                    <Text style={styles.addressValue}>{order.customerName}</Text>
                  </View>
                </View>
              )}

              {order.customerPhone && (
                <View style={styles.addressRow}>
                  <Phone size={20} color="#6e39ea" strokeWidth={2} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>ტელეფონი</Text>
                    <Text style={styles.addressValue}>{order.customerPhone}</Text>
                  </View>
                </View>
              )}

              {order.customerEmail && (
                <View style={styles.addressRow}>
                  <Mail size={20} color="#6e39ea" strokeWidth={2} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>ელ. ფოსტა</Text>
                    <Text style={styles.addressValue}>{order.customerEmail}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ჯამური ღირებულება</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>შუალედური ჯამი</Text>
                <Text style={styles.summaryValue}>
                  {order.items
                    ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}{' '}
                  ₾
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>სულ</Text>
                <Text style={styles.summaryTotalValue}>{order.totalAmount.toFixed(2)} ₾</Text>
              </View>
            </View>
          </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  itemImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e39ea',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '900',
  },
  summaryTotalValue: {
    fontSize: 28,
    color: '#6e39ea',
    fontWeight: '900',
  },
  bottomSpace: {
    height: 40,
  },
});
