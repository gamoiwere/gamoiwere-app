import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Bell, TrendingUp, Sparkles, Zap, Star, Flame, Award, Package, Clock, MapPin, Shield, Truck } from 'lucide-react-native';
import ProductCard from '@/components/ProductCard';
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
              colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLeft}>
                  <View style={styles.heroBadge}>
                    <Sparkles size={14} color="#fbbf24" strokeWidth={2.5} />
                    <Text style={styles.heroBadgeText}>სპეციალური</Text>
                  </View>
                  <Text style={styles.heroTitle}>800M+ პროდუქტი{'\n'}ჩინეთიდან</Text>
                  <Text style={styles.heroSubtitle}>უსაფრთხო და სწრაფი მიწოდება</Text>
                  <View style={styles.heroFeatures}>
                    <View style={styles.heroFeature}>
                      <View style={styles.heroFeatureDot} />
                      <Text style={styles.heroFeatureText}>10-14 დღე</Text>
                    </View>
                    <View style={styles.heroFeature}>
                      <View style={styles.heroFeatureDot} />
                      <Text style={styles.heroFeatureText}>100% უსაფრთხო</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.heroRight}>
                  <View style={styles.heroIconBg}>
                    <Package size={40} color="#fff" strokeWidth={2} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.quickStatsCompact}>
            <View style={styles.statItemCompact}>
              <View style={styles.statIconCompact}>
                <Shield size={20} color="#7c3aed" strokeWidth={2.5} />
              </View>
              <View style={styles.statInfoCompact}>
                <Text style={styles.statValueCompact}>100%</Text>
                <Text style={styles.statLabelCompact}>გარანტია</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItemCompact}>
              <View style={styles.statIconCompact}>
                <Clock size={20} color="#7c3aed" strokeWidth={2.5} />
              </View>
              <View style={styles.statInfoCompact}>
                <Text style={styles.statValueCompact}>24/7</Text>
                <Text style={styles.statLabelCompact}>მხარდაჭერა</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItemCompact}>
              <View style={styles.statIconCompact}>
                <Truck size={20} color="#7c3aed" strokeWidth={2.5} />
              </View>
              <View style={styles.statInfoCompact}>
                <Text style={styles.statValueCompact}>სწრაფი</Text>
                <Text style={styles.statLabelCompact}>მიწოდება</Text>
              </View>
            </View>
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
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    gap: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 30,
    fontFamily: 'MarkGEO-Regular',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'MarkGEO-Regular',
  },
  heroFeatures: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
  },
  heroFeatureText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'MarkGEO-Regular',
  },
  heroRight: {
    marginLeft: 16,
  },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickStatsCompact: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItemCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconCompact: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfoCompact: {
    flex: 1,
  },
  statValueCompact: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statLabelCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
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
