import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { ArrowLeft, EyeOff, Eye, Apple, Mail, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SuccessNotification from '@/components/SuccessNotification';
import Loader from '@/components/Loader';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(email.trim(), password);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SuccessNotification
        visible={showSuccess}
        message="წარმატებით შეხვედით სისტემაში!"
        onHide={() => setShowSuccess(false)}
      />

      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.replace('/onboarding')} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>შესვლა</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>მოგესალმებით!</Text>
            <Text style={styles.welcomeSubtitle}>შედით თქვენს ანგარიშში და განაგრძეთ შოპინგი</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Mail size={16} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.inputLabel}>მომხმარებლის სახელი</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="მომხმარებლის სახელი"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Lock size={16} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.inputLabel}>პაროლი</Text>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••••"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <Eye size={20} color="#6b7280" strokeWidth={2} />
                    ) : (
                      <EyeOff size={20} color="#6b7280" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rememberRow}>
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
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#9ca3af', '#6b7280'] : ['#6e39ea', '#8b5cf6']}
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
                <Text style={styles.dividerText}>ან შედით</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Apple size={20} color="#000000" strokeWidth={2} />
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>არ გაქვთ ანგარიში? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.footerLink}>რეგისტრაცია</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontFamily: 'MarkGEO-Regular',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'MarkGEO-Regular',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
    fontFamily: 'MarkGEO-Regular',
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
    fontWeight: '600',
    fontFamily: 'MarkGEO-Regular',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: 'MarkGEO-Regular',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d4d4d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  rememberText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: 'MarkGEO-Regular',
  },
  forgotText: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '700',
    fontFamily: 'MarkGEO-Regular',
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 16,
    fontWeight: '600',
    fontFamily: 'MarkGEO-Regular',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'MarkGEO-Regular',
  },
  footerLink: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '800',
    fontFamily: 'MarkGEO-Regular',
  },
});
