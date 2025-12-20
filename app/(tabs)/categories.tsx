import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, ChevronDown, LayoutGrid, User, Users, Baby, Hop as Home, ShoppingBag, Sparkles, Shirt, Mountain, Laptop, Scissors, Heart, Briefcase, BookOpen, Gift, Wrench, Car, Hammer, Gem, Palette, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Loader from '@/components/Loader';

interface Category {
  Id: string;
  Name: string;
  Children?: Category[];
  ProviderType: string;
  UpdatedTime: string;
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://service.devmonkeys.ge/api/getProviderBriefCatalog');
      const data = await response.json();

      if (data && data.Result && Array.isArray(data.Result.Roots)) {
        setCategories(data.Result.Roots);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubCategory = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId);
    } else {
      newExpanded.add(subCategoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  const countTotalProducts = (category: Category): number => {
    if (!category.Children || category.Children.length === 0) {
      return 1;
    }
    return category.Children.reduce((sum, child) => sum + countTotalProducts(child), 0);
  };

  const getTotalCategories = () => {
    if (!Array.isArray(categories)) return 0;
    return categories.reduce((sum, cat) => sum + countTotalProducts(cat), 0);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('ქალ') || name.includes('ქალის')) return User;
    if (name.includes('მამაკაც')) return Users;
    if (name.includes('ბავშვ') || name.includes('დედა')) return Baby;
    if (name.includes('საყოფაცხოვრებო') || name.includes('ავეჯი')) return Home;
    if (name.includes('ყოველდღიური')) return ShoppingBag;
    if (name.includes('სილამაზე') || name.includes('ჰიგიენა')) return Sparkles;
    if (name.includes('ფეხსაცმელი')) return Shirt;
    if (name.includes('სპორტ') || name.includes('გარე')) return Mountain;
    if (name.includes('ელექტრონიკა')) return Laptop;
    if (name.includes('ქსოვილი')) return Scissors;
    if (name.includes('ორსული')) return Heart;
    if (name.includes('სამსახური')) return Briefcase;
    if (name.includes('წიგნ')) return BookOpen;
    if (name.includes('ჰობი') || name.includes('არდადეგ')) return Gift;
    if (name.includes('მოწყობილობ')) return Wrench;
    if (name.includes('მანქან') || name.includes('მოტო')) return Car;
    if (name.includes('გაუმჯობესება') || name.includes('ბაღ')) return Hammer;
    if (name.includes('სამკაულ') || name.includes('აქსესუარ')) return Gem;
    if (name.includes('ნამუშევრ')) return Palette;
    if (name.includes('ციფრული')) return Download;
    return LayoutGrid;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0f0f1a', '#16213e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <View style={styles.iconBadge}>
                  <LayoutGrid size={20} color="#a78bfa" strokeWidth={2.5} />
                </View>
                <Text style={styles.headerTitle}>კატეგორიები</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f0f1a', '#16213e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <View style={styles.iconBadge}>
                <LayoutGrid size={20} color="#a78bfa" strokeWidth={2.5} />
              </View>
              <Text style={styles.headerTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.statsCompact}>
              <Text style={styles.statNumberCompact}>{getTotalCategories()}</Text>
              <Text style={styles.statTextCompact}>სულ</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
        }
      >
        <View style={styles.content}>
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <LayoutGrid size={64} color="rgba(255, 255, 255, 0.3)" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>კატეგორიები არ მოიძებნა</Text>
              <Text style={styles.emptySubtitle}>
                გთხოვთ სცადოთ მოგვიანებით
              </Text>
            </View>
          ) : (
            Array.isArray(categories) && categories.map((category, index) => (
              <View
                key={category.Id}
                style={[styles.categoryCard, { marginTop: index === 0 ? 0 : 12 }]}
              >
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => {
                    if (category.Children && category.Children.length > 0) {
                      toggleCategory(category.Id);
                    } else {
                      router.push({
                        pathname: '/category/[id]',
                        params: { id: category.Id, name: category.Name }
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={styles.categoryIconBg}>
                      {(() => {
                        const IconComponent = getCategoryIcon(category.Name);
                        return <IconComponent size={22} color="#a78bfa" strokeWidth={2.5} />;
                      })()}
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>კატეგორია</Text>
                      <Text style={styles.categoryName}>{category.Name}</Text>
                    </View>
                  </View>
                  <View style={styles.categoryHeaderRight}>
                    {category.Children && category.Children.length > 0 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{category.Children.length}</Text>
                      </View>
                    )}
                    <View style={styles.expandIconBg}>
                      {expandedCategories.has(category.Id) ? (
                        <ChevronDown size={20} color="#a78bfa" strokeWidth={2.5} />
                      ) : (
                        <ChevronRight size={20} color="#a78bfa" strokeWidth={2.5} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedCategories.has(category.Id) && category.Children && (
                  <View style={styles.subCategoriesContainer}>
                    {category.Children.map((subCategory, subIndex) => (
                      <View key={subCategory.Id} style={styles.subCategoryWrapper}>
                        <TouchableOpacity
                          style={styles.subCategoryCard}
                          onPress={() => {
                            if (subCategory.Children && subCategory.Children.length > 0) {
                              toggleSubCategory(subCategory.Id);
                            } else {
                              router.push({
                                pathname: '/category/[id]',
                                params: { id: subCategory.Id, name: subCategory.Name }
                              });
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.subCategoryLeft}>
                            <View style={styles.subCategoryDot} />
                            <Text style={styles.subCategoryName}>{subCategory.Name}</Text>
                          </View>
                          <View style={styles.subCategoryRight}>
                            {subCategory.Children && subCategory.Children.length > 0 && (
                              <>
                                <View style={styles.subCountBadge}>
                                  <Text style={styles.subCountText}>{subCategory.Children.length}</Text>
                                </View>
                                <View style={styles.subExpandIcon}>
                                  {expandedSubCategories.has(subCategory.Id) ? (
                                    <ChevronDown size={16} color="#a78bfa" strokeWidth={2.5} />
                                  ) : (
                                    <ChevronRight size={16} color="#a78bfa" strokeWidth={2.5} />
                                  )}
                                </View>
                              </>
                            )}
                          </View>
                        </TouchableOpacity>

                        {expandedSubCategories.has(subCategory.Id) && subCategory.Children && (
                          <View style={styles.subSubCategoriesContainer}>
                            {subCategory.Children.map((subSubCategory) => (
                              <TouchableOpacity
                                key={subSubCategory.Id}
                                style={styles.subSubCategoryCard}
                                activeOpacity={0.7}
                                onPress={() => router.push({
                                  pathname: '/category/[id]',
                                  params: { id: subSubCategory.Id, name: subSubCategory.Name }
                                })}
                              >
                                <View style={styles.subSubCategoryLeft}>
                                  <View style={styles.subSubCategoryDot} />
                                  <Text style={styles.subSubCategoryName}>{subSubCategory.Name}</Text>
                                </View>
                                <ChevronRight size={14} color="rgba(255, 255, 255, 0.4)" strokeWidth={2.5} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 200,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'MarkGEO-Regular',
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    fontFamily: 'MarkGEO-Regular',
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#a78bfa',
    letterSpacing: -0.2,
  },
  expandIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCategoriesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  subCategoryWrapper: {
    gap: 8,
  },
  subCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
  },
  subCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: -0.1,
    flex: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  subCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: -0.2,
  },
  subExpandIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subSubCategoriesContainer: {
    marginLeft: 18,
    gap: 6,
  },
  subSubCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  subSubCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subSubCategoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#a78bfa',
  },
  subSubCategoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
