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
    backgroundColor: '#111317',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(120, 22, 214, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
