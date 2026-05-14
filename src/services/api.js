import axios from 'axios';

const API_BASE_URL = 'http://localhost/ProGst/backend/public/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const login = (credentials) => api.post('/login', credentials);
export const register = (userData) => api.post('/register', userData);
export const logout = () => api.post('/logout');
export const getMe = () => api.get('/me');
export const updateProfile = (data) => api.put('/profile', data);
export const getSubscriptionPlans = () => api.get('/subscription-plans');
export const subscribe = (plan_id) => api.post('/subscribe', { plan_id });
export const syncData = () => api.post('/sync');
export const getAppSettings = () => api.get('/app-settings');
export const updateAppSettings = (data) => api.put('/app-settings', data);
export const getFAQs = () => api.get('/faqs');
export const getSupportContact = () => api.get('/support-contact');

// Data services
export const getDashboardData = () => api.get('/dashboard');
export const getInvoices = () => api.get('/invoices');
export const getNextInvoiceNumber = () => api.get('/invoices/next-number');
export const getProducts = () => api.get('/products');
export const getExpenses = () => api.get('/expenses');
export const getCustomers = () => api.get('/customers');
export const createInvoice = (data) => api.post('/invoices', data);
export const getReportsData = () => api.get('/reports');
export const getBusinessProfile = () => api.get('/business-profile');
export const updateBusinessProfile = (data) => api.put('/business-profile', data);

export default api;
