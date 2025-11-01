import { authService } from './auth';
import { Order } from '@/types';

const ORDERS_API_URL = 'https://gamoiwere.ge/api/mobile/orders';

export const ordersService = {

  async getAllOrders(): Promise<Order[]> {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log('📦 Fetching all orders');

      const response = await fetch(ORDERS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch orders:', data.message);
        throw new Error(data.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Orders loaded successfully:', data.total);

      return data.orders || [];
    } catch (error: any) {
      console.error('❌ Get orders error:', error);
      throw error;
    }
  },

  async getOrderById(id: number | string): Promise<Order> {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log(`📦 Fetching order ${id}`);

      const response = await fetch(`${ORDERS_API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch order:', data.message);
        throw new Error(data.message || 'შეკვეთის ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Order loaded successfully');

      return data.order;
    } catch (error: any) {
      console.error('❌ Get order error:', error);
      throw error;
    }
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log(`📦 Fetching order ${orderNumber}`);

      const response = await fetch(`${ORDERS_API_URL}/number/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch order:', data.message);
        throw new Error(data.message || 'შეკვეთის ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Order loaded successfully');

      return data.order;
    } catch (error: any) {
      console.error('❌ Get order error:', error);
      throw error;
    }
  },

  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('არ ხართ ავტორიზებული');

      console.log(`📦 Fetching orders with status: ${status}`);

      const response = await fetch(`${ORDERS_API_URL}/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch orders:', data.message);
        throw new Error(data.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      }

      console.log('✅ Orders loaded successfully:', data.total);

      return data.orders || [];
    } catch (error: any) {
      console.error('❌ Get orders error:', error);
      throw error;
    }
  },
};
