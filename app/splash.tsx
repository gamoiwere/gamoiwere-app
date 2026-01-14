import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const hasNavigated = useRef(false);

  useEffect(() => {
    const navigate = async () => {
      if (hasNavigated.current) return;
      
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        setTimeout(() => {
          if (hasNavigated.current) return;
          hasNavigated.current = true;
          
          if (hasSeenOnboarding === 'true') {
            router.replace('/auth/login');
          } else {
            router.replace('/onboarding');
          }
        }, 2000);
      } catch (error) {
        setTimeout(() => {
          if (hasNavigated.current) return;
          hasNavigated.current = true;
          router.replace('/onboarding');
        }, 2000);
      }
    };

    navigate();
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(120, 22, 214, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7816d6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
