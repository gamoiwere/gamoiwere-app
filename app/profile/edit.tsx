import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService, User as AuthUser } from '@/services/auth';
import { ArrowLeft, Save, User } from 'lucide-react-native';

export default function EditProfileScreen() {
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
      if (profile) {
        setFullName(profile.full_name || '');
        setUsername(profile.username || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      }
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
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>პროფილის რედაქტირება</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.avatarLabel}>პროფილის სურათი</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>სრული სახელი *</Text>
            <TextInput
              style={styles.input}
              placeholder="თქვენი სახელი და გვარი"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              editable={!saving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>მომხმარებლის სახელი *</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ელ.ფოსტა *</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ტელეფონი</Text>
            <TextInput
              style={styles.input}
              placeholder="+995555123456"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!saving}
            />
            <Text style={styles.hint}>ტელეფონი უნდა იწყებოდეს +995-ით</Text>
          </View>

          {user?.balance !== undefined && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ბალანსი</Text>
              <Text style={styles.infoValue}>{user.balance.toFixed(2)} ₾</Text>
            </View>
          )}

          {user?.balance_code && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ბალანსის კოდი</Text>
              <Text style={styles.infoValue}>{user.balance_code}</Text>
            </View>
          )}

          {user?.verification_status && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ვერიფიკაციის სტატუსი</Text>
              <Text style={[styles.infoValue, { color: user.verification_status === 'verified' ? '#10b981' : '#f59e0b' }]}>
                {user.verification_status === 'verified' ? 'დადასტურებული' : 'არ არის დადასტურებული'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={20} color="#fff" strokeWidth={2} />
          <Text style={styles.saveButtonText}>
            {saving ? 'მიმდინარეობს შენახვა...' : 'ცვლილებების შენახვა'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6e39ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLabel: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#6e39ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
