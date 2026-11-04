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
      const response = await api.get('/auth/user');
      setUser(response.data.user);
    } catch (error) {
      // Silently fail - user is not authenticated
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
    
    if (isPublicRoute) {
      // Skip auth check on public routes
      setLoading(false);
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
    await getCsrfToken();
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    setUser(response.data.user);
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
