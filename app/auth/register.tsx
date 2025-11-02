import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services/auth';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, Star, Zap, Shield, Phone } from 'lucide-react-native';
import SuccessNotification from '@/components/SuccessNotification';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !phone) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
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
      const response = await authService.register(username.trim(), email.trim(), password, phone);
      setShowSuccess(true);
      setTimeout(() => {
        router.push({
          pathname: '/auth/verify-otp',
          params: { userId: response.userId.toString() },
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'რეგისტრაცია ვერ მოხერხდა');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SuccessNotification
        visible={showSuccess}
        message="ანგარიში წარმატებით შეიქმნა!"
        onHide={() => setShowSuccess(false)}
      />
      <LinearGradient
        colors={['#0ea5e9', '#0284c7', '#0369a1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBadge}>
                  <Star size={24} color="#0ea5e9" strokeWidth={2.5} fill="#0ea5e9" />
                </View>
                <Text style={styles.cardTitle}>შემოგვიერთდით!</Text>
                <Text style={styles.cardSubtitle}>შექმენით ანგარიში რამდენიმე წამში</Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.benefitsRow}>
                <View style={styles.benefitBadge}>
                  <Zap size={14} color="#0ea5e9" strokeWidth={2.5} />
                  <Text style={styles.benefitText}>სწრაფი</Text>
                </View>
                <View style={styles.benefitBadge}>
                  <Shield size={14} color="#0ea5e9" strokeWidth={2.5} />
                  <Text style={styles.benefitText}>უსაფრთხო</Text>
                </View>
                <View style={styles.benefitBadge}>
                  <Star size={14} color="#0ea5e9" strokeWidth={2.5} />
                  <Text style={styles.benefitText}>ფასდაკლება</Text>
                </View>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>მომხმარებლის სახელი</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={20} color="#0ea5e9" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="username"
                      placeholderTextColor="#a1a1aa"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ტელეფონი</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={20} color="#0ea5e9" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="+995555123456"
                      placeholderTextColor="#a1a1aa"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ელ-ფოსტა</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#0ea5e9" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="example@mail.com"
                      placeholderTextColor="#a1a1aa"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>პაროლი</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#0ea5e9" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="მინიმუმ 6 სიმბოლო"
                      placeholderTextColor="#a1a1aa"
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
                        <EyeOff size={20} color="#71717a" strokeWidth={2} />
                      ) : (
                        <Eye size={20} color="#71717a" strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>გაიმეორეთ პაროლი</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#0ea5e9" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#a1a1aa"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#71717a" strokeWidth={2} />
                      ) : (
                        <Eye size={20} color="#71717a" strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0ea5e9', '#0284c7', '#0369a1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'იტვირთება...' : 'რეგისტრაცია'}
                    </Text>
                    {!loading && <ArrowRight size={22} color="#fff" strokeWidth={2.5} />}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>უკვე გაქვთ ანგარიში?</Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.footerLink}>შესვლა</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    left: -50,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '40%',
    right: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  card: {
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
    marginBottom: 6,
    letterSpacing: -1.5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.15)',
  },
  benefitText: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3f3f46',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(14, 165, 233, 0.1)',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#18181b',
    fontWeight: '500',
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
