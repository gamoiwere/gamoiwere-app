import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { ArrowLeft, Save, User, Mail, Phone, UserCircle, Wallet, ShieldCheck, Hash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('შეცდომა', 'პროფილის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim() || !email.trim()) {
      Alert.alert('შეცდომა', 'გთხოვთ შეავსოთ სავალდებულო ველები');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('შეცდომა', 'გთხოვთ შეიყვანოთ სწორი ელ.ფოსტა');
      return;
    }

    if (phone && !phone.startsWith('+995')) {
      Alert.alert('შეცდომა', 'ტელეფონი უნდა იწყებოდეს +995-ით');
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await authService.updateProfile(
        fullName,
        phone || undefined,
        email,
        username
      );
      setUser(updatedUser);
      Alert.alert('წარმატება', 'პროფილი წარმატებით განახლდა', [
        { text: 'კარგი', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('შეცდომა', error.message || 'პროფილის განახლება ვერ მოხერხდა');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerSubtitle}>პროფილის</Text>
              <Text style={styles.headerTitle}>რედაქტირება</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <User size={64} color="#d1d5db" strokeWidth={1.5} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerSubtitle}>პროფილის</Text>
            <Text style={styles.headerTitle}>რედაქტირება</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            <User size={48} color="#fff" strokeWidth={2} />
          </LinearGradient>
          <Text style={styles.avatarLabel}>პროფილის სურათი</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>ძირითადი ინფორმაცია</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>სრული სახელი *</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <UserCircle size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="თქვენი სახელი და გვარი"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>მომხმარებლის სახელი *</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Hash size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ელ.ფოსტა *</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Mail size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ტელეფონი</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Phone size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="+995555123456"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
            <Text style={styles.hint}>ტელეფონი უნდა იწყებოდეს +995-ით</Text>
          </View>

          <Text style={styles.sectionTitle}>ანგარიშის ინფორმაცია</Text>

          {user?.balance !== undefined && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Wallet size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ბალანსი</Text>
                <Text style={styles.infoValue}>{user.balance.toFixed(2)} ₾</Text>
              </View>
            </View>
          )}

          {user?.balance_code && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Hash size={20} color="#7c3aed" strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ბალანსის კოდი</Text>
                <Text style={styles.infoValue}>{user.balance_code}</Text>
              </View>
            </View>
          )}

          {user?.verification_status && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <ShieldCheck size={20} color={user.verification_status === 'verified' ? '#10b981' : '#f59e0b'} strokeWidth={2} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ვერიფიკაციის სტატუსი</Text>
                <Text style={[styles.infoValue, { color: user.verification_status === 'verified' ? '#10b981' : '#f59e0b' }]}>
                  {user.verification_status === 'verified' ? 'დადასტურებული' : 'არ არის დადასტურებული'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={saving ? ['#9ca3af', '#9ca3af'] : ['#7c3aed', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>
              {saving ? 'მიმდინარეობს შენახვა...' : 'ცვლილებების შენახვა'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  headerGradient: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    gap: 16,
  },
  titleContainer: {
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    fontFamily: 'MarkGEO-Regular',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bbb',
    fontFamily: 'MarkGEO-Regular',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: 'MarkGEO-Regular',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    fontFamily: 'MarkGEO-Regular',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'MarkGEO-Regular',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    marginLeft: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'MarkGEO-Regular',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'MarkGEO-Regular',
  },
});
