import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Smartphone, Laptop, Headphones, Watch, Camera, ShoppingBag, Sparkles, TrendingUp, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const categories = [
  {
    id: '1',
    name_ka: 'სმარტფონები',
    name_en: 'Smartphones',
    icon: Smartphone,
    color: ['#3b82f6', '#2563eb'],
    bgColor: '#dbeafe',
    count: 342,
    trending: true,
  },
  {
    id: '2',
    name_ka: 'ლეპტოპები',
    name_en: 'Laptops',
    icon: Laptop,
    color: ['#8b5cf6', '#7c3aed'],
    bgColor: '#ede9fe',
    count: 156,
    trending: false,
  },
  {
    id: '3',
    name_ka: 'ყურსასმენები',
    name_en: 'Headphones',
    icon: Headphones,
    color: ['#ec4899', '#db2777'],
    bgColor: '#fce7f3',
    count: 428,
    trending: true,
  },
  {
    id: '4',
    name_ka: 'სმარტ საათები',
    name_en: 'Smart Watches',
    icon: Watch,
    color: ['#10b981', '#059669'],
    bgColor: '#d1fae5',
    count: 289,
    trending: false,
  },
  {
    id: '5',
    name_ka: 'კამერები',
    name_en: 'Cameras',
    icon: Camera,
    color: ['#f59e0b', '#d97706'],
    bgColor: '#fef3c7',
    count: 124,
    trending: false,
  },
  {
    id: '6',
    name_ka: 'აქსესუარები',
    name_en: 'Accessories',
    icon: ShoppingBag,
    color: ['#6366f1', '#4f46e5'],
    bgColor: '#e0e7ff',
    count: 867,
    trending: true,
  },
];

export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>იპოვე შენი</Text>
              <Text style={styles.headerTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.headerBadge}>
              <Sparkles size={16} color="#fbbf24" strokeWidth={2.5} fill="#fbbf24" />
              <Text style={styles.headerBadgeText}>ახალი</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>2,206</Text>
            <Text style={styles.miniStatLabel}>სულ პროდუქტი</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>6</Text>
            <Text style={styles.miniStatLabel}>კატეგორიები</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>3</Text>
            <Text style={styles.miniStatLabel}>ტრენდული</Text>
          </View>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => {
            const Icon = category.icon;
            const delay = index * 80;

            return (
              <Animated.View
                key={category.id}
                style={[
                  styles.categoryCardWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#fff', '#fafafa']}
                    style={styles.categoryGradient}
                  >
                    {category.trending && (
                      <View style={styles.trendingBadge}>
                        <TrendingUp size={12} color="#22c55e" strokeWidth={2.5} />
                        <Text style={styles.trendingText}>ტრენდი</Text>
                      </View>
                    )}

                    <View style={[styles.iconContainer, { backgroundColor: category.bgColor }]}>
                      <Icon size={32} color={category.color[0]} strokeWidth={2.5} />
                    </View>

                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name_ka}</Text>
                      <Text style={styles.categoryNameEn}>{category.name_en}</Text>

                      <View style={styles.categoryFooter}>
                        <View style={styles.countBadge}>
                          <Text style={styles.countText}>{category.count}</Text>
                          <Text style={styles.countLabel}>პროდუქტი</Text>
                        </View>

                        <View style={styles.arrowButton}>
                          <LinearGradient
                            colors={category.color as [string, string]}
                            style={styles.arrowGradient}
                          >
                            <ChevronRight size={16} color="#fff" strokeWidth={3} />
                          </LinearGradient>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.promoSection}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <Sparkles size={32} color="#fff" strokeWidth={2.5} />
            <Text style={styles.promoTitle}>განსაკუთრებული შეთავაზება</Text>
            <Text style={styles.promoSubtitle}>
              მიიღეთ 20% ფასდაკლება ყველა კატეგორიაში პირველ შეკვეთაზე
            </Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>გაიგე მეტი</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCardWrapper: {
    width: (width - 56) / 2,
  },
  categoryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryGradient: {
    padding: 20,
    minHeight: 220,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  categoryNameEn: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginBottom: 16,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  countBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  countText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  arrowButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  arrowGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoSection: {
    marginTop: 24,
  },
  promoCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  promoSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  promoButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  promoButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  bottomSpacer: {
    height: 20,
  },
});
