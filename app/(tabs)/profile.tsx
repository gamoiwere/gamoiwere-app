import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { User, Mail, Phone, LogOut, ChevronRight, Settings, Heart, Bell, HelpCircle, MapPin, UserCircle, Wallet, CreditCard, ShieldCheck, Truck, Package } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error loading user:', error);
      const cachedUser = await authService.getUser();
      setUser(cachedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>თქვენი</Text>
            <Text style={styles.headerTitle}>პროფილი</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <User size={64} color="#d1d5db" strokeWidth={1.5} />
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
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>თქვენი</Text>
            <Text style={styles.headerTitle}>პროფილი</Text>
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
                <User size={48} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              თქვენი პროფილის სანახავად და მართვისთვის
              გთხოვთ გაიარეთ ავტორიზაცია
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleNavigateToAuth}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7c3aed', '#8b5cf6']}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.headerSubtitle}>თქვენი</Text>
          <Text style={styles.headerTitle}>პროფილი</Text>
        </View>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <User size={48} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.full_name || user?.username || 'მომხმარებელი'}</Text>
            {user?.verification_status === 'verified' && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#10b981" strokeWidth={2} />
                <Text style={styles.verifiedText}>დადასტურებული</Text>
              </View>
            )}
            <View style={styles.contactInfo}>
              <Mail size={12} color="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
              <Text style={styles.contactText}>{user?.email}</Text>
            </View>
            {user?.phone && (
              <View style={styles.contactInfo}>
                <Phone size={12} color="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
                <Text style={styles.contactText}>{user.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.balanceSection}>
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <Wallet size={24} color="#fff" strokeWidth={2} />
              <Text style={styles.balanceTitle}>ხელმისაწვდომი ბალანსი</Text>
            </View>
            <Text style={styles.balanceMainAmount}>
              {user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} ₾
            </Text>
            {user?.balance_code && (
              <View style={styles.balanceCodeContainer}>
                <CreditCard size={16} color="#e9d5ff" strokeWidth={2} />
                <Text style={styles.balanceCodeLabel}>ბალანსის კოდი:</Text>
                <Text style={styles.balanceCode}>{user.balance_code}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {user?.pending_transportation_fees !== undefined && user.pending_transportation_fees > 0 && (
          <View style={styles.feesCard}>
            <View style={styles.feesContent}>
              <View style={styles.feesIcon}>
                <Truck size={20} color="#f59e0b" strokeWidth={2} />
              </View>
              <View style={styles.feesInfo}>
                <Text style={styles.feesLabel}>ტრანსპორტირების საფასური</Text>
                <Text style={styles.feesAmount}>{user.pending_transportation_fees.toFixed(2)} ₾</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ანგარიში</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#6e39ea20' }]}>
              <UserCircle size={20} color="#6e39ea" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>პროფილი</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/orders')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#8b5cf620' }]}>
              <Package size={20} color="#8b5cf6" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>შეკვეთები</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#10b98120' }]}>
              <Settings size={20} color="#10b981" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>პარამეტრები</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/addresses')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#3b82f620' }]}>
              <MapPin size={20} color="#3b82f6" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>მისამართები</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/favorites')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#ec489920' }]}>
              <Heart size={20} color="#ec4899" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>რჩეულები</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#f59e0b20' }]}>
              <Bell size={20} color="#f59e0b" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>შეტყობინებები</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>დახმარება</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#10b98120' }]}>
              <HelpCircle size={20} color="#10b981" strokeWidth={2} />
            </View>
            <Text style={styles.menuItemText}>დახმარება და მხარდაჭერა</Text>
          </View>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#dc2626" strokeWidth={2} />
          <Text style={styles.logoutText}>გასვლა</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
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
    shadowColor: '#7c3aed',
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
    shadowColor: '#7c3aed',
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
  headerGradient: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    fontFamily: 'MarkGEO-Regular',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    fontFamily: 'MarkGEO-Regular',
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  balanceMainAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -1.5,
    fontFamily: 'MarkGEO-Regular',
  },
  balanceCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  balanceCodeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'MarkGEO-Regular',
  },
  balanceCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  feesCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  feesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  feesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feesInfo: {
    flex: 1,
  },
  feesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  feesAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f59e0b',
    fontFamily: 'MarkGEO-Regular',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'MarkGEO-Regular',
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpacer: {
    height: 100,
  },
});
