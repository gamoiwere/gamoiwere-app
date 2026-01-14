import { useState, useEffect, ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, Lock, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import SuccessNotification from '@/components/SuccessNotification';
import Loader from '@/components/Loader';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
    };
    checkAppleAuth();
  }, []);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !fullName || !phone) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    if (!agreeToTerms) {
      setError('თქვენ უნდა დაეთანხმოთ წესებს და პირობებს');
      return;
    }

    if (password !== confirmPassword) {
      setError('პაროლები არ ემთხვევა');
      return;
    }

    if (password.length < 6) {
      setError('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო');
      return;
    }

    if (!phone.startsWith('+995')) {
      setError('ტელეფონი უნდა იწყებოდეს +995-ით');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.register(
        username.trim(),
        email.trim(),
        password,
        confirmPassword,
        fullName.trim(),
        phone,
        agreeToTerms
      );
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/auth/verify-otp');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'რეგისტრაცია ვერ მოხერხდა');
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('Apple Sign Up Success:', credential);
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1200);
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign Up');
      } else {
        setError('Apple-ით რეგისტრაცია ვერ მოხერხდა');
        console.error('Apple Sign Up Error:', e);
      }
    }
  };

  const renderInput = (
    icon: ReactNode,
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    inputKey: string,
    options?: {
      secureTextEntry?: boolean;
      showToggle?: boolean;
      toggleValue?: boolean;
      onToggle?: () => void;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    }
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        focusedInput === inputKey && styles.inputContainerFocused
      ]}>
        {icon}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#4b5563"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={options?.autoCapitalize || 'none'}
          keyboardType={options?.keyboardType || 'default'}
          secureTextEntry={options?.secureTextEntry}
          editable={!loading}
          onFocus={() => setFocusedInput(inputKey)}
          onBlur={() => setFocusedInput(null)}
        />
        {options?.showToggle && (
          <TouchableOpacity onPress={options.onToggle} style={styles.eyeButton}>
            {options.toggleValue ? (
              <Eye size={20} color="#7816d6" strokeWidth={2} />
            ) : (
              <EyeOff size={20} color="#6b7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#f8f9fa', '#f8f9fa']}
        style={styles.background}
      />
      
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      <SuccessNotification
        visible={showSuccess}
        message="ანგარიში წარმატებით შეიქმნა!"
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#7816d6" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>შექმენი ანგარიში</Text>
            <Text style={styles.subtitle}>შეავსეთ ფორმა რეგისტრაციისთვის</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {renderInput(
              <User size={20} color={focusedInput === 'fullName' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'სახელი და გვარი',
              'შეიყვანეთ სახელი და გვარი',
              fullName,
              setFullName,
              'fullName',
              { autoCapitalize: 'words' }
            )}

            {renderInput(
              <User size={20} color={focusedInput === 'username' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'მომხმარებელი',
              'შეიყვანეთ მომხმარებელი',
              username,
              setUsername,
              'username'
            )}

            {renderInput(
              <Mail size={20} color={focusedInput === 'email' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'ელ-ფოსტა',
              'example@email.com',
              email,
              setEmail,
              'email',
              { keyboardType: 'email-address' }
            )}

            {renderInput(
              <Phone size={20} color={focusedInput === 'phone' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'ტელეფონი',
              '+995 555 123 456',
              phone,
              setPhone,
              'phone',
              { keyboardType: 'phone-pad' }
            )}

            {renderInput(
              <Lock size={20} color={focusedInput === 'password' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'პაროლი',
              'მინ. 6 სიმბოლო',
              password,
              setPassword,
              'password',
              {
                secureTextEntry: !showPassword,
                showToggle: true,
                toggleValue: showPassword,
                onToggle: () => setShowPassword(!showPassword)
              }
            )}

            {renderInput(
              <Lock size={20} color={focusedInput === 'confirmPassword' ? '#7816d6' : '#6b7280'} strokeWidth={2} />,
              'გაიმეორეთ პაროლი',
              'გაიმეორეთ პაროლი',
              confirmPassword,
              setConfirmPassword,
              'confirmPassword',
              {
                secureTextEntry: !showConfirmPassword,
                showToggle: true,
                toggleValue: showConfirmPassword,
                onToggle: () => setShowConfirmPassword(!showConfirmPassword)
              }
            )}

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </View>
              <Text style={styles.termsText}>
                ვეთანხმები{' '}
                <Text style={styles.termsLink}>წესებსა და პირობებს</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
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
                  <Text style={styles.buttonText}>რეგისტრაცია</Text>
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
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={14}
                style={styles.appleAuthButton}
                onPress={handleAppleSignUp}
              />
            ) : (
              <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignUp} activeOpacity={0.85}>
                <View style={styles.appleIconContainer}>
                  <Text style={styles.appleIcon}></Text>
                </View>
                <Text style={styles.appleButtonText}>Apple-ით რეგისტრაცია</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>უკვე გაქვთ ანგარიში? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>შესვლა</Text>
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
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 150,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  inputContainerFocused: {
    borderColor: '#7816d6',
    backgroundColor: 'rgba(120, 22, 214, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
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
  termsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    flex: 1,
  },
  termsLink: {
    color: '#7816d6',
    fontWeight: '700',
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
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1f2937',
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
    height: 52,
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
    color: '#1f2937',
  },
  appleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
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
});
