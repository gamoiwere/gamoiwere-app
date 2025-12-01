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
          bottom: 20,
          left: '10%',
          right: '10%',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          borderRadius: 35,
          shadowColor: '#8b5cf6',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 15,
        },
        tabBarBackground: () => (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 35,
            overflow: 'hidden',
          }}>
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFillObject}
            />
            <View style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: 35,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  iconContainerActiveCenter: {
    backgroundColor: '#8b5cf6',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
});
