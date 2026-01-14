import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, ShoppingCart, Heart, User, LayoutGrid } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7816d6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 75,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
        },
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
                color={focused ? '#7816d6' : '#9ca3af'}
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
                color={focused ? '#7816d6' : '#9ca3af'}
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
              styles.iconContainerActiveCenter
            ]}>
              <ShoppingCart
                size={28}
                color="#fff"
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
                color={focused ? '#7816d6' : '#9ca3af'}
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
                color={focused ? '#7816d6' : '#9ca3af'}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
  },
  iconContainerActiveCenter: {
    backgroundColor: '#7816d6',
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -8,
    shadowColor: '#7816d6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
