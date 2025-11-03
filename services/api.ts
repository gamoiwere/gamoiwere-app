import { Product, Favorite } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://gamoiwere.ge/api/mobile';

async function getHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/products`, { headers });
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async getRecommendedProducts(): Promise<Product[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/products?recommended=true`, { headers });
      if (!response.ok) throw new Error('Failed to fetch recommended products');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getPopularProducts(): Promise<Product[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/products?popular=true`, { headers });
      if (!response.ok) throw new Error('Failed to fetch popular products');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getFavorites(): Promise<Favorite[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites`, { headers });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      return data.success ? data.favorites : [];
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async addToFavorites(productId: string, productData: {
    productTitle: string;
    productImage: string;
    productPrice: number;
    productUrl: string;
  }): Promise<boolean> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId,
          ...productData,
        }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async removeFromFavorites(productId: string): Promise<boolean> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async checkIsFavorite(productId: string): Promise<boolean> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites/${productId}/check`, { headers });
      if (!response.ok) return false;
      const data = await response.json();
      return data.success && data.isFavorite;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },
};
