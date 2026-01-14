import { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const hasNavigated = useRef(false);
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    const dotAnimation = (dotValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = dotAnimation(dot1, 0);
    const anim2 = dotAnimation(dot2, 150);
    const anim3 = dotAnimation(dot3, 300);
    anim1.start();
    anim2.start();
    anim3.start();

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
        }, 2500);
      } catch (error) {
        setTimeout(() => {
          if (hasNavigated.current) return;
          hasNavigated.current = true;
          router.replace('/onboarding');
        }, 2500);
      }
    };

    navigate();

    return () => {
      pulseAnimation.stop();
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseValue }] }]}>
          <LinearGradient
            colors={['#7816d6', '#9333ea', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <ShoppingBag size={48} color="#fff" strokeWidth={2} />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.brandName}>GAMOIWERE</Text>
        <Text style={styles.tagline}>შოპინგი მთელი მსოფლიოდან</Text>
      </Animated.View>
      
      <View style={styles.loadingSection}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
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
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(120, 22, 214, 0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  logoSection: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7816d6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
  },
  loadingSection: {
    position: 'absolute',
    bottom: 80,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7816d6',
  },
});
