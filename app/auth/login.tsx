import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { biometricService } from '@/services/biometric';
import { ArrowLeft, EyeOff, Eye, User, Lock, Scan, Fingerprint, X } from 'lucide-react-native';
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
  
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [canQuickLogin, setCanQuickLogin] = useState(false);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricEnabling, setBiometricEnabling] = useState(false);

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
      setLoading(false);
      
      if (biometricAvailable) {
        const isAlreadyEnabled = await biometricService.isBiometricEnabled();
        if (isAlreadyEnabled) {
          await biometricService.updateStoredToken();
          setShowSuccess(true);
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1200);
        } else {
          setShowBiometricModal(true);
        }
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'შესვლა ვერ მოხერხდა');
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    setBiometricEnabling(true);
    
    try {
      const authResult = await biometricService.authenticate(`გამოიყენეთ ${biometricType} გასააქტიურებლად`);
      
      if (authResult.success) {
        await biometricService.enableBiometric(pendingUsername);
        setShowBiometricModal(false);
        setBiometricEnabling(false);
        setShowSuccess(true);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1200);
      } else {
        setBiometricEnabling(false);
        if (authResult.error && authResult.error !== 'ავტორიზაცია გაუქმებულია') {
          setError(authResult.error);
        }
      }
    } catch (err: any) {
      setBiometricEnabling(false);
      console.log('Error enabling biometric:', err);
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
      return <Scan size={24} color="#7816d6" strokeWidth={2} />;
    }
    return <Fingerprint size={24} color="#7816d6" strokeWidth={2} />;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#f8f9fa', '#f8f9fa']}
        style={styles.background}
      />
      

      <SuccessNotification
        visible={showSuccess}
        message="წარმატებით შეხვედით სისტემაში!"
        onHide={() => setShowSuccess(false)}
      />

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
              <ArrowLeft size={20} color="#7816d6" strokeWidth={2.5} />
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
                    <Scan size={32} color="#7816d6" strokeWidth={2} />
                  ) : (
                    <Fingerprint size={32} color="#7816d6" strokeWidth={2} />
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
                <User size={20} color={focusedInput === 'email' ? '#7816d6' : '#6b7280'} strokeWidth={2} />
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
                <Lock size={20} color={focusedInput === 'password' ? '#7816d6' : '#6b7280'} strokeWidth={2} />
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
                    <Eye size={20} color="#7816d6" strokeWidth={2} />
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
                colors={loading ? ['#374151', '#374151'] : ['#7816d6', '#7816d6']}
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

      <Modal
        visible={showBiometricModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipBiometric}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleSkipBiometric}
            >
              <X size={18} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.modalIconContainer}>
              {biometricType.includes('Face') ? (
                <Scan size={48} color="#7816d6" strokeWidth={1.5} />
              ) : (
                <Fingerprint size={48} color="#7816d6" strokeWidth={1.5} />
              )}
            </View>
            
            <Text style={styles.modalTitle}>{biometricType}-ის გააქტიურება</Text>
            <Text style={styles.modalDescription}>
              გსურთ {biometricType}-ის გამოყენება სწრაფი და უსაფრთხო შესვლისთვის? 
              შემდეგ ჯერზე მარტივად შეხვალთ თქვენს ანგარიშზე.
            </Text>
            
            <TouchableOpacity
              style={styles.modalEnableButton}
              onPress={handleEnableBiometric}
              disabled={biometricEnabling}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7816d6', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButtonGradient}
              >
                {biometricEnabling ? (
                  <Loader />
                ) : (
                  <>
                    {biometricType.includes('Face') ? (
                      <Scan size={20} color="#ffffff" strokeWidth={2} />
                    ) : (
                      <Fingerprint size={20} color="#ffffff" strokeWidth={2} />
                    )}
                    <Text style={styles.modalEnableButtonText}>გააქტიურება</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalSkipButton}
              onPress={handleSkipBiometric}
            >
              <Text style={styles.modalSkipButtonText}>გამოტოვება</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
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
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  biometricQuickLoginButton: {
    backgroundColor: 'rgba(120, 22, 214, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
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
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
  },
  biometricQuickLoginText: {
    flex: 1,
  },
  biometricQuickLoginTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  biometricQuickLoginSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#374151',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  inputContainerFocused: {
    borderColor: '#7816d6',
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
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
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#7816d6',
    borderColor: '#7816d6',
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
    color: '#7816d6',
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
    backgroundColor: '#e5e7eb',
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
    color: '#7816d6',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.1)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(120, 22, 214, 0.15)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#6b7280',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSkipButton: {
    paddingVertical: 12,
  },
  modalSkipButtonText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
  },
});
