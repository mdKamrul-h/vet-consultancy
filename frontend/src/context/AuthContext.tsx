'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { DEMO_TOKEN } from '@/lib/demo';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('pawpet_token');
    const storedUser = localStorage.getItem('pawpet_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('pawpet_token');
        localStorage.removeItem('pawpet_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token: newToken, user: newUser } = response.data.data || response.data;
    localStorage.setItem('pawpet_token', newToken || DEMO_TOKEN);
    localStorage.setItem('pawpet_user', JSON.stringify(newUser));
    setToken(newToken || DEMO_TOKEN);
    setUser(newUser);
  };

  const register = async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await authApi.register(data);
    const { token: newToken, user: newUser } = response.data.data || response.data;
    localStorage.setItem('pawpet_token', newToken || DEMO_TOKEN);
    localStorage.setItem('pawpet_user', JSON.stringify(newUser));
    setToken(newToken || DEMO_TOKEN);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('pawpet_token');
    localStorage.removeItem('pawpet_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('pawpet_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
