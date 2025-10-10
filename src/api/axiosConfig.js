import axios from 'axios';

// Regular API client for JSON requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Special API client for PDF and multipart/form-data requests
const apiClientPdf = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Add token interceptor to both clients
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

// Apply interceptors to both clients
addTokenInterceptor(apiClient);
addTokenInterceptor(apiClientPdf);

export { apiClient as default, apiClientPdf };