export interface Product {
  id: string;
  name: string;
  name_ka: string;
  description: string;
  description_ka: string;
  price: number;
  image_url: string;
  category: string;
  category_ka: string;
  is_recommended: boolean;
  is_popular: boolean;
  in_stock: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  deliveryMethod: string;
  estimatedDeliveryDate: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  recipientName: string;
  recipientPhone: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  bogOrderId?: string;
  externalOrderId?: string;
  paymentDetails?: any;
  deliveryAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  smsNotificationSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Favorite {
  id: number;
  userId: number;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
  createdAt: string;
  updatedAt: string;
}
