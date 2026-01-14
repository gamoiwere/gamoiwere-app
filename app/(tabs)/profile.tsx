import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { User, Mail, Phone, LogOut, ChevronRight, Settings, Heart, Bell, HelpCircle, MapPin, UserCircle, Wallet, CreditCard, ShieldCheck, Truck, Package, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Loader from '@/components/Loader';
import AuthNotification from '@/components/AuthNotification';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const profile = await authService.getProfile();
      if (!profile) {
        const cachedUser = await authService.getUser();
        setUser(cachedUser);
      } else {
        setUser(profile);
      }
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
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['#f8f9fa', '#f8f9fa', '#f8f9fa']}
          style={styles.background}
        />
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>პროფილი</Text>
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
          colors={['#f8f9fa', '#f8f9fa', '#f8f9fa']}
          style={styles.background}
        />
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        
        <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>პროფილი</Text>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <LinearGradient
                colors={['#7816d6', '#7816d6', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authIcon}
              >
                <User size={48} color="#fff" strokeWidth={1.8} />
              </LinearGradient>
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              თქვენი პროფილის სანახავად და მართვისთვის{'\n'}გთხოვთ გაიარეთ ავტორიზაცია
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleNavigateToAuth}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7816d6', '#7816d6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authButtonGradient}
              >
                <Text style={styles.authButtonText}>შესვლა</Text>
                <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
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
        colors={['#f8f9fa', '#f8f9fa', '#f8f9fa']}
        style={styles.background}
      />
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />
      <View style={styles.glowOrb3} />
      
      <AuthNotification
        visible={showAuthNotification}
        message={authMessage}
        onHide={() => setShowAuthNotification(false)}
        onLogin={handleNavigateToAuth}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>პროფილი</Text>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(120, 22, 214, 0.08)', 'rgba(168, 85, 247, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCardGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#7816d6', '#7816d6', '#c084fc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <User size={36} color="#fff" strokeWidth={1.8} />
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.full_name || user?.username || 'მომხმარებელი'}
                  </Text>
                  {user?.verification_status === 'verified' && (
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck size={12} color="#10b981" strokeWidth={2.5} />
                    </View>
                  )}
                </View>
                <Text style={styles.userHandle}>@{user?.username || 'user'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push('/profile/edit')}
                activeOpacity={0.7}
              >
                <Edit3 size={18} color="#7816d6" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={16} color="#9ca3af" strokeWidth={2} />
                <Text style={styles.contactText} numberOfLines={1}>{user?.email}</Text>
              </View>
              {user?.phone && (
                <View style={styles.contactItem}>
                  <Phone size={16} color="#9ca3af" strokeWidth={2} />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceLeft}>
              <View style={styles.balanceIconContainer}>
                <Wallet size={22} color="#7816d6" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.balanceLabel}>ბალანსი</Text>
                <Text style={styles.balanceAmount}>
                  {user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} ₾
                </Text>
              </View>
            </View>
            {user?.balance_code && (
              <View style={styles.balanceCodeContainer}>
                <CreditCard size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.balanceCode}>{user.balance_code}</Text>
              </View>
            )}
          </View>

          {user?.pending_transportation_fees !== undefined && user.pending_transportation_fees > 0 && (
            <View style={styles.feesCard}>
              <View style={styles.feesLeft}>
                <View style={styles.feesIconContainer}>
                  <Truck size={20} color="#f59e0b" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.feesLabel}>ტრანსპორტირება</Text>
                  <Text style={styles.feesAmount}>{user.pending_transportation_fees.toFixed(2)} ₾</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>მენიუ</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/orders')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Package size={20} color="#3b82f6" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>შეკვეთები</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/addresses')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <MapPin size={20} color="#f59e0b" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>მისამართები</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Heart size={20} color="#ec4899" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>რჩეულები</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(120, 22, 214, 0.08)' }]}>
                <Bell size={20} color="#7816d6" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>შეტყობინებები</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Settings size={20} color="#10b981" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>პარამეტრები</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <HelpCircle size={20} color="#6366f1" strokeWidth={2} />
              </View>
              <Text style={styles.menuItemText}>დახმარება</Text>
            </View>
            <ChevronRight size={18} color="#4b5563" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
          <Text style={styles.logoutText}>გასვლა</Text>
        </TouchableOpacity>

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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 200,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  glowOrb3: {
    position: 'absolute',
    top: height * 0.5,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
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
    borderRadius: 24,
    padding: 32,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  authDescription: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  authButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
    borderRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHandle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  balanceSection: {
    marginBottom: 24,
    gap: 12,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  balanceCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7816d6',
  },
  feesCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  feesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  feesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  feesAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f59e0b',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  bottomSpace: {
    height: 100,
  },
});
