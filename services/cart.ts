import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

const GUEST_CART_KEY = 'guest_cart';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  name: string;
  price: number;
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
    try {
      const cartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
      const items: CartItem[] = cartStr ? JSON.parse(cartStr) : [];

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        success: true,
        items,
        summary: {
          totalItems,
          totalPrice,
          count: items.length,
        },
      };
    } catch (error) {
      console.error('Cart fetch error:', error);
      return {
        success: true,
        items: [],
        summary: {
          totalItems: 0,
          totalPrice: 0,
          count: 0,
        },
      };
    }
  },

  async addToCart(item: AddToCartRequest): Promise<{ success: boolean; item: CartItem; message: string }> {
    try {
      const variationId = item.variations
        ? Object.values(item.variations).join('-')
        : item.productId;

      const cartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
      const items: CartItem[] = cartStr ? JSON.parse(cartStr) : [];

      const existingItemIndex = items.findIndex(
        (i) => i.productId === item.productId && i.variationId === variationId
      );

      let updatedItem: CartItem;

      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += item.quantity;
        items[existingItemIndex].updatedAt = new Date().toISOString();
        updatedItem = items[existingItemIndex];
      } else {
        updatedItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          userId: 'guest',
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          variations: item.variations || {},
          variationId,
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        items.push(updatedItem);
      }

      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

      return {
        success: true,
        item: updatedItem,
        message: 'პროდუქტი წარმატებით დაემატა კალათაში',
      };
    } catch (error) {
      console.error('Cart insert error:', error);
      throw new Error('პროდუქტის დამატება ვერ მოხერხდა');
    }
  },

  async updateQuantity(id: string, quantity: number): Promise<{ success: boolean; item: CartItem; message: string }> {
    try {
      if (quantity <= 0) {
        return this.removeItem(id);
      }

      const cartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
      const items: CartItem[] = cartStr ? JSON.parse(cartStr) : [];

      const itemIndex = items.findIndex((i) => i.id === id);
      if (itemIndex === -1) {
        throw new Error('პროდუქტი ვერ მოიძებნა');
      }

      items[itemIndex].quantity = quantity;
      items[itemIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

      return {
        success: true,
        item: items[itemIndex],
        message: 'რაოდენობა განახლდა',
      };
    } catch (error) {
      console.error('Quantity update error:', error);
      throw new Error('რაოდენობის განახლება ვერ მოხერხდა');
    }
  },

  async removeItem(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const cartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
      const items: CartItem[] = cartStr ? JSON.parse(cartStr) : [];

      const filteredItems = items.filter((i) => i.id !== id);
      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(filteredItems));

      return {
        success: true,
        message: 'პროდუქტი წაიშალა კალათიდან',
      };
    } catch (error) {
      console.error('Remove item error:', error);
      throw new Error('პროდუქტის წაშლა ვერ მოხერხდა');
    }
  },

  async clearCart(): Promise<{ success: boolean; message: string }> {
    try {
      await AsyncStorage.removeItem(GUEST_CART_KEY);

      return {
        success: true,
        message: 'კალათა გაიწმინდა',
      };
    } catch (error) {
      console.error('Clear cart error:', error);
      throw new Error('კალათის გაწმენდა ვერ მოხერხდა');
    }
  },
};
