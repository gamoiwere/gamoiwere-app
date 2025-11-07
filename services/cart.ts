import { authService } from './auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface CartItem {
  id: number;
  userId: number;
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  variations: Record<string, string>;
  variationId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  count: number;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  variations?: Record<string, string>;
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const response = await fetch(`${API_BASE_URL}/api/mobile/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('კალათის ჩატვირთვა ვერ მოხერხდა');
    }

    return response.json();
  },

  async addToCart(item: AddToCartRequest): Promise<{ success: boolean; item: CartItem; message: string }> {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const response = await fetch(`${API_BASE_URL}/api/mobile/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error('პროდუქტის დამატება ვერ მოხერხდა');
    }

    return response.json();
  },

  async updateQuantity(id: number, quantity: number): Promise<{ success: boolean; item: CartItem; message: string }> {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const response = await fetch(`${API_BASE_URL}/api/mobile/cart/update/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('რაოდენობის განახლება ვერ მოხერხდა');
    }

    return response.json();
  },

  async removeItem(id: number): Promise<{ success: boolean; message: string }> {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const response = await fetch(`${API_BASE_URL}/api/mobile/cart/remove/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('პროდუქტის წაშლა ვერ მოხერხდა');
    }

    return response.json();
  },

  async clearCart(): Promise<{ success: boolean; message: string }> {
    const token = await authService.getToken();
    if (!token) {
      throw new Error('არ ხართ ავტორიზებული');
    }

    const response = await fetch(`${API_BASE_URL}/api/mobile/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('კალათის გაწმენდა ვერ მოხერხდა');
    }

    return response.json();
  },
};
