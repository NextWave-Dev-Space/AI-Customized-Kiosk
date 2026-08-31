import axios from 'axios';
import { CreateOrderRequest, OrderResponse, MenuItem } from '@/types';

// 실제 키오스크 배포 시에는 프론트엔드/백엔드/AI서버가 한 기기 안에서 동작하므로
// localhost 기본값이 그대로 맞다. 개발 중 다른 기기(아이패드 등)에서 테스트할 때만
// .env.local에 이 값들을 PC의 로컬 네트워크 IP로 덮어써서 사용한다.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL ?? 'http://localhost:5000';

export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(`${API_BASE_URL}/orders`, orderData);
  return response.data;
};

export const getOrderDetails = async (orderId: number): Promise<OrderResponse> => {
  const response = await axios.get<OrderResponse>(`${API_BASE_URL}/orders/${orderId}`);
  return response.data;
};

export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export const confirmPayment = async (data: ConfirmPaymentRequest): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(`${API_BASE_URL}/payments/confirm`, data);
  return response.data;
};

export const getMenuItems = async (category?: string): Promise<MenuItem[]> => {
  const url = category
    ? `${API_BASE_URL}/menus?category=${category}`
    : `${API_BASE_URL}/menus`;
  const response = await axios.get<MenuItem[]>(url);
  return response.data;
};

export const predictAge = async (
  base64Image: string
): Promise<{ predicted_age: number; interface: string; confidence: number }> => {
  const response = await axios.post(`${AI_BASE_URL}/predict-age`, { image: base64Image });
  return response.data;
};
