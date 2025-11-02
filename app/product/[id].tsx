import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Package, Zap, TrendingUp, Shield, Truck, Award, ThumbsUp, MessageCircle, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ProductDetail {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  brandName: string;
  vendorName: string;
  price: number;
  inStock: boolean;
  mainImage: string;
  images: string[];
  variations?: any[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`https://service.devmonkeys.ge/api/batchGetItemFullInfo?itemId=${id}`);
      const data = await response.json();

      if (data.ErrorCode === 'Ok' && data.Result?.Item) {
        const item = data.Result.Item;
        const images = item.Pictures?.map((p: any) => p.Url) || [];

        setProduct({
          id: item.Id,
          title: item.Title,
          originalTitle: item.OriginalTitle,
          description: item.Description,
          brandName: item.BrandName,
          vendorName: item.VendorName,
          price: item.Price?.ConvertedPriceList?.Internal?.Price || 0,
          inStock: item.MasterQuantity > 0,
          mainImage: item.MainPictureUrl,
          images: images,
          variations: item.Variations,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#6e39ea', '#9333ea']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.5} />
              </BlurView>
            ) : (
              <View style={styles.headerBlur}>
                <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.errorText}>პროდუქტი ვერ მოიძებნა</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={styles.headerBlur}>
              <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.5} />
            </BlurView>
          ) : (
            <View style={styles.headerBlur}>
              <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.5} />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <Share2 size={20} color="#1a1a1a" strokeWidth={2.5} />
              </BlurView>
            ) : (
              <View style={styles.headerBlur}>
                <Share2 size={20} color="#1a1a1a" strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsFavorite(!isFavorite)}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <Heart
                  size={20}
                  color={isFavorite ? '#6e39ea' : '#1a1a1a'}
                  strokeWidth={2.5}
                  fill={isFavorite ? '#6e39ea' : 'transparent'}
                />
              </BlurView>
            ) : (
              <View style={styles.headerBlur}>
                <Heart
                  size={20}
                  color={isFavorite ? '#6e39ea' : '#1a1a1a'}
                  strokeWidth={2.5}
                  fill={isFavorite ? '#6e39ea' : 'transparent'}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.mainImage }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
          {!product.inStock && (
            <View style={styles.outOfStockBadge}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
                  <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
                </BlurView>
              ) : (
                <View style={styles.badgeBlur}>
                  <Text style={styles.outOfStockText}>არ არის მარაგში</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {product.images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          <View style={styles.topSection}>
            <View style={styles.categoryBadge}>
              <Package size={14} color="#6e39ea" strokeWidth={2.5} />
              <Text style={styles.category}>{product.brandName}</Text>
            </View>

            {product.inStock && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color="#10b981" strokeWidth={2.5} />
                <Text style={styles.trendingText}>მარაგშია</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{product.title}</Text>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>ფასი</Text>
              <Text style={styles.price}>₾{product.price.toFixed(2)}</Text>
            </View>

            <LinearGradient
              colors={['rgba(110, 57, 234, 0.1)', 'rgba(147, 51, 234, 0.1)']}
              style={styles.saveBadge}
            >
              <Text style={styles.saveText}>დაზოგე 30%</Text>
            </LinearGradient>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Shield size={18} color="#6e39ea" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>გარანტია</Text>
                <Text style={styles.featureSubtitle}>12 თვე</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Truck size={18} color="#6e39ea" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>მიწოდება</Text>
                <Text style={styles.featureSubtitle}>უფასო</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Star size={18} color="#6e39ea" strokeWidth={2.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>რეიტინგი</Text>
                <Text style={styles.featureSubtitle}>4.8/5.0</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>აღწერა</Text>
            <Text style={styles.description}>
              {product.description || 'აღწერა არ არის ხელმისაწვდომი'}
            </Text>
          </View>

          {product.vendorName && (
            <View style={styles.vendorSection}>
              <Text style={styles.vendorLabel}>გამყიდველი:</Text>
              <Text style={styles.vendorName}>{product.vendorName}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>დამატებითი ინფორმაცია</Text>
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightItem}>
                <Package size={18} color="#3b82f6" strokeWidth={2.5} />
                <Text style={styles.highlightText}>ბრენდი: {product.brandName}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Truck size={18} color="#22c55e" strokeWidth={2.5} />
                <Text style={styles.highlightText}>უფასო მიწოდება</Text>
              </View>
              <View style={styles.highlightItem}>
                <Shield size={18} color="#f59e0b" strokeWidth={2.5} />
                <Text style={styles.highlightText}>დაცული გადახდა</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>რაოდენობა</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#f5f5f5', '#ececec']}
                  style={styles.quantityButtonGradient}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantity}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#6e39ea', '#9333ea']}
                  style={styles.quantityButtonGradient}
                >
                  <Text style={styles.quantityButtonTextActive}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.98)', '#fff']}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>სულ ფასი</Text>
              <Text style={styles.totalPrice}>₾{(product.price * quantity).toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              disabled={!product.inStock}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={product.inStock ? ['#6e39ea', '#9333ea'] : ['#ccc', '#999']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addToCartGradient}
              >
                {product.inStock ? (
                  <Zap size={20} color="#fff" strokeWidth={2.5} fill="#fff" />
                ) : (
                  <ShoppingCart size={20} color="#fff" strokeWidth={2.5} />
                )}
                <Text style={styles.addToCartButtonText}>
                  {product.inStock ? 'დამატება კალათაში' : 'არ არის მარაგში'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  backButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerBlur: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 120,
    left: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '800',
  },
  ratingCount: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(110, 57, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  category: {
    fontSize: 12,
    color: '#6e39ea',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendingText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 20,
    lineHeight: 40,
    letterSpacing: -1,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6e39ea',
    letterSpacing: -1,
  },
  saveBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 14,
    color: '#6e39ea',
    fontWeight: '800',
  },
  featuresContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(110, 57, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 26,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quantityButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  quantityButtonTextActive: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  quantityDisplay: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quantity: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  bottomSpacer: {
    height: 120,
  },
  highlightsContainer: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  thumbnailContainer: {
    marginTop: -16,
    marginBottom: 16,
  },
  thumbnailContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#6e39ea',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  vendorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  vendorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6e39ea',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reviewsRating: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  reviewsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  reviewsList: {
    gap: 16,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  reviewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  viewAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    padding: 14,
    borderRadius: 12,
  },
  viewAllReviewsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3b82f6',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  footerGradient: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  addToCartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
