import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { authService } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  useFrameworkReady();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authService.getToken();
      const onboardingSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      setIsAuthenticated(!!token);
      setHasSeenOnboarding(onboardingSeen === 'true');
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated === null || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inSplash = segments[0] === 'splash';

    if (!hasSeenOnboarding && !inSplash && !inOnboarding) {
      router.replace('/splash');
    } else if (!isAuthenticated && !inAuthGroup && hasSeenOnboarding) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hasSeenOnboarding, segments]);

  if (isAuthenticated === null || hasSeenOnboarding === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/addresses" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
