import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, PanResponder, Animated, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, Info, ChevronRight, ChevronDown, Calendar } from 'lucide-react-native';
import { cartService } from '@/services/cart';
import { authService } from '@/services/auth';
import CartNotification from '@/components/CartNotification';

const { width } = Dimensions.get('window');

const getDeliveryDateRange = () => {
  const today = new Date();
  const minDays = 10;
  const maxDays = 14;

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + minDays);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + maxDays);

  const monthNames = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

interface Attribute {
  Pid: string;
  Vid: string;
  PropertyName: string;
  Value: string;
  OriginalPropertyName: string;
  OriginalValue: string;
  IsConfigurator: boolean;
  ImageUrl?: string;
  MiniImageUrl?: string;
}

interface ConfiguredItem {
  Id: string;
  Quantity: number;
  Configurators: Array<{ Pid: string; Vid: string }>;
  Price: {
    ConvertedPriceList: {
      Internal: {
        Price: number;
      };
    };
  };
}

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
  attributes: Attribute[];
  configuredItems: ConfiguredItem[];
  configurators: Attribute[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ConfiguredItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentMainImage, setCurrentMainImage] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const pan = useRef(new Animated.ValueXY()).current;
  const touchStartX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: (evt) => {
        touchStartX.current = evt.nativeEvent.pageX;
        pan.setOffset({
          x: (pan.x as any)._value,
          y: 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const swipeThreshold = 50;

        if (gestureState.dx < -swipeThreshold && gestureState.vx < -0.3 && product && selectedImageIndex < product.images.length - 1) {
          setSelectedImageIndex(selectedImageIndex + 1);
          setCurrentMainImage('');
        } else if (gestureState.dx > swipeThreshold && gestureState.vx > 0.3 && selectedImageIndex > 0) {
          setSelectedImageIndex(selectedImageIndex - 1);
          setCurrentMainImage('');
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 7,
          tension: 50,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

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
        const attributes = item.Attributes || [];
        const configurators = attributes.filter((attr: Attribute) => attr.IsConfigurator);
        const regularAttributes = attributes.filter((attr: Attribute) => !attr.IsConfigurator);
        const configuredItems = item.ConfiguredItems || [];

        const productData = {
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
          attributes: regularAttributes,
          configuredItems: configuredItems,
          configurators: configurators,
        };

        setProduct(productData);
        setCurrentMainImage(item.MainPictureUrl);

        if (configuredItems.length > 0) {
          setSelectedVariation(configuredItems[0]);
          const initialOptions: Record<string, string> = {};
          configuredItems[0].Configurators.forEach((conf) => {
            initialOptions[conf.Pid] = conf.Vid;
          });
          setSelectedOptions(initialOptions);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {

      if (!product) return;

      setIsAddingToCart(true);

      const variations: Record<string, string> = {};
      if (product.configurators.length > 0 && Object.keys(selectedOptions).length > 0) {
        product.configurators.forEach((config) => {
          const selectedVid = selectedOptions[config.Pid];
          if (selectedVid) {
            const selectedConfig = product.configurators.find(
              (c) => c.Pid === config.Pid && c.Vid === selectedVid
            );
            if (selectedConfig) {
              variations[selectedConfig.OriginalPropertyName] = selectedConfig.OriginalValue;
            }
          }
        });
      }

      const price = selectedVariation?.Price?.ConvertedPriceList?.Internal?.Price || product.price;

      console.log('Adding to cart:', {
        productId: product.id,
        name: product.title,
        price: price,
        imageUrl: currentMainImage || product.mainImage,
        variations: variations,
        quantity: quantity,
      });

      const result = await cartService.addToCart({
        productId: product.id,
        name: product.title,
        price: price,
        imageUrl: currentMainImage || product.mainImage,
        variations: variations,
        quantity: quantity,
      });

      console.log('Add to cart result:', result);

      setNotificationMessage('პროდუქტი დაემატა კალათაში');
      setShowNotification(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      console.error('Error details:', error.message);
      Alert.alert('შეცდომა', error.message || 'პროდუქტის კალათაში დამატება ვერ მოხერხდა');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>პროდუქტი ვერ მოიძებნა</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CartNotification
        visible={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
        onViewCart={() => router.push('/cart')}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 size={22} color="#1a1a1a" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={22}
              color={isFavorite ? '#ef4444' : '#1a1a1a'}
              strokeWidth={2}
              fill={isFavorite ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Animated.View
            style={[
              styles.mainImageContainer,
              {
                transform: [{ translateX: pan.x }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: currentMainImage || product.images[selectedImageIndex] || product.mainImage }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          </Animated.View>

          {product.images.length > 1 && (
            <>
              <View style={styles.paginationDots}>
                {product.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      selectedImageIndex === index && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailScroll}
                contentContainerStyle={styles.thumbnailContent}
              >
                {product.images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setCurrentMainImage('');
                    }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailSelected,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        <View style={styles.contentSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Package size={14} color="#6e39ea" strokeWidth={2} />
              <Text style={styles.brandText}>{product.brandName}</Text>
            </View>
            {product.inStock && (
              <View style={styles.stockBadge}>
                <View style={styles.stockDot} />
                <Text style={styles.stockText}>მარაგშია</Text>
              </View>
            )}
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>ფასი</Text>
              <Text style={styles.priceValue}>
                ₾{(selectedVariation?.Price?.ConvertedPriceList?.Internal?.Price || product.price).toFixed(2)}
              </Text>
            </View>
          </View>

          {product.configurators.length > 0 && (
            <View style={styles.configuratorsSection}>
              {(() => {
                const groupedByPid: Record<string, Attribute[]> = {};
                product.configurators.forEach((config) => {
                  if (!groupedByPid[config.Pid]) {
                    groupedByPid[config.Pid] = [];
                  }
                  groupedByPid[config.Pid].push(config);
                });

                return Object.entries(groupedByPid).map(([pid, configs]) => {
                  const propertyName = configs[0].OriginalPropertyName;
                  const uniqueConfigs = configs.filter(
                    (config, index, self) =>
                      index === self.findIndex((c) => c.Vid === config.Vid)
                  );

                  const currentValue = selectedOptions[pid];

                  return (
                    <View key={pid} style={styles.configuratorGroup}>
                      <Text style={styles.configuratorLabel}>{propertyName}</Text>
                      <View style={styles.configuratorOptions}>
                        {uniqueConfigs.map((config, vIndex) => {
                          const isSelected = config.Vid === currentValue;
                          const hasThumbnail = !!config.MiniImageUrl;

                          return (
                            <TouchableOpacity
                              key={vIndex}
                              style={[
                                styles.configuratorOption,
                                isSelected && styles.configuratorOptionSelected,
                                hasThumbnail && styles.configuratorOptionWithImage,
                              ]}
                              onPress={() => {
                                const newOptions = { ...selectedOptions, [pid]: config.Vid };
                                setSelectedOptions(newOptions);

                                const matchingItem = product.configuredItems.find((configItem) => {
                                  return Object.entries(newOptions).every(([key, val]) => {
                                    return configItem.Configurators.some(
                                      (c) => c.Pid === key && c.Vid === val
                                    );
                                  });
                                });

                                if (matchingItem) {
                                  setSelectedVariation(matchingItem);
                                }

                                if (config.ImageUrl) {
                                  setCurrentMainImage(config.ImageUrl);
                                }
                              }}
                            >
                              {hasThumbnail ? (
                                <View style={styles.imageOptionContent}>
                                  <Image
                                    source={{ uri: config.MiniImageUrl }}
                                    style={styles.variationThumbnail}
                                    resizeMode="cover"
                                  />
                                  <Text
                                    style={[
                                      styles.configuratorOptionText,
                                      isSelected && styles.configuratorOptionTextSelected,
                                    ]}
                                  >
                                    {config.OriginalValue}
                                  </Text>
                                </View>
                              ) : (
                                <Text
                                  style={[
                                    styles.configuratorOptionText,
                                    isSelected && styles.configuratorOptionTextSelected,
                                  ]}
                                >
                                  {config.OriginalValue}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                });
              })()}
            </View>
          )}

          <View style={styles.deliveryPromoBanner}>
            <LinearGradient
              colors={['#f5f3ff', '#ede9fe', '#ddd6fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoGradient}
            >
              <View style={styles.promoIconContainer}>
                <View style={styles.promoIconCircle}>
                  <Truck size={28} color="#6e39ea" strokeWidth={2.5} />
                </View>
              </View>

              <View style={styles.promoContent}>
                <Text style={styles.promoTitle}>სპეციალური შეთავაზება</Text>
                <Text style={styles.promoSubtitle}>სწრაფი და უსაფრთხო მიწოდება</Text>

                <View style={styles.promoDetailsContainer}>
                  <View style={styles.promoDetailItem}>
                    <View style={styles.promoDetailIcon}>
                      <Calendar size={18} color="#6e39ea" strokeWidth={2} />
                    </View>
                    <View style={styles.promoDetailText}>
                      <Text style={styles.promoDetailLabel}>მიწოდების ვადა</Text>
                      <Text style={styles.promoDetailValue}>10-14 სამუშაო დღე</Text>
                    </View>
                  </View>

                  <View style={styles.promoDivider} />

                  <View style={styles.promoDetailItem}>
                    <View style={styles.promoDetailIcon}>
                      <Shield size={18} color="#6e39ea" strokeWidth={2} />
                    </View>
                    <View style={styles.promoDetailText}>
                      <Text style={styles.promoDetailLabel}>დაზღვეული მიწოდება</Text>
                      <Text style={styles.promoDetailValue}>100% გარანტია</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.deliveryDateCard}>
                  <Text style={styles.deliveryDateLabel}>მოსალოდნელი თარიღი:</Text>
                  <Text style={styles.deliveryDateValue}>{getDeliveryDateRange()}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.collapsibleHeaderContent}>
                <Info size={20} color="#1a1a1a" strokeWidth={2} />
                <Text style={styles.sectionTitle}>აღწერა</Text>
              </View>
              {isDescriptionExpanded ? (
                <ChevronDown size={20} color="#666" strokeWidth={2} />
              ) : (
                <ChevronRight size={20} color="#666" strokeWidth={2} />
              )}
            </TouchableOpacity>
            {isDescriptionExpanded && (
              <Text style={styles.descriptionText}>
                {product.description || 'აღწერა არ არის ხელმისაწვდომი'}
              </Text>
            )}
          </View>

          {product.attributes.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setIsAttributesExpanded(!isAttributesExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.collapsibleHeaderContent}>
                  <Package size={20} color="#1a1a1a" strokeWidth={2} />
                  <Text style={styles.sectionTitle}>მახასიათებლები</Text>
                </View>
                {isAttributesExpanded ? (
                  <ChevronDown size={20} color="#666" strokeWidth={2} />
                ) : (
                  <ChevronRight size={20} color="#666" strokeWidth={2} />
                )}
              </TouchableOpacity>
              {isAttributesExpanded && (
                <View style={styles.attributesContainer}>
                  {product.attributes.map((attr, index) => (
                    <View key={index} style={styles.attributeRow}>
                      <Text style={styles.attributeLabel}>{attr.PropertyName}</Text>
                      <View style={styles.attributeDivider} />
                      <Text style={styles.attributeValue}>{attr.Value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {product.vendorName && (
            <TouchableOpacity style={styles.vendorCard}>
              <View style={styles.vendorInfo}>
                <Package size={18} color="#6e39ea" strokeWidth={2} />
                <View style={styles.vendorTextContainer}>
                  <Text style={styles.vendorLabel}>გამყიდველი</Text>
                  <Text style={styles.vendorValue}>{product.vendorName}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#ccc" strokeWidth={2} />
            </TouchableOpacity>
          )}

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>რაოდენობა</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonPlus]}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonTextPlus}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>სულ</Text>
            <Text style={styles.totalPrice}>₾{(product.price * quantity).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, (!product.inStock || isAddingToCart) && styles.addToCartButtonDisabled]}
            disabled={!product.inStock || isAddingToCart}
            onPress={handleAddToCart}
          >
            <LinearGradient
              colors={product.inStock ? ['#6e39ea', '#8b5cf6'] : ['#999', '#777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addToCartGradient}
            >
              <ShoppingCart size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.addToCartText}>
                {isAddingToCart ? 'დამატება...' : product.inStock ? 'კალათაში დამატება' : 'არ არის მარაგში'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#f0f0f0',
    borderTopColor: '#6e39ea',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  mainImageContainer: {
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    transition: 'all 0.3s',
  },
  dotActive: {
    backgroundColor: '#6e39ea',
    width: 28,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnailScroll: {
    marginTop: 12,
  },
  thumbnailContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnailSelected: {
    borderColor: '#6e39ea',
    backgroundColor: '#fff',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e39ea',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  productTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  priceRow: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -1.5,
  },
  configuratorsSection: {
    marginBottom: 20,
    gap: 16,
  },
  configuratorGroup: {
    gap: 10,
  },
  configuratorLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  configuratorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  configuratorOption: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  configuratorOptionWithImage: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  configuratorOptionSelected: {
    backgroundColor: '#f5f3ff',
    borderColor: '#6e39ea',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  configuratorOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  configuratorOptionTextSelected: {
    color: '#6e39ea',
  },
  imageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  variationThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  deliveryPromoBanner: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  promoGradient: {
    padding: 20,
    borderRadius: 20,
  },
  promoIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  promoIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4c1d95',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  promoSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6d28d9',
    marginBottom: 18,
    textAlign: 'center',
  },
  promoDetailsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  promoDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoDetailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoDetailText: {
    flex: 1,
  },
  promoDetailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4c1d95',
  },
  promoDivider: {
    width: 1,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  deliveryDateCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(110, 57, 234, 0.2)',
  },
  deliveryDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  deliveryDateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6e39ea',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 14,
    marginBottom: 0,
  },
  collapsibleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#4b5563',
    fontWeight: '400',
    padding: 16,
    paddingTop: 12,
  },
  attributesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  attributeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  attributeDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 12,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'right',
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vendorTextContainer: {
    flex: 1,
  },
  vendorLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginBottom: 2,
  },
  vendorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  quantitySection: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonPlus: {
    backgroundColor: '#6e39ea',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
  },
  quantityButtonTextPlus: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  quantityDisplay: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  addToCartButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  addToCartButtonDisabled: {
    shadowColor: '#999',
    shadowOpacity: 0.1,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  addToCartText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
});
