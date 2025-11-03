import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(249, 249, 249, 0.95)',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'მთავარი',
          tabBarIcon: ({ focused }) => (
            <Home
              size={26}
              color={focused ? '#7c3aed' : '#8E8E93'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'კატეგორიები',
          tabBarIcon: ({ focused }) => (
            <LayoutGrid
              size={26}
              color={focused ? '#7c3aed' : '#8E8E93'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'შეკვეთები',
          tabBarIcon: ({ focused }) => (
            <ShoppingBag
              size={26}
              color={focused ? '#7c3aed' : '#8E8E93'}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'პროფილი',
          tabBarIcon: ({ focused }) => (
            <User
              size={26}
              color={focused ? '#7c3aed' : '#8E8E93'}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

