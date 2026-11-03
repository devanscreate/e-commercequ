export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category_id: number | null;
  category_name?: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  weight_gram: number;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShippingZone {
  id: number;
  city_name: string;
  courier_name: string;
  cost_per_kg: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface Order {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_whatsapp: string;
  shipping_address: string;
  courier_info: string;
  shipping_cost: number;
  total_amount: number;
  status: OrderStatus;
  tracking_number: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TrackingCheckpoint {
  id: number;
  order_id: number;
  location_name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export type MessageSender = 'BUYER' | 'SELLER';

export interface ChatMessage {
  id: number;
  order_id: number;
  sender: MessageSender;
  message: string;
  created_at: string;
}


