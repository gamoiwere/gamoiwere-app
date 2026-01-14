import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const STORED_USERNAME_KEY = 'stored_username';
const STORED_AUTH_TOKEN_KEY = 'biometric_auth_token';

const secureStoreAvailable = Platform.OS !== 'web';

const secureGet = async (key: string): Promise<string | null> => {
  if (!secureStoreAvailable) {
    return null;
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log('SecureStore get error:', error);
    return null;
  }
};

const secureSet = async (key: string, value: string): Promise<void> => {
  if (!secureStoreAvailable) {
    throw new Error('Secure storage not available on this platform');
  }
  await SecureStore.setItemAsync(key, value);
};

const secureDelete = async (key: string): Promise<void> => {
  if (!secureStoreAvailable) {
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log('SecureStore delete error:', error);
  }
};

export const biometricService = {
  async isBiometricSupported(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false;
      }
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      console.log('Error checking biometric hardware:', error);
      return false;
    }
  },

  async isBiometricEnrolled(): Promise<boolean> {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.log('Error checking biometric enrollment:', error);
      return false;
    }
  },

  async getBiometricType(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      return 'Biometric';
    } catch (error) {
      console.log('Error getting biometric type:', error);
      return 'Biometric';
    }
  },

  async authenticate(promptMessage?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const biometricType = await this.getBiometricType();
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || `გამოიყენეთ ${biometricType} ავტორიზაციისთვის`,
        cancelLabel: 'გაუქმება',
        fallbackLabel: 'გამოიყენეთ პაროლი',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'ავტორიზაცია ვერ მოხერხდა';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'ავტორიზაცია გაუქმებულია';
        } else if (result.error === 'lockout') {
          errorMessage = 'ძალიან ბევრი მცდელობა. სცადეთ მოგვიანებით';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'ბიომეტრია არ არის დაყენებული';
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.log('Biometric authentication error:', error);
      return { success: false, error: error.message || 'ავტორიზაცია ვერ მოხერხდა' };
    }
  },

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await secureGet(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.log('Error checking biometric enabled status:', error);
      return false;
    }
  },

  async enableBiometric(username: string): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found');
      }
      
      await secureSet(BIOMETRIC_ENABLED_KEY, 'true');
      await secureSet(STORED_USERNAME_KEY, username);
      await secureSet(STORED_AUTH_TOKEN_KEY, authToken);
      console.log('Biometric enabled for user:', username);
    } catch (error) {
      console.log('Error enabling biometric:', error);
      throw error;
    }
  },

  async disableBiometric(): Promise<void> {
    try {
      await secureDelete(BIOMETRIC_ENABLED_KEY);
      await secureDelete(STORED_USERNAME_KEY);
      await secureDelete(STORED_AUTH_TOKEN_KEY);
      console.log('Biometric disabled');
    } catch (error) {
      console.log('Error disabling biometric:', error);
    }
  },

  async getStoredUsername(): Promise<string | null> {
    try {
      return await secureGet(STORED_USERNAME_KEY);
    } catch (error) {
      console.log('Error getting stored username:', error);
      return null;
    }
  },

  async canUseBiometric(): Promise<boolean> {
    const isSupported = await this.isBiometricSupported();
    const isEnrolled = await this.isBiometricEnrolled();
    const isEnabled = await this.isBiometricEnabled();
    const storedUsername = await this.getStoredUsername();
    const hasStoredToken = await this.hasStoredAuthToken();
    
    return isSupported && isEnrolled && isEnabled && !!storedUsername && hasStoredToken;
  },

  async hasStoredAuthToken(): Promise<boolean> {
    try {
      const token = await secureGet(STORED_AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.log('Error checking stored auth token:', error);
      return false;
    }
  },

  async restoreAuthSession(): Promise<boolean> {
    try {
      const storedToken = await secureGet(STORED_AUTH_TOKEN_KEY);
      if (!storedToken) {
        console.log('No stored auth token found');
        return false;
      }

      await AsyncStorage.setItem('authToken', storedToken);
      console.log('Auth session restored from biometric storage');
      
      const isValid = await this.verifyStoredToken(storedToken);
      if (!isValid) {
        console.log('Stored token is no longer valid');
        await this.disableBiometric();
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('Error restoring auth session:', error);
      return false;
    }
  },

  async verifyStoredToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://gamoiwere.ge/api/mobile/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Error verifying token:', error);
      return false;
    }
  },

  async updateStoredToken(): Promise<void> {
    try {
      const currentToken = await AsyncStorage.getItem('authToken');
      if (currentToken) {
        await secureSet(STORED_AUTH_TOKEN_KEY, currentToken);
        console.log('Updated stored biometric token');
      }
    } catch (error) {
      console.log('Error updating stored token:', error);
    }
  },
};
