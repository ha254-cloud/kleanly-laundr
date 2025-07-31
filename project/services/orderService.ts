import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = "http://192.168.1.100:8000";

export interface Order {
  id?: string;
  user_id: string;
  category?: string;
  date?: string;
  address?: string;
  status: string;
  createdAt?: string;
  items?: string[];
  total?: number;
  pickupTime?: string;
  notes?: string;
  driver_id?: string;
}

export const orderService = {
  async createOrder(orderData: Partial<Order>): Promise<string> {
    const jwt = await SecureStore.getItemAsync('jwt');
    if (!jwt) throw new Error('Not authenticated');
    const res = await axios.post(`${API_URL}/orders/`, orderData, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    return res.data.order_id;
  },

  async getUserOrders(user_id: string): Promise<Order[]> {
    const jwt = await SecureStore.getItemAsync('jwt');
    if (!jwt) throw new Error('Not authenticated');
    const res = await axios.get(`${API_URL}/orders/user/${user_id}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    return res.data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const jwt = await SecureStore.getItemAsync('jwt');
    if (!jwt) throw new Error('Not authenticated');
    await axios.patch(`${API_URL}/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
  },
};