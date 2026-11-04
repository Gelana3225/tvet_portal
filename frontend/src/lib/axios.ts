import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const backendRoot = apiBase.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding Authorization and CSRF tokens
api.interceptors.request.use(
  async (config) => {
    // Attach Bearer token from localStorage if present
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Get CSRF token from cookie if present
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
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
    const csrfUrl = `${backendRoot}/sanctum/csrf-cookie`;
    console.log('Getting CSRF token from:', csrfUrl);
    await axios.get(csrfUrl, {
      withCredentials: true,
    });
    console.log('CSRF token obtained successfully');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
};

export default api;
