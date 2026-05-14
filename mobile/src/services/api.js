import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DeviceEventEmitter, Platform } from 'react-native';

import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Connection': 'close',
  },
  xsrfCookieName: null,
  xsrfHeaderName: null,
});

// Add a response interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Don't re-trigger logout flow if the logout request itself fails with 401
      if (error.config && error.config.url && error.config.url.includes('/logout')) {
        return Promise.reject(error);
      }

      console.warn('Session expired or invalid. Clearing local storage...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      DeviceEventEmitter.emit('unauthorized');
      return Promise.reject(error); // Early return to avoid secondary error logs
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Please check if the server is running and accessible at:', API_BASE_URL);
    } else if (!error.response) {
      console.error('Network error. Error Details:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseUrl: error.config?.baseURL,
        request: !!error.request
      });
      if (error.request && __DEV__) {
        console.log('Request object keys:', Object.keys(error.request));
      }
    } else {
      // Don't log 404 for barcode searches as it's a valid business case
      const isBarcodeSearch = error.config?.url?.includes('/products/barcode/');
      if (error.response.status === 404 && isBarcodeSearch) {
        return Promise.reject(error);
      }
      console.error('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Interceptor to add token to mobile requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const login = (credentials) => api.post('/login', credentials);
export const register = (userData) => api.post('/register', userData);
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');
export const updateProfile = (data) => api.put('/profile', data);
export const getSubscriptionPlans = () => api.get('/subscription-plans');
export const subscribe = (planId) => api.post('/subscribe', { plan_id: planId });
export const syncData = () => api.post('/sync');
export const getAppSettings = () => api.get('/app-settings');
export const updateAppSettings = (data) => api.put('/app-settings', data);
export const getFAQs = () => api.get('/faqs');
export const getSupportContact = () => api.get('/support-contact');
export const askAI = (query) => api.post('/ai/query', { query });

// Data Services
export const getDashboardData = () => api.get('/dashboard');
export const getInvoices = () => api.get('/invoices');
export const getNextInvoiceNumber = () => api.get('/invoices/next-number');
export const getProducts = () => api.get('/products');
export const getProductByBarcode = (barcode) => api.get(`/products/barcode/${barcode}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getExpenses = () => api.get('/expenses');
export const getCustomers = () => api.get('/customers');
export const createInvoice = (data) => api.post('/invoices', data);
export const getReportsData = () => api.get('/reports');
export const getBusinessProfile = () => api.get('/business-profile');
export const updateBusinessProfile = (data) => api.put('/business-profile', data);

// Test connection
export const testConnection = () => api.get('/ping');

export default api;
