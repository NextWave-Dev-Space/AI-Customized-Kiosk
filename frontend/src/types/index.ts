export interface MenuItem {
  id?: number;
  name: string;
  nameEn?: string;
  price: number;
  category?: string;
  imgPath?: string;
  img?: string;
  description: string;
  isBest?: boolean;
  best?: boolean;
  option?: string;
}

export interface OrderItem {
  name: string;
  option?: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  userType: 'general' | 'elderly' | 'children';
  dineOption: 'dine_in' | 'take_out';
  paymentMethod: 'card' | 'pay';
  items: OrderItem[];
  discountAmount?: number;
}

export interface OrderResponse {
  id: number;
  userType: string;
  dineOption: string;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  status: string;
  orderedAt: string;
  items: OrderItem[];
}

export type AgeInterface = 'general' | 'elderly' | 'children';

export interface AgeDetectionResult {
  predicted_age: number;
  interface: AgeInterface;
}
