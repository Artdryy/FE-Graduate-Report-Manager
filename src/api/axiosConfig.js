import axios from 'axios';

// API principal para solicitudes JSON
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API especial para solicitudes PDF y multipart/form-data
const apiClientPdf = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

//  token interceptor para ambos clientes
const addTokenInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

addTokenInterceptor(apiClient);
addTokenInterceptor(apiClientPdf);

export { apiClient as default, apiClientPdf };