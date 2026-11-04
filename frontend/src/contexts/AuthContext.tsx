import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getCsrfToken } from '../lib/axios';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const response = await api.get('/auth/user');
      console.log('Auth check successful:', response.data);
      setUser(response.data.user);
    } catch (error: any) {
      // Silently fail - user is not authenticated
      console.log('Auth check failed (user not logged in)');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only check auth on protected routes
    const isPublicRoute = window.location.pathname === '/login' 
      || window.location.pathname === '/register' 
      || window.location.pathname === '/';
    
    console.log('Auth context initialized, current path:', window.location.pathname);
    console.log('Is public route:', isPublicRoute);
    
    if (isPublicRoute) {
      // Skip auth check on public routes
      console.log('Skipping auth check for public route');
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
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
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
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
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
