import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Animated, StatusBar, Modal } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Bell, TrendingUp, Sparkles, Star, Package, Shield, Truck, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';
import Loader from '@/components/Loader';
import { Product } from '@/types';
import { authService } from '@/services/auth';
import { biometricService } from '@/services/biometric';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const scrollY = new Animated.Value(0);
  
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const hasCheckedBiometric = useRef(false);

  useEffect(() => {
    loadProducts();
    loadUserProfile();
    checkBiometricSetup();
  }, []);
  
  const checkBiometricSetup = async () => {
    if (hasCheckedBiometric.current) return;
    hasCheckedBiometric.current = true;
    
    try {
      const isSupported = await biometricService.isBiometricSupported();
      if (!isSupported) return;
      
      const isAlreadyEnabled = await biometricService.isBiometricEnabled();
      if (isAlreadyEnabled) return;
      
      const type = await biometricService.getBiometricType();
      setBiometricType(type);
      
      setTimeout(() => {
        setShowBiometricModal(true);
      }, 1000);
    } catch (error) {
      console.log('Error checking biometric setup:', error);
    }
  };
  
  const handleEnableBiometric = async () => {
    setBiometricLoading(true);
    try {
      const result = await biometricService.authenticate(`დაადასტურეთ ${biometricType} გამოყენება`);
      if (result.success) {
        const profile = await authService.getProfile();
        const username = profile?.email || profile?.phone || 'user';
        await biometricService.enableBiometric(username);
        setShowBiometricModal(false);
      }
    } catch (error) {
      console.log('Biometric enable error:', error);
    } finally {
      setBiometricLoading(false);
    }
  };
  
  const handleSkipBiometric = () => {
    setShowBiometricModal(false);
  };

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
            <View style={styles.mainHeroCard}>
              <View style={styles.heroCardGradient}>
                <View style={styles.heroTopRow}>
                  <View>
                    <View style={styles.premiumBadge}>
                      <Sparkles size={12} color="#fff" strokeWidth={2.5} />
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
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>200K+</Text>
                    <Text style={styles.statText}>მომხმარებელი</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>10-14</Text>
                    <Text style={styles.statText}>დღე</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.featuresRow}>
            <TouchableOpacity style={styles.compactFeature} activeOpacity={0.85}>
              <View style={styles.featureCard}>
                <View style={styles.compactFeatureIcon}>
                  <Truck size={18} color="#7816d6" strokeWidth={2.5} />
                </View>
                <View style={styles.compactFeatureText}>
                  <Text style={styles.compactFeatureTitle}>სწრაფი მიწოდება</Text>
                  <Text style={styles.compactFeatureDesc}>10-14 დღე</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.compactFeature} activeOpacity={0.85}>
              <View style={styles.featureCard}>
                <View style={styles.compactFeatureIcon}>
                  <Shield size={18} color="#7816d6" strokeWidth={2.5} />
                </View>
                <View style={styles.compactFeatureText}>
                  <Text style={styles.compactFeatureTitle}>100% გარანტია</Text>
                  <Text style={styles.compactFeatureDesc}>დაცული</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
      
      <Modal
        visible={showBiometricModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipBiometric}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.biometricModal}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={handleSkipBiometric}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <View style={styles.biometricIconContainer}>
              <Text style={styles.biometricEmoji}>
                {biometricType === 'Face ID' ? '👤' : '👆'}
              </Text>
            </View>
            
            <Text style={styles.biometricTitle}>
              {biometricType} ჩართვა
            </Text>
            <Text style={styles.biometricSubtitle}>
              გსურთ {biometricType}-ის გამოყენება სწრაფი შესვლისთვის?
            </Text>
            
            <TouchableOpacity
              style={[styles.biometricEnableBtn, biometricLoading && styles.disabledBtn]}
              onPress={handleEnableBiometric}
              disabled={biometricLoading}
            >
              <Text style={styles.biometricEnableBtnText}>
                {biometricLoading ? 'მოწმდება...' : `ჩართვა ${biometricType}`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.biometricSkipBtn}
              onPress={handleSkipBiometric}
            >
              <Text style={styles.biometricSkipBtnText}>არა, მოგვიანებით</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  mainHeroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#7816d6',
  },
  heroCardGradient: {
    padding: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactFeature: {
    flex: 1,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactFeatureText: {
    flex: 1,
  },
  compactFeatureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  compactFeatureDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  biometricModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  biometricEmoji: {
    fontSize: 40,
  },
  biometricTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  biometricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  biometricEnableBtn: {
    width: '100%',
    backgroundColor: '#7816d6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  biometricEnableBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  biometricSkipBtn: {
    paddingVertical: 12,
  },
  biometricSkipBtnText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
