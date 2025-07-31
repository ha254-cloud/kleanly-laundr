import React, { createContext, useContext, useState, ReactNode } from 'react';

import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = "http://172.20.10.3:8000";

export interface Order {
  id: string;
  user_id: string;
  status: string;
  driver_id?: string;
  createdAt?: string;
  // Add other fields as needed
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: Partial<Order>) => Promise<string>;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const createOrder = async (orderData: Partial<Order>) => {
    if (!user || !token) throw new Error('User not authenticated');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/orders/`, {
        ...orderData,
        user_id: user.username,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
<<<<<<< HEAD
      const orderId = res.data.order_id;
      // Optionally fetch orders again
      await refreshOrders();
      return orderId;
=======
      
      // Add the new order to the local state
      const newOrder: Order = {
        id: orderId,
        ...orderData,
        userID: user.uid,
        createdAt: new Date().toISOString(),
      };
      
      setOrders(prev => [newOrder, ...prev]);
      
      // Send order created notification
      try {
        await import('../services/notificationService').then(({ notificationService }) => {
          notificationService.sendLocalNotification({
            orderId,
            type: 'order_assigned',
            title: 'Order Created Successfully! 🎉',
            body: `Your ${orderData.category.replace('-', ' ')} order has been placed and is being processed.`,
          });
        });
      } catch (notificationError) {
        console.log('Notification service not available:', notificationError);
      }
      
      return orderId; // Return the order ID
>>>>>>> 25cf15df486901cc88cd31a4462ceb622ce067eb
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      // Fetch all orders for this user (assuming backend supports filtering by user_id)
      const res = await axios.get(`${API_URL}/orders/user/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!token) throw new Error('Not authenticated');
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const value = {
    orders,
    loading,
    createOrder,
    refreshOrders,
    updateOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};