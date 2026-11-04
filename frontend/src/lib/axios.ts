import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (token) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear any auth state and redirect to login
      window.location.href = '/login';
    }
    
    if (error.response?.status === 419) {
      // CSRF token mismatch - refresh and retry
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

// Get CSRF cookie before making requests
export const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

export default api;
