import { useState, ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ArrowLeft, Eye, EyeOff, Apple, User, Mail, Phone, Lock, UserPlus, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const renderInput = (
    icon: ReactNode,
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
    <View style={[
      styles.inputContainer,
      focusedInput === inputKey && styles.inputContainerFocused
    ]}>
      <View style={styles.inputIconContainer}>
        {icon}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#a1a1aa"
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
            <Eye size={20} color="#7c3aed" strokeWidth={2} />
          ) : (
            <EyeOff size={20} color="#a1a1aa" strokeWidth={2} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7c3aed', '#a855f7', '#c084fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

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
              <ArrowLeft size={22} color="#7c3aed" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#7c3aed', '#a855f7']}
                style={styles.iconGradient}
              >
                <UserPlus size={32} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={styles.welcomeTitle}>შექმენი ანგარიში</Text>
            <Text style={styles.welcomeSubtitle}>შეავსეთ ფორმა რეგისტრაციისთვის</Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {renderInput(
                <User size={20} color={focusedInput === 'fullName' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
                'სახელი და გვარი',
                fullName,
                setFullName,
                'fullName',
                { autoCapitalize: 'words' }
              )}

              {renderInput(
                <User size={20} color={focusedInput === 'username' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
                'მომხმარებლის სახელი',
                username,
                setUsername,
                'username'
              )}

              {renderInput(
                <Mail size={20} color={focusedInput === 'email' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
                'ელ-ფოსტა',
                email,
                setEmail,
                'email',
                { keyboardType: 'email-address' }
              )}

              {renderInput(
                <Phone size={20} color={focusedInput === 'phone' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
                '+995 555 123 456',
                phone,
                setPhone,
                'phone',
                { keyboardType: 'phone-pad' }
              )}

              {renderInput(
                <Lock size={20} color={focusedInput === 'password' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
                'პაროლი (მინ. 6 სიმბოლო)',
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
                <Lock size={20} color={focusedInput === 'confirmPassword' ? '#7c3aed' : '#a1a1aa'} strokeWidth={2} />,
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
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#d4d4d8', '#d4d4d8'] : ['#7c3aed', '#a855f7']}
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

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Apple size={22} color="#18181b" strokeWidth={2} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Mail size={22} color="#ea4335" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: '#f8f7ff',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 80,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f7ff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#7c3aed',
    backgroundColor: '#ffffff',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#18181b',
    fontWeight: '500',
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 8,
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
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d4d4d8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  termsText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
    flex: 1,
  },
  termsLink: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    fontSize: 14,
    color: '#a1a1aa',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f8f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#71717a',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 15,
    color: '#7c3aed',
    fontWeight: '700',
  },
});
