import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, ShoppingCart, Heart, User, LayoutGrid } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 0,
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 10,
        },
        tabBarItemStyle: {
          height: 72,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.glassOverlay} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Home
                size={24}
                color={focused ? '#ffffff' : '#94a3b8'}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <LayoutGrid
                size={24}
                color={focused ? '#ffffff' : '#94a3b8'}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerIcon, focused && styles.centerIconActive]}>
              <ShoppingCart
                size={26}
                color="#ffffff"
                strokeWidth={2.5}
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
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Heart
                size={24}
                color={focused ? '#ffffff' : '#94a3b8'}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <User
                size={24}
                color={focused ? '#ffffff' : '#94a3b8'}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  centerIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  centerIconActive: {
    backgroundColor: '#7c3aed',
    transform: [{ scale: 1.05 }],
  },
});
