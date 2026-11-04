import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getCsrfToken } from '../lib/axios';

export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, passwordConfirmation: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthContext state - user:', user, 'loading:', loading);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const response = await api.get('/auth/user');
      console.log('Auth check successful:', response.data);
      setUser(response.data.user);
    } catch (error: any) {
      console.log('Auth check failed (user not logged in)');
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasToken = !!localStorage.getItem('auth_token');
    const isPublicRoute =
      window.location.pathname === '/login' ||
      window.location.pathname === '/register' ||
      window.location.pathname === '/';

    if (isPublicRoute && !hasToken) {
      setLoading(false);
      setUser(null);
    } else {
      checkAuth();
    }
  }, []);

  const register = async (email: string, password: string, passwordConfirmation: string) => {
    try {
      console.log('Starting registration process...');
      console.log('Email:', email);
      
      await getCsrfToken();
      console.log('CSRF token obtained, sending registration request...');
      
      const response = await api.post('/auth/register', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      console.log('Registration response:', response.data);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      const currentUser = response.data?.user || response.data;
      setUser(currentUser);
      setLoading(false);
      
      return currentUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      console.log('Email:', email);
      
      await getCsrfToken();
      console.log('CSRF token obtained, sending login request...');
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      const currentUser = response.data?.user || response.data;
      console.log('Setting user state to:', currentUser);
      setUser(currentUser);
      setLoading(false);
      console.log('User state set, returning user data');
      
      return currentUser;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
