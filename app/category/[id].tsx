import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Filter, Grid, List, TrendingUp, Star, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Product {
  Id: string;
  Title: string;
  MainPictureUrl: string;
  BrandName: string;
  Price: {
    ConvertedPriceWithoutSign: string;
    CurrencySign: string;
  };
  VendorScore: number;
}

interface ApiResponse {
  Result: {
    Items: {
      Items: {
        Content: Product[];
      };
    };
  };
}

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (id) {
      fetchProducts();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://service.devmonkeys.ge/api/batchSearchItemsFrame?categoryId=${id}`
      );
      const data: ApiResponse = await response.json();

      if (data?.Result?.Items?.Items?.Content) {
        setProducts(data.Result.Items.Items.Content);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderGridItem = (product: Product) => (
    <TouchableOpacity
      key={product.Id}
      style={styles.gridCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.Id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.MainPictureUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.8}>
          <Heart size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <View style={styles.gridProductInfo}>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.BrandName}
        </Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.Title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {product.Price.ConvertedPriceWithoutSign}
            {product.Price.CurrencySign}
          </Text>
          {product.VendorScore > 0 && (
            <View style={styles.ratingBadge}>
              <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.ratingText}>{product.VendorScore.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = (product: Product) => (
    <TouchableOpacity
      key={product.Id}
      style={styles.listCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.Id}`)}
    >
      <Image
        source={{ uri: product.MainPictureUrl }}
        style={styles.listImage}
        resizeMode="cover"
      />
      <View style={styles.listProductInfo}>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.BrandName}
        </Text>
        <Text style={styles.listProductTitle} numberOfLines={2}>
          {product.Title}
        </Text>
        <View style={styles.listBottomRow}>
          <Text style={styles.price}>
            {product.Price.ConvertedPriceWithoutSign}
            {product.Price.CurrencySign}
          </Text>
          {product.VendorScore > 0 && (
            <View style={styles.ratingBadge}>
              <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.ratingText}>{product.VendorScore.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.listFavoriteButton} activeOpacity={0.8}>
        <Heart size={20} color="#7c3aed" strokeWidth={2.5} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {name || 'პროდუქტები'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              activeOpacity={0.8}
            >
              {viewMode === 'grid' ? (
                <List size={22} color="#fff" strokeWidth={2.5} />
              ) : (
                <Grid size={22} color="#fff" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <TrendingUp size={16} color="#fff" strokeWidth={2.5} />
            <Text style={styles.statText}>{products.length} პროდუქტი</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>პროდუქტები არ მოიძებნა</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.productsContainer,
            viewMode === 'list' && styles.listContainer
          ]}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === 'grid'
            ? products.map(renderGridItem)
            : products.map(renderListItem)}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  listContainer: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.2,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridProductInfo: {
    padding: 12,
  },
  brandName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  listProductInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  listProductTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 8,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
