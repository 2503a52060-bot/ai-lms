import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-lms-8spa.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Alias export so named imports like `import { api }` work
export const api = apiClient;

// Default export
export default apiClient;

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      sessionStorage.clear();
    }
    return Promise.reject(error);
  }
);