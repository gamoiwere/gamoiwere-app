import { Product } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://gamoiwere.ge/api';

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

  async getFavorites(): Promise<Product[]> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites`, { headers });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async addToFavorites(productId: string): Promise<boolean> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId }),
      });
      return response.ok;
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
      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },
};
