import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getCsrfToken } from '../lib/axios';

export interface User {
  id: number;
  email: string;
  name?: string;
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
  // Synchronously initialize user from localStorage to eliminate any redirect flicker or race condition
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem('auth_token');
    const hasUser = !!localStorage.getItem('auth_user');
    // If we have saved credentials, we are immediately ready (not blocking routes)
    return hasToken && !hasUser;
  });

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token && !user) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/user');
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      console.warn('Auth check failed:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (email: string, password: string, passwordConfirmation: string) => {
    try {
      // Opportunistic CSRF fetch (non-blocking)
      getCsrfToken().catch(() => {});

      const response = await api.post('/auth/register', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      const currentUser = response.data?.user || response.data;
      if (currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        setUser(currentUser);
      }

      setLoading(false);
      return currentUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Opportunistic CSRF fetch (non-blocking)
      getCsrfToken().catch(() => {});

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      const currentUser = response.data?.user || response.data;
      if (currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        setUser(currentUser);
      }

      setLoading(false);
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
      localStorage.removeItem('auth_user');
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
