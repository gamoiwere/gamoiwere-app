import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Package, Zap, TrendingUp, Shield, Truck, Award, ThumbsUp, MessageCircle, User } from 'lucide-react-native';
import { Product } from '@/types';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      setProduct(data);
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
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
          {!product.in_stock && (
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

          <View style={styles.ratingBadge}>
            <Star size={14} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingCount}>(256)</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.topSection}>
            <View style={styles.categoryBadge}>
              <Package size={14} color="#6e39ea" strokeWidth={2.5} />
              <Text style={styles.category}>{product.category_ka}</Text>
            </View>

            <View style={styles.trendingBadge}>
              <TrendingUp size={12} color="#10b981" strokeWidth={2.5} />
              <Text style={styles.trendingText}>ტრენდული</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name_ka}</Text>

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
              {product.description_ka || 'აღწერა არ არის ხელმისაწვდომი'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>რა გამოარჩევს?</Text>
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightItem}>
                <Award size={18} color="#3b82f6" strokeWidth={2.5} />
                <Text style={styles.highlightText}>ორიგინალური პროდუქტი</Text>
              </View>
              <View style={styles.highlightItem}>
                <ThumbsUp size={18} color="#22c55e" strokeWidth={2.5} />
                <Text style={styles.highlightText}>98% კმაყოფილება</Text>
              </View>
              <View style={styles.highlightItem}>
                <Shield size={18} color="#f59e0b" strokeWidth={2.5} />
                <Text style={styles.highlightText}>უსაფრთხო გადახდა</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>მიმოხილვები</Text>
              <View style={styles.reviewsBadge}>
                <Star size={14} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
                <Text style={styles.reviewsRating}>4.8</Text>
                <Text style={styles.reviewsCount}>(256)</Text>
              </View>
            </View>

            <View style={styles.reviewsList}>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <User size={16} color="#fff" strokeWidth={2.5} />
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>გიორგი მ.</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          color="#fbbf24"
                          strokeWidth={2.5}
                          fill="#fbbf24"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>2 დღის წინ</Text>
                </View>
                <Text style={styles.reviewText}>
                  შესანიშნავი პროდუქტი, ხარისხი შესაფერისია ფასთან. ძალიან კმაყოფილი ვარ შეძენით!
                </Text>
                <View style={styles.reviewFooter}>
                  <View style={styles.reviewAction}>
                    <ThumbsUp size={14} color="#666" strokeWidth={2} />
                    <Text style={styles.reviewActionText}>24</Text>
                  </View>
                  <View style={styles.reviewAction}>
                    <MessageCircle size={14} color="#666" strokeWidth={2} />
                    <Text style={styles.reviewActionText}>5</Text>
                  </View>
                </View>
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <User size={16} color="#fff" strokeWidth={2.5} />
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>ნინო კ.</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          color="#fbbf24"
                          strokeWidth={2.5}
                          fill="#fbbf24"
                        />
                      ))}
                      <Star size={12} color="#e5e5e5" strokeWidth={2.5} fill="#e5e5e5" />
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>1 კვირის წინ</Text>
                </View>
                <Text style={styles.reviewText}>
                  კარგი ხარისხის პროდუქტი, მაგრამ მიწოდება ცოტა დაგვიანდა.
                </Text>
                <View style={styles.reviewFooter}>
                  <View style={styles.reviewAction}>
                    <ThumbsUp size={14} color="#666" strokeWidth={2} />
                    <Text style={styles.reviewActionText}>12</Text>
                  </View>
                  <View style={styles.reviewAction}>
                    <MessageCircle size={14} color="#666" strokeWidth={2} />
                    <Text style={styles.reviewActionText}>2</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewAllReviews}>
              <Text style={styles.viewAllReviewsText}>ყველა მიმოხილვის ნახვა</Text>
              <Star size={16} color="#3b82f6" strokeWidth={2.5} />
            </TouchableOpacity>
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
              disabled={!product.in_stock}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={product.in_stock ? ['#6e39ea', '#9333ea'] : ['#ccc', '#999']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addToCartGradient}
              >
                {product.in_stock ? (
                  <Zap size={20} color="#fff" strokeWidth={2.5} fill="#fff" />
                ) : (
                  <ShoppingCart size={20} color="#fff" strokeWidth={2.5} />
                )}
                <Text style={styles.addToCartButtonText}>
                  {product.in_stock ? 'დამატება კალათაში' : 'არ არის მარაგში'}
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
