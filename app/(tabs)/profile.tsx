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
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>პროფილი</Text>
              </View>
            </View>
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
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>პროფილი</Text>
              </View>
            </View>
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
                <User size={48} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              თქვენი პროფილის სანახავად და მართვისთვის{'\n'}გთხოვთ გაიარეთ ავტორიზაცია
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
              <Text style={styles.headerTitle}>პროფილი</Text>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarContainer}
              >
                <User size={32} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.full_name || user?.username || 'მომხმარებელი'}
                </Text>
                {user?.verification_status === 'verified' && (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color="#10b981" strokeWidth={2.5} />
                    <Text style={styles.verifiedText}>დადასტურებული</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.contactSection}>
              <View style={styles.contactRow}>
                <Mail size={14} color="rgba(255, 255, 255, 0.85)" strokeWidth={2} />
                <Text style={styles.contactText} numberOfLines={1}>{user?.email}</Text>
              </View>
              {user?.phone && (
                <View style={styles.contactRow}>
                  <Phone size={14} color="rgba(255, 255, 255, 0.85)" strokeWidth={2} />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.balanceSection}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceIconBg}>
                  <Wallet size={20} color="#7c3aed" strokeWidth={2.5} />
                </View>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceLabel}>ბალანსი</Text>
                  <Text style={styles.balanceAmount}>
                    {user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} ₾
                  </Text>
                </View>
              </View>
              {user?.balance_code && (
                <View style={styles.balanceCodeRow}>
                  <CreditCard size={14} color="#9ca3af" strokeWidth={2} />
                  <Text style={styles.balanceCodeLabel}>კოდი:</Text>
                  <Text style={styles.balanceCode}>{user.balance_code}</Text>
                </View>
              )}
            </View>

            {user?.pending_transportation_fees !== undefined && user.pending_transportation_fees > 0 && (
              <View style={styles.feesCard}>
                <View style={styles.feesHeader}>
                  <View style={styles.feesIconBg}>
                    <Truck size={18} color="#f59e0b" strokeWidth={2.5} />
                  </View>
                  <View style={styles.feesInfo}>
                    <Text style={styles.feesLabel}>ტრანსპორტირება</Text>
                    <Text style={styles.feesAmount}>{user.pending_transportation_fees.toFixed(2)} ₾</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/orders')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#dbeafe' }]}>
                  <Package size={20} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>შეკვეთები</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#ede9fe' }]}>
                  <UserCircle size={20} color="#7c3aed" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>პროფილის რედაქტირება</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/addresses')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                  <MapPin size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>მისამართები</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/favorites')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#fce7f3' }]}>
                  <Heart size={20} color="#ec4899" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>რჩეულები</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                  <Bell size={20} color="#f59e0b" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>შეტყობინებები</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#d1fae5' }]}>
                  <Settings size={20} color="#10b981" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>პარამეტრები</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#dbeafe' }]}>
                  <HelpCircle size={20} color="#3b82f6" strokeWidth={2.5} />
                </View>
                <Text style={styles.menuItemText}>დახმარება</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={18} color="#dc2626" strokeWidth={2.5} />
              <Text style={styles.logoutText}>გასვლა</Text>
            </TouchableOpacity>
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
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: 'MarkGEO-Regular',
  },
  contactSection: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'MarkGEO-Regular',
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  balanceSection: {
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  balanceCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  balanceCodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  balanceCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7c3aed',
    letterSpacing: 0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  feesCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  feesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feesIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feesInfo: {
    flex: 1,
  },
  feesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  feesAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
