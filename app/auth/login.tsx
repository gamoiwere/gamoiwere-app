import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import SuccessNotification from '@/components/SuccessNotification';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      <View style={styles.decorativeShape1} />
      <View style={styles.decorativeShape2} />
      <View style={styles.decorativeShape3} />
      <View style={styles.decorativeShape4} />

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
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://gamoiwere.ge/assets/Asset%2023@4x-DOSuFs2H.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>შესვლა</Text>
              <Text style={styles.cardSubtitle}>შედით თქვენს ანგარიშში</Text>
            </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ელ-ფოსტა / მომხმარებელი</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#71717a" strokeWidth={2} />
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
                    <Lock size={18} color="#71717a" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
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

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'იტვირთება...' : 'შესვლა'}
                  </Text>
                </TouchableOpacity>
              </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>არ გაქვთ ანგარიში?</Text>
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
    backgroundColor: '#8b5cf6',
    position: 'relative',
  },
  decorativeShape1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -150,
    right: -100,
  },
  decorativeShape2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -100,
    left: -80,
  },
  decorativeShape3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '45%',
    right: -50,
  },
  decorativeShape4: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: '20%',
    left: 30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 32,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#71717a',
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 6,
    marginBottom: 24,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 10,
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#18181b',
    fontWeight: '400',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
});
