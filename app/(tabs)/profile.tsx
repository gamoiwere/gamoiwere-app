import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { User, Mail, Phone, LogOut, ChevronRight, Settings, Heart, Bell, HelpCircle, MapPin, UserCircle, Wallet, CreditCard, ShieldCheck, Truck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
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
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>პროფილი</Text>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <User size={48} color="#6e39ea" strokeWidth={2} />
          </View>
          <Text style={styles.guestTitle}>შედით თქვენს ანგარიშში</Text>
          <Text style={styles.guestSubtitle}>
            შეკვეთების შესახებ ინფორმაციის სანახავად და თქვენი პროფილის მართვისთვის
          </Text>

          <TouchableOpacity style={styles.loginButton} onPress={handleNavigateToAuth}>
            <Text style={styles.loginButtonText}>შესვლა</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>რეგისტრაცია</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#6e39ea', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <User size={48} color="#fff" strokeWidth={2.5} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name || user?.username || 'მომხმარებელი'}</Text>
              {user?.verification_status === 'verified' && (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={14} color="#10b981" strokeWidth={2} />
                  <Text style={styles.verifiedText}>დადასტურებული</Text>
                </View>
              )}
              <View style={styles.contactInfo}>
                <Mail size={12} color="#e9d5ff" strokeWidth={2} />
                <Text style={styles.contactText}>{user?.email}</Text>
              </View>
              {user?.phone && (
                <View style={styles.contactInfo}>
                  <Phone size={12} color="#e9d5ff" strokeWidth={2} />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.balanceSection}>
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#6e39ea', '#8b5cf6']}
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
          onPress={() => router.push('/(tabs)/categories')}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  guestContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6e39ea20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#6e39ea',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerLink: {
    color: '#6e39ea',
    fontSize: 15,
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
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
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#e9d5ff',
    fontWeight: '500',
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9d5ff',
  },
  balanceMainAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -1,
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
    color: '#e9d5ff',
  },
  balanceCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  feesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
  },
  feesAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f59e0b',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  bottomSpacer: {
    height: 20,
  },
});
