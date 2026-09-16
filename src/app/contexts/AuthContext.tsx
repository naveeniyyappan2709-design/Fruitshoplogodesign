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
      setUser(JSON.parse(sessionUser));
    } else {
      logout();
    }
    setLoading(false);
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    try {
      const users = LocalDB.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const dummyToken = `token_${Date.now()}`;
        
        // Remove password from session
        const { password: _, ...userWithoutPassword } = user;
        
        setToken(dummyToken);
        setUser(userWithoutPassword as User);
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('fruitSession', JSON.stringify(userWithoutPassword));
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const users = LocalDB.getUsers();
      
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email already exists' };
      }

      const newUser: User = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        role: 'customer'
      };

      users.push(newUser);
      LocalDB.saveUsers(users);

      const dummyToken = `token_${Date.now()}`;
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      setToken(dummyToken);
      setUser(userWithoutPassword as User);
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('fruitSession', JSON.stringify(userWithoutPassword));
      return { success: true };
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
