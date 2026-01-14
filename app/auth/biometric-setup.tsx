import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Scan, Fingerprint, ShieldCheck, ChevronRight, CheckCircle } from 'lucide-react-native';
import { biometricService } from '@/services/biometric';
import Loader from '@/components/Loader';

const { width, height } = Dimensions.get('window');

export default function BiometricSetupScreen() {
  const params = useLocalSearchParams();
  const username = params.username as string || '';
  
  const [biometricType, setBiometricType] = useState('Face ID');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricType();
  }, []);

  const checkBiometricType = async () => {
    const type = await biometricService.getBiometricType();
    setBiometricType(type);
  };

  const showSuccessAnimation = () => {
    setSuccess(true);
    setLoading(false);
    
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
  };

  const handleEnableBiometric = async () => {
    setLoading(true);
    setError('');
    
    try {
      const authResult = await biometricService.authenticate(`გამოიყენეთ ${biometricType} გასააქტიურებლად`);
      
      if (authResult.success) {
        await biometricService.enableBiometric(username);
        showSuccessAnimation();
      } else {
        setLoading(false);
        if (authResult.error && authResult.error !== 'ავტორიზაცია გაუქმებულია') {
          setError(authResult.error);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError('შეცდომა მოხდა. სცადეთ თავიდან.');
      console.log('Error enabling biometric:', err);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const isFaceID = biometricType.includes('Face');

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        
        <View style={styles.successContent}>
          <Animated.View 
            style={[
              styles.successIconContainer,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              }
            ]}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIconGradient}
            >
              <CheckCircle size={64} color="#fff" strokeWidth={2} />
            </LinearGradient>
          </Animated.View>
          
          <Animated.Text style={[styles.successTitle, { opacity: successOpacity }]}>
            წარმატებით გააქტიურდა!
          </Animated.Text>
          <Animated.Text style={[styles.successSubtitle, { opacity: successOpacity }]}>
            {biometricType} ჩართულია. ახლა შეგიძლიათ სწრაფად შეხვიდეთ თქვენს ანგარიშზე.
          </Animated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      
      <View style={styles.content}>
        <View style={styles.iconSection}>
          <LinearGradient
            colors={['#7816d6', '#9333ea', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            {isFaceID ? (
              <Scan size={56} color="#fff" strokeWidth={1.5} />
            ) : (
              <Fingerprint size={56} color="#fff" strokeWidth={1.5} />
            )}
          </LinearGradient>
        </View>

        <Text style={styles.title}>{biometricType}-ის გააქტიურება</Text>
        <Text style={styles.subtitle}>
          გამოიყენეთ {biometricType} სწრაფი და უსაფრთხო შესვლისთვის. 
          შემდეგ ჯერზე მარტივად შეხვალთ თქვენს ანგარიშზე.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <ShieldCheck size={20} color="#7816d6" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>უსაფრთხო და დაშიფრული</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <ChevronRight size={20} color="#7816d6" strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>სწრაფი წვდომა ანგარიშზე</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleEnableBiometric}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={loading ? ['#9ca3af', '#9ca3af'] : ['#7816d6', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enableButtonGradient}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                {isFaceID ? (
                  <Scan size={22} color="#fff" strokeWidth={2} />
                ) : (
                  <Fingerprint size={22} color="#fff" strokeWidth={2} />
                )}
                <Text style={styles.enableButtonText}>გააქტიურება</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>არა, მოგვიანებით</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  decorCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(120, 22, 214, 0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconSection: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 130,
    height: 130,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7816d6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  enableButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  enableButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIconGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
