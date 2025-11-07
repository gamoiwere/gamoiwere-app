import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService, Address } from '@/services/auth';
import { MapPin, Plus, X, Check, ArrowLeft, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Loader from '@/components/Loader';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setError('');
      const data = await authService.getAddresses();
      setAddresses(data);
      console.log('✅ Addresses loaded:', data.length, 'addresses');
    } catch (error: any) {
      console.error('❌ Error loading addresses:', error.message);
      setError(error.message || 'მისამართების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setTitle('');
    setRecipientName('');
    setRecipientPhone('');
    setRegion('საქართველო');
    setCity('');
    setStreetAddress('');
    setPostalCode('');
    setIsDefault(false);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setTitle(addr.title || '');
    setRecipientName(addr.recipient_name || '');
    setRecipientPhone(addr.recipient_phone || '');
    setRegion(addr.region);
    setCity(addr.city);
    setStreetAddress(addr.street_address);
    setPostalCode(addr.postal_code);
    setIsDefault(addr.is_default);
    setShowModal(true);
  };

  const handleSaveAddress = async () => {
    if (!city || !streetAddress) {
      Alert.alert('შეცდომა', 'გთხოვთ შეავსოთ ქალაქი და მისამართი');
      return;
    }

    if (recipientName && recipientPhone && !recipientPhone.startsWith('+995')) {
      Alert.alert('შეცდომა', 'ტელეფონი უნდა იწყებოდეს +995-ით');
      return;
    }

    setSaving(true);

    try {
      if (editingAddress) {
        await authService.updateAddress(
          editingAddress.id,
          title,
          recipientName,
          recipientPhone,
          region,
          city,
          streetAddress,
          postalCode,
          isDefault
        );
        Alert.alert('წარმატება', 'მისამართი განახლდა');
      } else {
        await authService.addAddress(title, recipientName, recipientPhone, region, city, streetAddress, postalCode, isDefault);
        Alert.alert('წარმატება', 'მისამართი დაემატა');
      }
      setShowModal(false);
      await loadAddresses();
    } catch (error: any) {
      Alert.alert('შეცდომა', error.message || 'ოპერაცია ვერ შესრულდა');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (addr: Address) => {
    Alert.alert(
      'წაშლის დადასტურება',
      'დარწმუნებული ხართ, რომ გსურთ ამ მისამართის წაშლა?',
      [
        { text: 'გაუქმება', style: 'cancel' },
        {
          text: 'წაშლა',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAddress(addr.id);
              Alert.alert('წარმატება', 'მისამართი წაიშალა');
              await loadAddresses();
            } catch (error: any) {
              Alert.alert('შეცდომა', error.message || 'მისამართის წაშლა ვერ მოხერხდა');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.is_default) return;

    try {
      await authService.setDefaultAddress(addr.id);
      Alert.alert('წარმატება', 'ნაგულისხმევი მისამართი დაყენებულია');
      await loadAddresses();
    } catch (error: any) {
      Alert.alert('შეცდომა', error.message || 'ოპერაცია ვერ შესრულდა');
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
              <Text style={styles.headerTitle}>მისამართები</Text>
            </View>
            <View style={styles.statsCompact}>
              <View style={styles.statBoxCompact}>
                <Text style={styles.statNumberCompact}>0</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader />
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
            <Text style={styles.headerTitle}>მისამართები</Text>
          </View>
          <View style={styles.statsCompact}>
            <View style={styles.statBoxCompact}>
              <Text style={styles.statNumberCompact}>{addresses.length}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6e39ea" />
        }
      >
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <MapPin size={64} color="#d1d5db" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>არ გაქვთ შენახული მისამართი</Text>
              <Text style={styles.emptySubtitle}>დაამატეთ მისამართი სწრაფი შეკვეთისთვის</Text>
            </View>
          ) : (
            <>
              {addresses.map((addr, index) => (
                <View key={addr.id} style={[styles.addressCard, { marginTop: index === 0 ? 0 : 16 }]}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressHeaderLeft}>
                      {addr.title && <Text style={styles.addressLabel}>მისამართი</Text>}
                      {addr.title && <Text style={styles.addressTitle}>{addr.title}</Text>}
                    </View>
                    {addr.is_default && (
                      <View style={styles.defaultBadge}>
                        <Check size={14} color="#10b981" strokeWidth={2.5} />
                        <Text style={styles.defaultText}>ძირითადი</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressBody}>
                    {addr.recipient_name && (
                      <View style={styles.infoRow}>
                        <MapPin size={16} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.infoText}>{addr.recipient_name}</Text>
                      </View>
                    )}
                    <Text style={styles.addressText}>{addr.street_address}</Text>
                    <Text style={styles.addressSubtext}>{addr.city}{addr.region ? `, ${addr.region}` : ''}</Text>
                    {addr.postal_code && <Text style={styles.addressSubtext}>საფოსტო ინდექსი: {addr.postal_code}</Text>}
                    {addr.recipient_phone && <Text style={styles.addressPhone}>{addr.recipient_phone}</Text>}
                  </View>

                  <View style={styles.cardActions}>
                    {!addr.is_default && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(addr)}
                        activeOpacity={0.7}
                      >
                        <Check size={16} color="#10b981" strokeWidth={2.5} />
                        <Text style={[styles.actionButtonText, { color: '#10b981' }]}>ძირითადი</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(addr)}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={16} color="#7c3aed" strokeWidth={2.5} />
                      <Text style={[styles.actionButtonText, { color: '#7c3aed' }]}>რედაქტირება</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(addr)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color="#dc2626" strokeWidth={2.5} />
                      <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>წაშლა</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6e39ea', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={28} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'მისამართის რედაქტირება' : 'ახალი მისამართი'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#666" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>სათაური (ოფისი, სახლი, და ა.შ.)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ოფისი"
                    placeholderTextColor="#999"
                    value={title}
                    onChangeText={setTitle}
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>მიმღების სახელი</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="თქვენი სახელი და გვარი"
                    placeholderTextColor="#999"
                    value={recipientName}
                    onChangeText={setRecipientName}
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>მიმღების ტელეფონი</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+995555123456"
                    placeholderTextColor="#999"
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    keyboardType="phone-pad"
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>რეგიონი</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="საქართველო"
                    placeholderTextColor="#999"
                    value={region}
                    onChangeText={setRegion}
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ქალაქი *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="თბილისი"
                    placeholderTextColor="#999"
                    value={city}
                    onChangeText={setCity}
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ქუჩის მისამართი *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="ქუჩა, ნომერი, ბინა"
                    placeholderTextColor="#999"
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                    multiline
                    numberOfLines={3}
                    editable={!saving}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>საფოსტო კოდი</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0108"
                    placeholderTextColor="#999"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    editable={!saving}
                  />
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIsDefault(!isDefault)}
                  disabled={saving}
                >
                  <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                    {isDefault && <Check size={16} color="#fff" strokeWidth={3} />}
                  </View>
                  <Text style={styles.checkboxLabel}>ძირითად მისამართად დაყენება</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
                disabled={saving}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'ინახება...' : 'შენახვა'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  statsCompact: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBoxCompact: {
    alignItems: 'center',
  },
  statNumberCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
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
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'MarkGEO-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'MarkGEO-Regular',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'MarkGEO-Regular',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addressHeaderLeft: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'MarkGEOCAPS-Regular',
  },
  addressTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    fontFamily: 'MarkGEO-Regular',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    backgroundColor: '#d1fae5',
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'MarkGEO-Regular',
  },
  addressBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'MarkGEO-Regular',
  },
  addressText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  addressSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: 'MarkGEO-Regular',
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'MarkGEO-Regular',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'MarkGEO-Regular',
  },
  bottomSpace: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
