import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, ChevronDown, ChevronUp, Star, Check } from 'lucide-react-native';
import { cartService } from '@/services/cart';
import Loader from '@/components/Loader';
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

  const flatListRef = useRef<FlatList>(null);

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

      const result = await cartService.addToCart({
        productId: product.id,
        name: product.title,
        price: price,
        imageUrl: currentMainImage || product.mainImage,
        variations: variations,
        quantity: quantity,
      });

      setNotificationMessage('პროდუქტი დაემატა კალათაში');
      setShowNotification(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('შეცდომა', error.message || 'პროდუქტის კალათაში დამატება ვერ მოხერხდა');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setSelectedImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Package size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text style={styles.errorText}>პროდუქტი ვერ მოიძებნა</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CartNotification
        visible={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
        onViewCart={() => router.push('/(tabs)/cart')}
      />

      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={20}
              color={isFavorite ? '#fbbf24' : '#fff'}
              strokeWidth={2.5}
              fill={isFavorite ? '#fbbf24' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <FlatList
            ref={flatListRef}
            data={product.images.length > 0 ? product.images : [product.mainImage]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {product.images.length > 1 && (
            <View style={styles.paginationContainer}>
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
            </View>
          )}

          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {product.images.length || 1}
            </Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.topBadges}>
            <View style={styles.brandBadge}>
              <Package size={14} color="#7c3aed" strokeWidth={2.5} />
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
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>საუკეთესო ფასი</Text>
            </View>
          </View>

          {product.configurators.length > 0 && (
            <View style={styles.variationsSection}>
              <Text style={styles.variationsSectionTitle}>ვარიანტები</Text>
              {(() => {
                const groupedByPid: Record<string, Attribute[]> = {};
                product.configurators.forEach((config) => {
                  if (!groupedByPid[config.Pid]) {
                    groupedByPid[config.Pid] = [];
                  }
                  groupedByPid[config.Pid].push(config);
                });

                return Object.entries(groupedByPid).map(([pid, configs]) => {
                  const propertyName = configs[0].PropertyName;
                  const uniqueConfigs = configs.filter(
                    (config, index, self) =>
                      index === self.findIndex((c) => c.Vid === config.Vid)
                  );

                  const currentValue = selectedOptions[pid];
                  const selectedConfig = uniqueConfigs.find(c => c.Vid === currentValue);

                  return (
                    <View key={pid} style={styles.variationGroup}>
                      <View style={styles.variationHeader}>
                        <Text style={styles.variationLabel}>{propertyName}</Text>
                        {selectedConfig && (
                          <Text style={styles.variationSelected}>
                            {selectedConfig.Value}
                          </Text>
                        )}
                      </View>
                      <View style={styles.variationOptions}>
                        {uniqueConfigs.map((config, vIndex) => {
                          const isSelected = config.Vid === currentValue;
                          const hasThumbnail = !!config.MiniImageUrl;

                          return (
                            <TouchableOpacity
                              key={vIndex}
                              style={[
                                styles.variationOption,
                                isSelected && styles.variationOptionSelected,
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
                              activeOpacity={0.7}
                            >
                              {hasThumbnail && (
                                <Image
                                  source={{ uri: config.MiniImageUrl }}
                                  style={styles.variationThumbnail}
                                  resizeMode="cover"
                                />
                              )}
                              <Text
                                style={[
                                  styles.variationOptionText,
                                  isSelected && styles.variationOptionTextSelected,
                                ]}
                                numberOfLines={1}
                              >
                                {config.Value}
                              </Text>
                              {isSelected && (
                                <View style={styles.checkmark}>
                                  <Check size={14} color="#fff" strokeWidth={3} />
                                </View>
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

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryIconBg}>
                <Truck size={24} color="#7c3aed" strokeWidth={2.5} />
              </View>
              <View style={styles.deliveryHeaderText}>
                <Text style={styles.deliveryTitle}>მიწოდება</Text>
                <Text style={styles.deliverySubtitle}>ჩინეთიდან საქართველოში</Text>
              </View>
            </View>

            <View style={styles.deliveryDetails}>
              <View style={styles.deliveryDetailRow}>
                <Shield size={16} color="#10b981" strokeWidth={2.5} />
                <Text style={styles.deliveryDetailText}>100% უსაფრთხო და დაზღვეული</Text>
              </View>
              <View style={styles.deliveryDetailRow}>
                <Package size={16} color="#7c3aed" strokeWidth={2.5} />
                <Text style={styles.deliveryDetailText}>10-14 სამუშაო დღე</Text>
              </View>
            </View>

            <View style={styles.deliveryDateBadge}>
              <Text style={styles.deliveryDateLabel}>მოსალოდნელი:</Text>
              <Text style={styles.deliveryDateValue}>{getDeliveryDateRange()}</Text>
            </View>
          </View>

          <View style={styles.quantityCard}>
            <Text style={styles.quantityLabel}>რაოდენობა</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonActive]}
                onPress={() => setQuantity(quantity + 1)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#7c3aed', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quantityButtonGradient}
                >
                  <Text style={styles.quantityButtonTextActive}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.collapsibleCard}
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            activeOpacity={0.9}
          >
            <View style={styles.collapsibleHeader}>
              <Text style={styles.collapsibleTitle}>აღწერა</Text>
              {isDescriptionExpanded ? (
                <ChevronUp size={20} color="#7c3aed" strokeWidth={2.5} />
              ) : (
                <ChevronDown size={20} color="#6b7280" strokeWidth={2.5} />
              )}
            </View>
            {isDescriptionExpanded && (
              <View style={styles.collapsibleContent}>
                <Text style={styles.descriptionText}>
                  {product.description || 'აღწერა არ არის ხელმისაწვდომი'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {product.attributes.length > 0 && (
            <TouchableOpacity
              style={styles.collapsibleCard}
              onPress={() => setIsAttributesExpanded(!isAttributesExpanded)}
              activeOpacity={0.9}
            >
              <View style={styles.collapsibleHeader}>
                <Text style={styles.collapsibleTitle}>მახასიათებლები</Text>
                {isAttributesExpanded ? (
                  <ChevronUp size={20} color="#7c3aed" strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={20} color="#6b7280" strokeWidth={2.5} />
                )}
              </View>
              {isAttributesExpanded && (
                <View style={styles.collapsibleContent}>
                  {product.attributes.map((attr, index) => (
                    <View
                      key={index}
                      style={[
                        styles.attributeRow,
                        index === product.attributes.length - 1 && styles.attributeRowLast,
                      ]}
                    >
                      <Text style={styles.attributeLabel}>{attr.PropertyName}</Text>
                      <Text style={styles.attributeValue}>{attr.Value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,1)']}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>სულ</Text>
              <Text style={styles.totalPrice}>
                ₾{((selectedVariation?.Price?.ConvertedPriceList?.Internal?.Price || product.price) * quantity).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, (!product.inStock || isAddingToCart) && styles.addToCartButtonDisabled]}
              disabled={!product.inStock || isAddingToCart}
              onPress={handleAddToCart}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={product.inStock ? ['#7c3aed', '#8b5cf6'] : ['#9ca3af', '#6b7280']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addToCartGradient}
              >
                <ShoppingCart size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.addToCartText}>
                  {isAddingToCart ? 'დამატება...' : product.inStock ? 'კალათაში დამატება' : 'არ არის მარაგში'}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#fff',
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#7c3aed',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  contentSection: {
    padding: 20,
  },
  topBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'MarkGEO-Regular',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    fontFamily: 'MarkGEO-Regular',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  priceBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
    fontFamily: 'MarkGEO-Regular',
  },
  variationsSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  variationsSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  variationGroup: {
    marginBottom: 16,
  },
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  variationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  variationSelected: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  variationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 60,
    position: 'relative',
  },
  variationOptionSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#7c3aed',
  },
  variationThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  variationOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  variationOptionTextSelected: {
    color: '#7c3aed',
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  deliveryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryHeaderText: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'MarkGEO-Regular',
  },
  deliverySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  deliveryDetails: {
    gap: 10,
    marginBottom: 14,
  },
  deliveryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  deliveryDateBadge: {
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryDateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  deliveryDateValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7c3aed',
    fontFamily: 'MarkGEO-Regular',
  },
  quantityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  quantityButtonActive: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  quantityButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
  },
  quantityButtonTextActive: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  quantityDisplay: {
    flex: 1,
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  collapsibleCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  collapsibleContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'MarkGEO-Regular',
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  attributeRowLast: {
    borderBottomWidth: 0,
  },
  attributeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  attributeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  addToCartButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addToCartButtonDisabled: {
    shadowColor: '#9ca3af',
    shadowOpacity: 0.2,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
});
