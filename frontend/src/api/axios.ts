import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  // Skip adding token for auth endpoints (login, register)
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

export default api;