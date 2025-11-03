import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>შეარჩიე შენთვის</Text>
              <Text style={styles.headerTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.headerIconBadge}>
              <LayoutGrid size={28} color="#fff" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.length > 0 && (
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#ffffff', '#fafafa']}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{categories.length}</Text>
                <Text style={styles.statLabel}>მთავარი კატეგორიები</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getTotalCategories()}</Text>
                <Text style={styles.statLabel}>სულ კატეგორიები</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {categories.length === 0 && (
          <View style={styles.emptyContainer}>
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
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#faf5ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainCategoryGradient}
                >
                  <View style={styles.mainCategoryLeft}>
                    <View style={[styles.categoryIconBadge, {
                      backgroundColor: '#7c3aed'
                    }]}>
                      {(() => {
                        const IconComponent = getCategoryIcon(category.Name);
                        return <IconComponent size={24} color="#fff" strokeWidth={2.5} />;
                      })()}
                    </View>
                    <View style={styles.mainCategoryInfo}>
                      <Text style={styles.mainCategoryName}>{category.Name}</Text>
                      <Text style={styles.mainCategoryCount}>
                        {category.Children?.length || 0} ქვეკატეგორია
                      </Text>
                    </View>
                  </View>
                  <View style={styles.expandIcon}>
                    {expandedCategories.has(category.Id) ? (
                      <ChevronDown size={24} color="#1a1a1a" strokeWidth={2.5} />
                    ) : (
                      <ChevronRight size={24} color="#1a1a1a" strokeWidth={2.5} />
                    )}
                  </View>
                </LinearGradient>
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
                        activeOpacity={0.8}
                      >
                        <View style={styles.subCategoryContent}>
                          <View style={styles.subCategoryLeft}>
                            <View style={styles.subCategoryDot} />
                            <View style={styles.subCategoryInfo}>
                              <Text style={styles.subCategoryName}>{subCategory.Name}</Text>
                              {subCategory.Children && subCategory.Children.length > 0 && (
                                <Text style={styles.subCategoryCount}>
                                  {subCategory.Children.length} ელემენტი
                                </Text>
                              )}
                            </View>
                          </View>
                          {subCategory.Children && subCategory.Children.length > 0 && (
                            <View style={styles.subExpandIcon}>
                              {expandedSubCategories.has(subCategory.Id) ? (
                                <ChevronDown size={20} color="#666" strokeWidth={2.5} />
                              ) : (
                                <ChevronRight size={20} color="#666" strokeWidth={2.5} />
                              )}
                            </View>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1.5,
  },
  headerIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  categoriesContainer: {
    gap: 16,
  },
  mainCategoryWrapper: {
    marginBottom: 8,
  },
  mainCategoryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mainCategoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  mainCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  categoryIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mainCategoryInfo: {
    flex: 1,
  },
  mainCategoryName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  mainCategoryCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  expandIcon: {
    marginLeft: 12,
  },
  subCategoriesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
    marginLeft: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  subCategoryWrapper: {
    marginBottom: 4,
  },
  subCategoryCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  subCategoryInfo: {
    flex: 1,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  subCategoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  subExpandIcon: {
    marginLeft: 8,
  },
  subSubCategoriesContainer: {
    marginLeft: 22,
    marginTop: 8,
    gap: 4,
  },
  subSubCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subSubCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  subSubCategoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
  },
  subSubCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
});
