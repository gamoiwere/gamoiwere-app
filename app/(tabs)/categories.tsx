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
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>კატეგორიები</Text>
              </View>
              <View style={styles.statsCompact}>
                <View style={styles.statBoxCompact}>
                  <Text style={styles.statNumberCompact}>0</Text>
                  <Text style={styles.statTextCompact}>სულ</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
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
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.statsCompact}>
              <View style={styles.statBoxCompact}>
                <Text style={styles.statNumberCompact}>{getTotalCategories()}</Text>
                <Text style={styles.statTextCompact}>სულ</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6e39ea" />
        }
      >
        <View style={styles.content}>
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <LayoutGrid size={64} color="#d1d5db" strokeWidth={1.5} />
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
                    <LinearGradient
                      colors={['#6e39ea', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryIconBg}
                    >
                      {(() => {
                        const IconComponent = getCategoryIcon(category.Name);
                        return <IconComponent size={24} color="#fff" strokeWidth={2.5} />;
                      })()}
                    </LinearGradient>
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
                        <ChevronDown size={20} color="#7c3aed" strokeWidth={2.5} />
                      ) : (
                        <ChevronRight size={20} color="#7c3aed" strokeWidth={2.5} />
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
                                    <ChevronDown size={16} color="#7c3aed" strokeWidth={2.5} />
                                  ) : (
                                    <ChevronRight size={16} color="#7c3aed" strokeWidth={2.5} />
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
                                <ChevronRight size={14} color="#9ca3af" strokeWidth={2.5} />
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
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  statsCompact: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBoxCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  statTextCompact: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bbb',
    fontFamily: 'MarkGEO-Regular',
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'MarkGEO-Regular',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7c3aed',
    letterSpacing: -0.2,
    fontFamily: 'MarkGEO-Regular',
  },
  expandIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCategoriesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
    backgroundColor: '#f9fafb',
    borderRadius: 12,
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
    backgroundColor: '#7c3aed',
  },
  subCategoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: -0.2,
    fontFamily: 'MarkGEO-Regular',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
});
