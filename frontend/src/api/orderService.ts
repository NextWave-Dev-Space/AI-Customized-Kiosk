import axios from 'axios';
import { CreateOrderRequest, OrderResponse, MenuItem } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';
const AI_BASE_URL = 'http://localhost:5000';

export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  const response = await axios.post<OrderResponse>(`${API_BASE_URL}/orders`, orderData);
  return response.data;
};

export const getOrderDetails = async (orderId: number): Promise<OrderResponse> => {
  const response = await axios.get<OrderResponse>(`${API_BASE_URL}/orders/${orderId}`);
  return response.data;
};

export const getMenuItems = async (category?: string): Promise<MenuItem[]> => {
  const url = category
    ? `${API_BASE_URL}/menus?category=${category}`
    : `${API_BASE_URL}/menus`;
  const response = await axios.get<MenuItem[]>(url);
  return response.data;
};

export const predictAge = async (base64Image: string): Promise<{ predicted_age: number; interface: string }> => {
  const response = await axios.post(`${AI_BASE_URL}/predict-age`, { image: base64Image });
  return response.data;
};
