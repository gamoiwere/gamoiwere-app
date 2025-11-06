import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  User,
  Users,
  Baby,
  Home,
  ShoppingBag,
  Sparkles,
  Shirt,
  Mountain,
  Laptop,
  Scissors,
  Heart,
  Briefcase,
  BookOpen,
  Gift,
  Wrench,
  Car,
  Hammer,
  Gem,
  Palette,
  Download
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

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
    }
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>იტვირთება...</Text>
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
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>შეარჩიე შენთვის</Text>
            <Text style={styles.headerTitle}>კატეგორიები</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{categories.length}</Text>
              <Text style={styles.statText}>მთავარი</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{getTotalCategories()}</Text>
              <Text style={styles.statText}>სულ</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.length === 0 && (
          <View style={styles.emptyContainer}>
            <LayoutGrid size={64} color="#e0e0e0" strokeWidth={1.5} />
            <Text style={styles.emptyText}>კატეგორიები არ მოიძებნა</Text>
          </View>
        )}

        <View style={styles.categoriesContainer}>
          {Array.isArray(categories) && categories.map((category, index) => (
            <View key={category.Id} style={styles.mainCategoryWrapper}>
              <TouchableOpacity
                style={styles.mainCategoryCard}
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
                <View style={styles.mainCategoryContent}>
                  <View style={styles.mainCategoryLeft}>
                    <LinearGradient
                      colors={['#7c3aed', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryIconBadge}
                    >
                      {(() => {
                        const IconComponent = getCategoryIcon(category.Name);
                        return <IconComponent size={26} color="#fff" strokeWidth={2.5} />;
                      })()}
                    </LinearGradient>
                    <View style={styles.mainCategoryInfo}>
                      <Text style={styles.mainCategoryName}>{category.Name}</Text>
                      <Text style={styles.mainCategoryCount}>
                        {category.Children?.length || 0} ქვეკატეგორია
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expandIconContainer}>
                    {expandedCategories.has(category.Id) ? (
                      <ChevronDown size={22} color="#7c3aed" strokeWidth={3} />
                    ) : (
                      <ChevronRight size={22} color="#7c3aed" strokeWidth={3} />
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
                        <View style={styles.subCategoryContent}>
                          <View style={styles.subCategoryLeft}>
                            <View style={styles.subCategoryDot} />
                            <Text style={styles.subCategoryName}>{subCategory.Name}</Text>
                          </View>
                          <View style={styles.subCategoryRight}>
                            {subCategory.Children && subCategory.Children.length > 0 && (
                              <View style={styles.subCountBadge}>
                                <Text style={styles.subCountText}>{subCategory.Children.length}</Text>
                              </View>
                            )}
                            {subCategory.Children && subCategory.Children.length > 0 && (
                              <View style={styles.subExpandIcon}>
                                {expandedSubCategories.has(subCategory.Id) ? (
                                  <ChevronDown size={18} color="#7c3aed" strokeWidth={2.5} />
                                ) : (
                                  <ChevronRight size={18} color="#7c3aed" strokeWidth={2.5} />
                                )}
                              </View>
                            )}
                          </View>
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
                              <View style={styles.subSubCategoryContent}>
                                <View style={styles.subSubCategoryDot} />
                                <Text style={styles.subSubCategoryName}>{subSubCategory.Name}</Text>
                              </View>
                              <ChevronRight size={16} color="#999" strokeWidth={2} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'MarkGEO-Regular',
  },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    gap: 20,
  },
  titleContainer: {
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    fontFamily: 'MarkGEO-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  statDividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  mainCategoryWrapper: {
    marginBottom: 4,
  },
  mainCategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  mainCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  mainCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  categoryIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCategoryInfo: {
    flex: 1,
  },
  mainCategoryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 3,
    letterSpacing: -0.3,
    fontFamily: 'MarkGEO-Regular',
  },
  mainCategoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.2,
    fontFamily: 'MarkGEO-Regular',
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCategoriesContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    marginTop: 8,
    marginHorizontal: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subCategoryWrapper: {
    marginBottom: 6,
  },
  subCategoryCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  subCategoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.2,
    flex: 1,
    fontFamily: 'MarkGEO-Regular',
  },
  subCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subCountBadge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  subCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7c3aed',
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
    marginLeft: 20,
    marginTop: 8,
    gap: 6,
  },
  subSubCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subSubCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subSubCategoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#a78bfa',
  },
  subSubCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    flex: 1,
    letterSpacing: -0.1,
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpacer: {
    height: 100,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bbb',
    letterSpacing: 0.2,
    fontFamily: 'MarkGEO-Regular',
  },
});
