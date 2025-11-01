import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Bell, TrendingUp, Sparkles, Zap, Star } from 'lucide-react-native';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data: recommended } = await supabase
        .from('products')
        .select('*')
        .eq('is_recommended', true)
        .limit(10);

      const { data: popular } = await supabase
        .from('products')
        .select('*')
        .eq('is_popular', true)
        .limit(10);

      setRecommendedProducts(recommended || []);
      setPopularProducts(popular || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6e39ea', '#9333ea', '#6e39ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>გამარჯობა! 👋</Text>
              <Text style={styles.brandName}>gamoiwere.ge</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <View style={styles.notificationDot} />
              <Bell size={22} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchContainer} activeOpacity={0.9}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="light" style={styles.searchBlur}>
                <Search size={20} color="#6e39ea" strokeWidth={2.5} />
                <Text style={styles.searchText}>ძებნა პროდუქტების...</Text>
              </BlurView>
            ) : (
              <View style={styles.searchBlur}>
                <Search size={20} color="#6e39ea" strokeWidth={2.5} />
                <Text style={styles.searchText}>ძებნა პროდუქტების...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroOverlay} />

            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#fbbf24" strokeWidth={2.5} />
              <Text style={styles.heroBadgeText}>სპეციალური შეთავაზება</Text>
            </View>

            <Text style={styles.heroTitle}>50% ფასდაკლება</Text>
            <Text style={styles.heroSubtitle}>ყველა პროდუქტზე • შეზღუდული დრო</Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>2K+</Text>
                <Text style={styles.heroStatLabel}>პროდუქტი</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>500+</Text>
                <Text style={styles.heroStatLabel}>კმაყოფილი</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>4.9★</Text>
                <Text style={styles.heroStatLabel}>რეიტინგი</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.heroButton}>
              <LinearGradient
                colors={['#6e39ea', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroButtonGradient}
              >
                <Zap size={18} color="#fff" strokeWidth={2.5} fill="#fff" />
                <Text style={styles.heroButtonText}>შეიძინე ახლავე</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.heroDecor1} />
            <View style={styles.heroDecor2} />
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Sparkles size={24} color="#6e39ea" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>რეკომენდირებული</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>ყველა</Text>
              <TrendingUp size={16} color="#6e39ea" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>იტვირთება...</Text>
              </View>
            ) : recommendedProducts.length === 0 ? (
              <Text style={styles.emptyText}>პროდუქტები არ მოიძებნა</Text>
            ) : (
              recommendedProducts.map((product) => (
                <View key={product.id} style={styles.productColumn}>
                  <ProductCard product={product} />
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={24} color="#6e39ea" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>პოპულარული</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>ყველა</Text>
              <Star size={16} color="#6e39ea" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>იტვირთება...</Text>
              </View>
            ) : popularProducts.length === 0 ? (
              <Text style={styles.emptyText}>პროდუქტები არ მოიძებნა</Text>
            ) : (
              popularProducts.map((product) => (
                <View key={product.id} style={styles.productColumn}>
                  <ProductCard product={product} />
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
    borderColor: '#6e39ea',
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderRadius: 16,
  },
  searchText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    padding: 20,
    paddingTop: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 57, 234, 0.1)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  heroBadgeText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(110, 57, 234, 0.3)',
    opacity: 0.3,
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    opacity: 0.3,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(110, 57, 234, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6e39ea',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  productColumn: {
    width: '50%',
    paddingHorizontal: 6,
  },
  loadingContainer: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 40,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 30,
  },
});
