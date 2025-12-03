import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set auth token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Remove auth token
  removeToken: () => {
    localStorage.removeItem('token');
  },
};

export default authService;