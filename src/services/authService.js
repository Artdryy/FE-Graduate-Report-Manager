import axios from 'axios';
import apiClient from '../api/axiosConfig';

// Use import.meta.env for Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Set the baseURL directly on the instance just in case
apiClient.defaults.baseURL = API_URL;

const login = async (user_name, password) => {
  const response = await apiClient.post('/users/login', {
    user_name,
    password,
  });
  
  if (response.data.data.accessToken) {
    const { accessToken, refreshToken } = response.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete apiClient.defaults.headers.common['Authorization'];
};

const requestPasswordReset = async (email) => {
  return await apiClient.post('/users/request-password-reset', { email });
};

const resetPassword = async (email, code, newPassword) => {
  return await apiClient.post('/users/reset-password', {
    email,
    code,
    newPassword,
  });
};

export const authService = {
  login,
  logout,
  requestPasswordReset,
  resetPassword,
};