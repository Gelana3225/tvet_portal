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
    // Don't redirect on public routes
    const isPublicRoute = window.location.pathname === '/login' 
      || window.location.pathname === '/register' 
      || window.location.pathname === '/';
    
    if (error.response?.status === 401 && !isPublicRoute) {
      // Unauthorized - redirect to login only if not on public page
      window.location.href = '/login';
    }
    
    if (error.response?.status === 419) {
      // CSRF token mismatch - refresh and retry
      console.error('CSRF token mismatch');
    }

    return Promise.reject(error);
  }
);

// Get CSRF cookie before making requests
export const getCsrfToken = async () => {
  try {
    console.log('Getting CSRF token from:', 'http://localhost:8000/sanctum/csrf-cookie');
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    console.log('CSRF token obtained successfully');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
};

export default api;
