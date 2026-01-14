import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { biometricService } from '@/services/biometric';
import { ArrowLeft, EyeOff, Eye, User, Lock, Scan, X, Check, Fingerprint } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import SuccessNotification from '@/components/SuccessNotification';
import Loader from '@/components/Loader';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [canQuickLogin, setCanQuickLogin] = useState(false);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState('');

  useEffect(() => {
    checkAppleAuth();
    checkBiometricAvailability();
  }, []);

  const checkAppleAuth = async () => {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    setAppleAuthAvailable(isAvailable);
  };

  const checkBiometricAvailability = async () => {
    try {
      const isSupported = await biometricService.isBiometricSupported();
      const isEnrolled = await biometricService.isBiometricEnrolled();
      const type = await biometricService.getBiometricType();
      
      setBiometricAvailable(isSupported && isEnrolled);
      setBiometricType(type);

      const canUse = await biometricService.canUseBiometric();
      const username = await biometricService.getStoredUsername();
      
      setCanQuickLogin(canUse);
      setStoredUsername(username);
      
      console.log('Biometric check:', { isSupported, isEnrolled, type, canUse, username });
    } catch (error) {
      console.log('Error checking biometric:', error);
    }
  };

  const handleBiometricQuickLogin = async () => {
    if (!storedUsername) {
      setError('ბიომეტრიული ავტორიზაცია მიუწვდომელია');
      return;
    }

    setLoading(true);
    setError('');

    const result = await biometricService.authenticate(`გამოიყენეთ ${biometricType} შესასვლელად`);
    
    if (result.success) {
      const sessionRestored = await biometricService.restoreAuthSession();
      
      if (sessionRestored) {
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1200);
      } else {
        setLoading(false);
        setError('სესია ვადაგასულია. გთხოვთ შეხვიდეთ პაროლით');
        setCanQuickLogin(false);
      }
    } else {
      setLoading(false);
      if (result.error && result.error !== 'ავტორიზაცია გაუქმებულია') {
        setError(result.error);
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(email.trim(), password);
      setPendingUsername(email.trim());
      
      if (biometricAvailable) {
        const isAlreadyEnabled = await biometricService.isBiometricEnabled();
        if (!isAlreadyEnabled) {
          setLoading(false);
          setShowBiometricModal(true);
          return;
        } else {
          await biometricService.updateStoredToken();
        }
      }
      
      setShowSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'შესვლა ვერ მოხერხდა');
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      const result = await biometricService.authenticate(`დაადასტურეთ ${biometricType} გამოყენება`);
      
      if (result.success) {
        await biometricService.enableBiometric(pendingUsername);
        setShowBiometricModal(false);
        setShowSuccess(true);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1200);
      } else {
        Alert.alert('შეცდომა', result.error || 'ვერ მოხერხდა ბიომეტრიის დაყენება');
      }
    } catch (error: any) {
      Alert.alert('შეცდომა', error.message || 'ვერ მოხერხდა ბიომეტრიის დაყენება');
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('Apple Sign In Success:', credential);
      
      if (biometricAvailable) {
        const isAlreadyEnabled = await biometricService.isBiometricEnabled();
        if (!isAlreadyEnabled) {
          setPendingUsername(credential.email || 'apple_user');
          setShowBiometricModal(true);
          return;
        }
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1200);
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign In');
      } else {
        setError('Apple-ით შესვლა ვერ მოხერხდა');
        console.error('Apple Sign In Error:', e);
      }
    }
  };

  const getBiometricIcon = () => {
    if (biometricType.includes('Face')) {
      return <Scan size={24} color="#a78bfa" strokeWidth={2} />;
    }
    return <Fingerprint size={24} color="#a78bfa" strokeWidth={2} />;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1a', '#1a1a2e', '#16213e']}
        style={styles.background}
      />
      
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />
      <View style={styles.glowOrb3} />

      <SuccessNotification
        visible={showSuccess}
        message="წარმატებით შეხვედით სისტემაში!"
        onHide={() => setShowSuccess(false)}
      />

      <Modal
        visible={showBiometricModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipBiometric}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleSkipBiometric}>
              <X size={20} color="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.modalIconContainer}>
              {biometricType.includes('Face') ? (
                <Scan size={56} color="#a78bfa" strokeWidth={1.5} />
              ) : (
                <Fingerprint size={56} color="#a78bfa" strokeWidth={1.5} />
              )}
            </View>
            
            <Text style={styles.modalTitle}>{biometricType}-ის გააქტიურება</Text>
            <Text style={styles.modalDescription}>
              გსურთ {biometricType} გამოიყენოთ სწრაფი შესვლისთვის?
              შემდეგ ჯერზე შეძლებთ სწრაფ ავტორიზაციას.
            </Text>
            
            <TouchableOpacity
              style={styles.modalEnableButton}
              onPress={handleEnableBiometric}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#8b5cf6', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButtonGradient}
              >
                <Check size={20} color="#fff" strokeWidth={2.5} />
                <Text style={styles.modalEnableButtonText}>დიახ, გააქტიურება</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalSkipButton}
              onPress={handleSkipBiometric}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSkipButtonText}>არა, გამოტოვება</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/onboarding')}>
              <ArrowLeft size={20} color="#a78bfa" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>კეთილი იყოს თქვენი მობრძანება</Text>
            <Text style={styles.subtitle}>შედით თქვენს ანგარიშზე</Text>
          </View>

          {canQuickLogin && storedUsername && (
            <TouchableOpacity
              style={styles.biometricQuickLoginButton}
              onPress={handleBiometricQuickLogin}
              activeOpacity={0.85}
            >
              <View style={styles.biometricQuickLoginContent}>
                <View style={styles.biometricIconWrapper}>
                  {biometricType.includes('Face') ? (
                    <Scan size={32} color="#a78bfa" strokeWidth={2} />
                  ) : (
                    <Fingerprint size={32} color="#a78bfa" strokeWidth={2} />
                  )}
                </View>
                <View style={styles.biometricQuickLoginText}>
                  <Text style={styles.biometricQuickLoginTitle}>{biometricType}-ით შესვლა</Text>
                  <Text style={styles.biometricQuickLoginSubtitle}>{storedUsername}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {canQuickLogin && (
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ან</Text>
              <View style={styles.divider} />
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>მომხმარებელი</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputContainerFocused
              ]}>
                <User size={20} color={focusedInput === 'email' ? '#a78bfa' : '#6b7280'} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="შეიყვანეთ მომხმარებელი"
                  placeholderTextColor="#4b5563"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>პაროლი</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'password' && styles.inputContainerFocused
              ]}>
                <Lock size={20} color={focusedInput === 'password' ? '#a78bfa' : '#6b7280'} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="შეიყვანეთ პაროლი"
                  placeholderTextColor="#4b5563"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <Eye size={20} color="#a78bfa" strokeWidth={2} />
                  ) : (
                    <EyeOff size={20} color="#6b7280" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkmark} />}
                </View>
                <Text style={styles.rememberText}>დამიმახსოვრე</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>დაგავიწყდა პაროლი?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ['#374151', '#374151'] : ['#8b5cf6', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Loader />
                ) : (
                  <Text style={styles.buttonText}>შესვლა</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ან</Text>
              <View style={styles.divider} />
            </View>

            {appleAuthAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={14}
                style={styles.appleAuthButton}
                onPress={handleAppleSignIn}
              />
            ) : (
              <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} activeOpacity={0.85}>
                <View style={styles.appleIconContainer}>
                  <Text style={styles.appleIcon}></Text>
                </View>
                <Text style={styles.appleButtonText}>Apple-ით შესვლა</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>არ გაქვთ ანგარიში? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>რეგისტრაცია</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  glowOrb3: {
    position: 'absolute',
    top: height * 0.4,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  biometricQuickLoginButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  biometricQuickLoginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  biometricIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  biometricQuickLoginText: {
    flex: 1,
  },
  biometricQuickLoginTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  biometricQuickLoginSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    gap: 12,
  },
  inputContainerFocused: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  rememberText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
  },
  dividerText: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  appleAuthButton: {
    width: '100%',
    height: 54,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 14,
  },
  appleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    color: '#a78bfa',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalEnableButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  modalEnableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSkipButton: {
    paddingVertical: 12,
  },
  modalSkipButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
});
