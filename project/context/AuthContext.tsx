import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { router } from 'expo-router';

import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

const API_URL = "http://172.20.10.3:8000";

type User = {
  username: string;
  email: string;
  is_admin: boolean;
  is_driver: boolean;
  expo_token?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token and user from SecureStore
    (async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Get Expo push token
      let expoToken = null;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        expoToken = tokenData.data;
      }
      // Login to backend
      const res = await axios.post(`${API_URL}/token`, new URLSearchParams({
        username: email,
        password
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const jwt = res.data.access_token;
      setToken(jwt);
      await SecureStore.setItemAsync('token', jwt);
      // Get user profile
      const userRes = await axios.get(`${API_URL}/users/${email}`, { headers: { Authorization: `Bearer ${jwt}` } });
      const userObj = userRes.data;
      setUser(userObj);
      await SecureStore.setItemAsync('user', JSON.stringify(userObj));
      // Update Expo token if available
      if (expoToken) {
        await axios.patch(`${API_URL}/users/${email}`, { expo_token: expoToken }, { headers: { Authorization: `Bearer ${jwt}` } });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Get Expo push token
      let expoToken = null;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        expoToken = tokenData.data;
      }
      // Register to backend
      const res = await axios.post(`${API_URL}/register`, {
        username: email,
        password,
        email,
        expo_token: expoToken
      });
      // Auto-login after register
      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};