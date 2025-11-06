import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        const timer = setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            router.replace('/auth/login');
          } else {
            router.replace('/onboarding');
          }
        }, 2000);

        return () => clearTimeout(timer);
      } catch (error) {
        setTimeout(() => {
          router.replace('/onboarding');
        }, 2000);
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
