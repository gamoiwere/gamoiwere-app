import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { authService, Address } from '@/services/auth';
import { MapPin, Plus, X, Check, ArrowLeft, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddressesScreen() {
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>მისამართები</Text>
        </View>
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
        <Text style={styles.title}>მისამართები</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MapPin size={48} color="#ccc" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>არ გაქვთ შენახული მისამართი</Text>
            <Text style={styles.emptySubtitle}>დაამატეთ მისამართი სწრაფი შეკვეთისთვის</Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => (
              <View key={addr.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressIcon}>
                    <MapPin size={20} color="#007AFF" strokeWidth={2} />
                  </View>
                  {addr.is_default && (
                    <View style={styles.defaultBadge}>
                      <Check size={12} color="#10b981" strokeWidth={3} />
                      <Text style={styles.defaultText}>ძირითადი</Text>
                    </View>
                  )}
                </View>
                {addr.title && <Text style={styles.addressTitle}>{addr.title}</Text>}
                {addr.recipient_name && <Text style={styles.addressName}>{addr.recipient_name}</Text>}
                {addr.recipient_phone && <Text style={styles.addressPhone}>{addr.recipient_phone}</Text>}
                <Text style={styles.addressText}>{addr.street_address}</Text>
                <Text style={styles.addressSubtext}>{addr.city}{addr.region ? `, ${addr.region}` : ''}</Text>
                {addr.postal_code && <Text style={styles.addressSubtext}>საფოსტო ინდექსი: {addr.postal_code}</Text>}

                <View style={styles.cardActions}>
                  {!addr.is_default && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(addr)}
                    >
                      <Check size={18} color="#10b981" strokeWidth={2} />
                      <Text style={styles.actionButtonText}>ძირითადი</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(addr)}
                  >
                    <Edit2 size={18} color="#007AFF" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>რედაქტირება</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAddress(addr)}
                  >
                    <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>წაშლა</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.fab}>
        <TouchableOpacity onPress={openAddModal} activeOpacity={0.9}>
          <LinearGradient
            colors={['#007AFF', '#0056CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus size={28} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  addressList: {
    padding: 20,
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b98110',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteText: {
    color: '#ef4444',
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
