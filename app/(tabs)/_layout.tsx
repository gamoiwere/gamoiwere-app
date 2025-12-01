import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, ShoppingCart, Heart, User, LayoutGrid } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: '#ffffff',
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
          borderTopWidth: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 70,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Home
                size={24}
                color={focused ? '#8b5cf6' : '#64748b'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <LayoutGrid
                size={24}
                color={focused ? '#8b5cf6' : '#64748b'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.cartIconContainer}>
              <ShoppingCart
                size={26}
                color="#ffffff"
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Heart
                size={24}
                color={focused ? '#8b5cf6' : '#64748b'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <User
                size={24}
                color={focused ? '#8b5cf6' : '#64748b'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#f3f0ff',
  },
  cartIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -10,
  },
});
