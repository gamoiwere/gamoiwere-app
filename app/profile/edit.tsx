import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { ArrowLeft, Save, User, Mail, Phone, AtSign, ShieldCheck, Wallet, CreditCard } from 'lucide-react-native';
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
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>რედაქტირება</Text>
            </View>
            <View style={styles.headerSpacer} />
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
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>რედაქტირება</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#6e39ea', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarContainer}
            >
              <User size={48} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={16} color="#6b7280" strokeWidth={2} />
                <Text style={styles.label}>სრული სახელი *</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="თქვენი სახელი და გვარი"
                placeholderTextColor="#9ca3af"
                value={fullName}
                onChangeText={setFullName}
                editable={!saving}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <AtSign size={16} color="#6b7280" strokeWidth={2} />
                <Text style={styles.label}>მომხმარებლის სახელი *</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Mail size={16} color="#6b7280" strokeWidth={2} />
                <Text style={styles.label}>ელ.ფოსტა *</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Phone size={16} color="#6b7280" strokeWidth={2} />
                <Text style={styles.label}>ტელეფონი</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="+995555123456"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!saving}
              />
              <Text style={styles.hint}>ტელეფონი უნდა იწყებოდეს +995-ით</Text>
            </View>

            {(user?.balance !== undefined || user?.balance_code || user?.verification_status) && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>დამატებითი ინფორმაცია</Text>
              </>
            )}

            {user?.balance !== undefined && (
              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <Wallet size={20} color="#7c3aed" strokeWidth={2.5} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>ბალანსი</Text>
                  <Text style={styles.infoValue}>{user.balance.toFixed(2)} ₾</Text>
                </View>
              </View>
            )}

            {user?.balance_code && (
              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <CreditCard size={20} color="#7c3aed" strokeWidth={2.5} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>ბალანსის კოდი</Text>
                  <Text style={styles.infoValue}>{user.balance_code}</Text>
                </View>
              </View>
            )}

            {user?.verification_status && (
              <View style={styles.infoCard}>
                <View style={[styles.infoIconBg, {
                  backgroundColor: user.verification_status === 'verified' ? '#d1fae5' : '#fef3c7'
                }]}>
                  <ShieldCheck
                    size={20}
                    color={user.verification_status === 'verified' ? '#10b981' : '#f59e0b'}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>ვერიფიკაცია</Text>
                  <Text style={[styles.infoValue, {
                    color: user.verification_status === 'verified' ? '#10b981' : '#f59e0b'
                  }]}>
                    {user.verification_status === 'verified' ? 'დადასტურებული' : 'არ არის დადასტურებული'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={saving ? ['#9ca3af', '#6b7280'] : ['#6e39ea', '#8b5cf6']}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
  label: {
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
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    fontFamily: 'MarkGEO-Regular',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
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
    marginBottom: 2,
    fontFamily: 'MarkGEO-Regular',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
  footer: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
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
    gap: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'MarkGEO-Regular',
  },
});
