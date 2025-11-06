import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Favorite } from '@/types';

const API_BASE_URL = 'https://gamoiwere.ge/api/mobile/auth';
const USER_API_URL = 'https://gamoiwere.ge/api/user';
const MOBILE_USER_API_URL = 'https://gamoiwere.ge/api/mobile/user';
const FAVORITES_API_URL = 'https://gamoiwere.ge/api/mobile/favorites';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  full_name?: string;
  address?: string;
  role?: string;
  balance?: number;
  balance_code?: string;
  pending_transportation_fees?: number;
  verification_status?: string;
  default_address_id?: number;
}

export interface Address {
  id: number | string;
  user_id?: number | string;
  title?: string;
  recipient_name?: string;
  recipient_phone?: string;
  street_address: string;
  city: string;
  region: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  phone: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login for:', usernameOrEmail);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail,
          password,
        }),
      });

      const data = await response.json();
      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        console.error('❌ Login failed:', data.message);
        throw new Error(data.message || 'შესვლა ვერ მოხერხდა');
      }

      console.log('✅ Login successful, token received:', data.token ? 'YES' : 'NO');
      console.log('📦 Token preview:', data.token ? data.token.substring(0, 30) + '...' : 'none');

      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      console.log('💾 Token saved to AsyncStorage');

      return data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  async register(username: string, email: string, password: string, confirmPassword: string, full_name: string, phone: string, terms: boolean): Promise<RegisterResponse> {
    try {
      console.log('📝 Attempting registration for:', username);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          full_name,
          phone,
          terms,
        }),
      });

      const data = await response.json();
      console.log('📡 Registration response status:', response.status);

      if (!response.ok) {
        console.error('❌ Registration failed:', data.message);
        throw new Error(data.message || 'რეგისტრაცია ვერ მოხერხდა');
      }

      console.log('✅ Registration successful');
      console.log('📱 Masked phone:', data.phone);

      await AsyncStorage.setItem('registrationPhone', data.phone);

      return data;
    } catch (error: any) {
      console.error('❌ Register error:', error);
      throw error;
    }
  },

  async verifyOTP(otp: string): Promise<VerifyOTPResponse> {
    try {
      console.log('🔐 Verifying OTP');

      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          otp,
        }),
      });

      const data = await response.json();
      console.log('📡 Verify OTP response status:', response.status);

      if (!response.ok) {
        console.error('❌ Verification failed:', data.message);
        throw new Error(data.message || 'ვერიფიკაცია ვერ მოხერხდა');
      }

      console.log('✅ Verification successful, token received');

      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.removeItem('registrationPhone');

      console.log('💾 Token and user saved to AsyncStorage');

      return data;
    } catch (error: any) {
      console.error('❌ Verify OTP error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('👤 Fetching user profile');

      const response = await fetch(`${MOBILE_USER_API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Get profile failed:', data.message);
        throw new Error(data.message || 'პროფილის ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Profile loaded successfully');

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error: any) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  },

  async updateProfile(full_name?: string, phone?: string, email?: string, username?: string): Promise<User> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('📝 Updating profile');

      const body: any = {};
      if (full_name !== undefined) body.full_name = full_name;
      if (phone !== undefined) body.phone = phone;
      if (email !== undefined) body.email = email;
      if (username !== undefined) body.username = username;

      const response = await fetch(`${MOBILE_USER_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Update profile failed:', data.message);
        throw new Error(data.message || 'პროფილის განახლება ვერ მოხერხდა');
      }

      console.log('✅ Profile updated successfully');

      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data.user;
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      const response = await fetch(`${USER_API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'პაროლის შეცვლა ვერ მოხერხდა');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  async addAddress(title: string, recipient_name: string, recipient_phone: string, region: string, city: string, street_address: string, postal_code: string = '', is_default: boolean = false): Promise<Address> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('📍 Adding address');

      const response = await fetch(`${MOBILE_USER_API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          recipient_name,
          recipient_phone,
          street_address,
          city,
          region,
          postal_code,
          is_default,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Add address failed:', data.message);
        throw new Error(data.message || 'მისამართის დამატება ვერ მოხერხდა');
      }

      console.log('✅ Address added successfully');
      return data.address;
    } catch (error: any) {
      console.error('❌ Add address error:', error);
      throw error;
    }
  },

  async getAddresses(): Promise<Address[]> {
    try {
      const token = await this.getToken();
      console.log('🔑 Getting addresses with token:', token ? 'EXISTS' : 'MISSING');

      if (!token) {
        console.error('❌ No token found');
        throw new Error('არ ხართ ავტორიზებული');
      }

      const response = await fetch(`${MOBILE_USER_API_URL}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API error:', data.message);
        throw new Error(data.message || 'მისამართების ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Successfully fetched', data.addresses?.length || 0, 'addresses');
      return data.addresses || [];
    } catch (error: any) {
      console.error('❌ Get addresses error:', error.message);
      throw error;
    }
  },

  async updateAddress(id: string | number, title: string, recipient_name: string, recipient_phone: string, region: string, city: string, street_address: string, postal_code: string = '', is_default: boolean = false): Promise<Address> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('📝 Updating address:', id);

      const response = await fetch(`${MOBILE_USER_API_URL}/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          recipient_name,
          recipient_phone,
          street_address,
          city,
          region,
          postal_code,
          is_default,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Update address failed:', data.message);
        throw new Error(data.message || 'მისამართის განახლება ვერ მოხერხდა');
      }

      console.log('✅ Address updated successfully');
      return data.address;
    } catch (error: any) {
      console.error('❌ Update address error:', error);
      throw error;
    }
  },

  async deleteAddress(id: string | number): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('🗑️ Deleting address:', id);

      const response = await fetch(`${MOBILE_USER_API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Delete address failed:', data.message);
        throw new Error(data.message || 'მისამართის წაშლა ვერ მოხერხდა');
      }

      console.log('✅ Address deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete address error:', error);
      throw error;
    }
  },

  async setDefaultAddress(id: string | number): Promise<Address> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('⭐ Setting default address:', id);

      const response = await fetch(`${MOBILE_USER_API_URL}/addresses/${id}/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Set default address failed:', data.message);
        throw new Error(data.message || 'ნაგულისხმევი მისამართის დაყენება ვერ მოხერხდა');
      }

      console.log('✅ Default address set successfully');
      return data.address;
    } catch (error: any) {
      console.error('❌ Set default address error:', error);
      throw error;
    }
  },

  async getFavorites(): Promise<Favorite[]> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('💖 Fetching favorites');

      const response = await fetch(`${FAVORITES_API_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API error:', data.message);
        throw new Error(data.message || 'რჩეულების ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Successfully fetched', data.favorites?.length || 0, 'favorites');
      return data.favorites || [];
    } catch (error: any) {
      console.error('❌ Get favorites error:', error.message);
      throw error;
    }
  },

  async addFavorite(productId: string, productTitle: string, productImage: string, productPrice: number, productUrl: string): Promise<Favorite> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('💖 Adding to favorites:', productId);

      const response = await fetch(`${FAVORITES_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          productTitle,
          productImage,
          productPrice,
          productUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Add favorite failed:', data.message);
        throw new Error(data.message || 'რჩეულებში დამატება ვერ მოხერხდა');
      }

      console.log('✅ Added to favorites successfully');
      return data.favorite;
    } catch (error: any) {
      console.error('❌ Add favorite error:', error);
      throw error;
    }
  },

  async removeFavorite(productId: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('💔 Removing from favorites:', productId);

      const response = await fetch(`${FAVORITES_API_URL}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Remove favorite failed:', data.message);
        throw new Error(data.message || 'რჩეულებიდან წაშლა ვერ მოხერხდა');
      }

      console.log('✅ Removed from favorites successfully');
    } catch (error: any) {
      console.error('❌ Remove favorite error:', error);
      throw error;
    }
  },

  async checkFavorite(productId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(`${FAVORITES_API_URL}/${productId}/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return false;
      }

      return data.isFavorite || false;
    } catch (error: any) {
      console.error('❌ Check favorite error:', error);
      return false;
    }
  },
};
