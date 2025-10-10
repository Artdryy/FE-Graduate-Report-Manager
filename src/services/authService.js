import apiClient from '../api/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
apiClient.defaults.baseURL = API_URL;

const login = async (user_name, password) => {
  const response = await apiClient.post('/users/login', {
    user_name,
    password,
  });
  
  if (response.data.data.accessToken) {
    const { accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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