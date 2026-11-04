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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (email: string, password: string, passwordConfirmation: string) => {
    await getCsrfToken();
    const response = await api.post('/auth/register', {
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    setUser(response.data.user);
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
