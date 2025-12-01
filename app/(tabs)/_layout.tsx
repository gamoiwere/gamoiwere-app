import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, ShoppingCart, Heart, User, LayoutGrid } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 0,
          paddingTop: 0,
          paddingHorizontal: 20,
          marginHorizontal: 16,
          marginBottom: 24,
          left: 0,
          right: 0,
          borderRadius: 40,
          shadowColor: '#8b5cf6',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarBackground: () => (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 40,
            overflow: 'hidden',
          }}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={95}
                tint="light"
                style={StyleSheet.absoluteFillObject}
              />
            ) : null}
            <View style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.92)',
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 40,
            }} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Home
                size={22}
                color={focused ? '#fff' : '#9ca3af'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <LayoutGrid
                size={22}
                color={focused ? '#fff' : '#9ca3af'}
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
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActiveCenter
            ]}>
              <ShoppingCart
                size={28}
                color={focused ? '#fff' : '#8b5cf6'}
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
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Heart
                size={22}
                color={focused ? '#fff' : '#9ca3af'}
                strokeWidth={2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <User
                size={22}
                color={focused ? '#fff' : '#9ca3af'}
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
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainerActiveCenter: {
    backgroundColor: '#8b5cf6',
    width: 66,
    height: 66,
    borderRadius: 33,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
});
