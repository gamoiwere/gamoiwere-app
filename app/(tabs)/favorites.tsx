import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, ShoppingBag, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services/auth';
import Loader from '@/components/Loader';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuth();
    setRefreshing(false);
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
                  <Heart size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>ფავორიტები</Text>
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
                  <Heart size={20} color="#7816d6" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>ფავორიტები</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <View style={styles.authIcon}>
                <Heart size={48} color="#7816d6" strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.authTitle}>შედით ანგარიშში</Text>
            <Text style={styles.authDescription}>
              ფავორიტების სანახავად და მართვისთვის{'\n'}გთხოვთ გაიარეთ ავტორიზაცია
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
                <Heart size={20} color="#7816d6" strokeWidth={2.5} />
              </View>
              <Text style={styles.headerTitle}>ფავორიტები</Text>
            </View>
            <View style={styles.statsCompact}>
              <Text style={styles.statNumberCompact}>{favorites.length}</Text>
              <Text style={styles.statTextCompact}>სულ</Text>
            </View>
          </View>
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
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Heart size={60} color="rgba(255, 255, 255, 0.3)" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>ფავორიტები ცარიელია</Text>
            <Text style={styles.emptyDescription}>
              დაამატეთ თქვენი საყვარელი პროდუქტები ფავორიტებში
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/')}
            >
              <ShoppingBag size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.emptyButtonText}>პროდუქტების ნახვა</Text>
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
  bottomSpace: {
    height: 100,
  },
});
