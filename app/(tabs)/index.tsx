import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Bell, TrendingUp, Sparkles, Star, Package, Plane } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import { Product } from '@/types';
import { authService } from '@/services/auth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const scrollY = new Animated.Value(0);

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
      <StatusBar barStyle="dark-content" />
      <View style={StyleSheet.absoluteFillObject} />

      <View style={[styles.headerContent, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>გამარჯობა!</Text>
            <Text style={styles.brandName}>{userName || 'gamoiwere.ge'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <View style={styles.notificationDot} />
            <Bell size={22} color="#6b7280" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchContainer} activeOpacity={0.9}>
          <View style={styles.searchInner}>
            <Search size={20} color="#7816d6" strokeWidth={2.5} />
            <Text style={styles.searchText}>ძებნა პროდუქტების...</Text>
          </View>
        </TouchableOpacity>
      </View>

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
              colors={['#7816d6', '#9333ea', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.deliveryHeroCard}
            >
              <View style={styles.heroDecoCircle1} />
              <View style={styles.heroDecoCircle2} />
              
              <View style={styles.deliveryContent}>
                <View style={styles.deliveryLeft}>
                  <View style={styles.deliveryBadge}>
                    <Plane size={14} color="#7816d6" strokeWidth={2.5} />
                    <Text style={styles.deliveryBadgeText}>ავიამიწოდება</Text>
                  </View>
                  
                  <Text style={styles.deliveryTitle}>მიწოდება საქართველოში</Text>
                  
                  <View style={styles.deliveryDaysRow}>
                    <Text style={styles.deliveryDaysNumber}>10-14</Text>
                    <View style={styles.deliveryDaysLabel}>
                      <Text style={styles.deliveryDaysText}>სამუშაო</Text>
                      <Text style={styles.deliveryDaysText}>დღე</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.deliverySubtext}>800M+ პროდუქტი მთელი მსოფლიოდან</Text>
                </View>
                
                <View style={styles.deliveryRight}>
                  <View style={styles.planeContainer}>
                    <View style={styles.planeCircle}>
                      <Plane size={36} color="#fff" strokeWidth={2} style={{ transform: [{ rotate: '-45deg' }] }} />
                    </View>
                    <View style={styles.planePath} />
                    <View style={styles.planeDot1} />
                    <View style={styles.planeDot2} />
                    <View style={styles.planeDot3} />
                  </View>
                </View>
              </View>
              
              <View style={styles.deliveryStatsRow}>
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryStatNum}>50K+</Text>
                  <Text style={styles.deliveryStatLabel}>ბრენდი</Text>
                </View>
                <View style={styles.deliveryStatDivider} />
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryStatNum}>200K+</Text>
                  <Text style={styles.deliveryStatLabel}>მომხმარებელი</Text>
                </View>
                <View style={styles.deliveryStatDivider} />
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryStatNum}>24/7</Text>
                  <Text style={styles.deliveryStatLabel}>მხარდაჭერა</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Sparkles size={22} color="#7816d6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>რეკომენდირებული</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>ყველა</Text>
              <TrendingUp size={14} color="#7816d6" strokeWidth={2.5} />
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
              <TrendingUp size={22} color="#7816d6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>პოპულარული</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>ყველა</Text>
              <Star size={14} color="#7816d6" strokeWidth={2.5} />
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
    backgroundColor: '#f8f9fa',
  },
  glowOrb1: {
    display: 'none',
  },
  glowOrb2: {
    display: 'none',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7816d6',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: {
    fontSize: 15,
    color: '#9ca3af',
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
    paddingTop: 8,
    gap: 12,
  },
  deliveryHeroCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  deliveryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  deliveryLeft: {
    flex: 1,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  deliveryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7816d6',
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  deliveryDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  deliveryDaysNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -3,
    lineHeight: 56,
  },
  deliveryDaysLabel: {},
  deliveryDaysText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  deliverySubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  deliveryRight: {
    marginLeft: 16,
  },
  planeContainer: {
    position: 'relative',
    width: 80,
    height: 100,
  },
  planeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  planePath: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  planeDot1: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  planeDot2: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  planeDot3: {
    position: 'absolute',
    bottom: 22,
    left: -6,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  deliveryStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  deliveryStat: {
    flex: 1,
    alignItems: 'center',
  },
  deliveryStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  deliveryStatNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  deliveryStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 3,
  },
  section: {
    paddingHorizontal: 8,
    marginTop: 24,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7816d6',
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
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 40,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
});
