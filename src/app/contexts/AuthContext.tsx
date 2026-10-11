/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocalDB, User } from '../utils/localStorageDB';

// API_URL is kept for backwards compatibility in other files during transition, but it won't be used.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('fruitSession');
  }, []);

  // Check token on mount
  useEffect(() => {
    LocalDB.init();
    const sessionUser = localStorage.getItem('fruitSession');
    if (sessionUser && token) {
      if (token.startsWith('token_')) {
        // User has an old dummy token from LocalDB, force them to login again
        logout();
      } else {
        setUser(JSON.parse(sessionUser));
        
        // Ensure the full user object is saved for api.ts
        if (!localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(sessionUser), token }));
        }
      }
    } else {
      logout();
    }
    setLoading(false);
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('fruitSession', JSON.stringify(data.user));
        // Save the full user object including token for getAuthHeaders in api.ts
        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid email or password' };
    } catch {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('fruitSession', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        return { success: true };
      }
      return { success: false, error: data.error || 'Email already exists' };
    } catch {
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { API_URL };
