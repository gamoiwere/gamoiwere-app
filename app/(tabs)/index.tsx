import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Bell, TrendingUp, Sparkles, Zap, Star, Flame, Award, Package, Clock, MapPin, Shield, Truck } from 'lucide-react-native';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import { Product } from '@/types';
import { authService } from '@/services/auth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadProducts();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const [popularResponse, bestResponse] = await Promise.all([
        fetch('https://service.devmonkeys.ge/api/searchRatingListItemsPopular'),
        fetch('https://service.devmonkeys.ge/api/searchRatingListItemsBest')
      ]);

      const popularData = await popularResponse.json();
      const bestData = await bestResponse.json();

      const popularItems = popularData?.OtapiItemInfoSubList?.Content || [];
      const bestItems = bestData?.OtapiItemInfoSubList?.Content || [];

      console.log('Popular items:', popularItems.length);
      console.log('Best items:', bestItems.length);

      const formatProduct = (item: any) => {
        const getRatingFromFeatured = () => {
          if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
            const ratingObj = item.FeaturedValues.find((fv: any) => fv.Name === 'rating');
            return ratingObj ? parseFloat(ratingObj.Value) : 0;
          }
          return 0;
        };

        const getReviewCountFromFeatured = () => {
          if (item.FeaturedValues && Array.isArray(item.FeaturedValues)) {
            const reviewObj = item.FeaturedValues.find((fv: any) => fv.Name === 'reviews');
            return reviewObj ? parseInt(reviewObj.Value) : 0;
          }
          return 0;
        };

        const price = item.Price?.ConvertedPriceList?.Internal?.Price || 0;
        const originalPrice = item.Price?.OriginalPrice || 0;

        return {
          id: item.Id,
          name: item.OriginalTitle || item.Title,
          name_ka: item.Title,
          description: item.Description || '',
          description_ka: item.Description || '',
          price: parseFloat(price.toString()),
          original_price: parseFloat(originalPrice.toString()),
          image_url: item.MainPictureUrl || '',
          category: item.CategoryName || '',
          category_ka: item.CategoryName || '',
          brand: item.BrandName || '',
          vendor: item.VendorName || '',
          rating: getRatingFromFeatured(),
          review_count: getReviewCountFromFeatured(),
          is_recommended: true,
          is_popular: true,
          in_stock: item.MasterQuantity > 0,
          created_at: new Date().toISOString(),
        };
      };

      if (bestItems.length > 0) {
        const formattedRecommended = bestItems.map(formatProduct).slice(0, 10);
        setRecommendedProducts(formattedRecommended);
      }

      if (popularItems.length > 0) {
        const formattedPopular = popularItems.map(formatProduct).slice(0, 10);
        setPopularProducts(formattedPopular);
      }
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
              <Text style={styles.brandName}>{userName || 'gamoiwere.ge'}</Text>
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

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroSection}>
          <TouchableOpacity activeOpacity={0.95}>
            <LinearGradient
              colors={['#1e293b', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainHeroCard}
            >
              <View style={styles.heroTopRow}>
                <View>
                  <View style={styles.premiumBadge}>
                    <Sparkles size={12} color="#fbbf24" strokeWidth={2.5} />
                    <Text style={styles.premiumText}>პრემიუმ</Text>
                  </View>
                  <Text style={styles.heroNumber}>800M+</Text>
                  <Text style={styles.heroLabel}>პროდუქტი მთელი მსოფლიოდან</Text>
                </View>
                <View style={styles.heroIconCircle}>
                  <Package size={32} color="#fff" strokeWidth={2} />
                </View>
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>50K+</Text>
                  <Text style={styles.statText}>ბრენდი</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>200K+</Text>
                  <Text style={styles.statText}>მომხმარებელი</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>10-14</Text>
                  <Text style={styles.statText}>დღე</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.featuresRow}>
            <TouchableOpacity style={styles.compactFeature} activeOpacity={0.85}>
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.compactFeatureGradient}
              >
                <View style={styles.compactFeatureIcon}>
                  <Truck size={20} color="#fff" strokeWidth={2.5} />
                </View>
                <View style={styles.compactFeatureText}>
                  <Text style={styles.compactFeatureTitle}>სწრაფი მიწოდება</Text>
                  <Text style={styles.compactFeatureDesc}>10-14 დღე</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.compactFeature} activeOpacity={0.85}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.compactFeatureGradient}
              >
                <View style={styles.compactFeatureIcon}>
                  <Shield size={20} color="#fff" strokeWidth={2.5} />
                </View>
                <View style={styles.compactFeatureText}>
                  <Text style={styles.compactFeatureTitle}>100% გარანტია</Text>
                  <Text style={styles.compactFeatureDesc}>დაცული</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
                <Loader />
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
                <Loader />
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
      </Animated.ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  mainHeroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  heroNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactFeature: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  compactFeatureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  compactFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactFeatureText: {
    flex: 1,
  },
  compactFeatureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  compactFeatureDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  section: {
    paddingHorizontal: 8,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  productColumn: {
    width: '50%',
    paddingHorizontal: 4,
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
    height: 120,
  },
});
