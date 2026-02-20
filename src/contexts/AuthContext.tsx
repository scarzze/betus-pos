import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  org?: string;
  branch?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const parseRole = (role: string): UserRole => {
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN': return 'SUPER_ADMIN';
    case 'ADMIN': return 'ADMIN';
    case 'SALES': return 'SALES';
    default: return 'SALES';
  }
};

// Decode JWT (lightweight, no validation, just payload)
const decodeJwt = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on init
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setUser({
          id: payload.sub,
          role: parseRole(payload.role),
          org: payload.org,
          branch: payload.branch,
          email: payload.email || '', // optional if backend includes email
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.access_token;
      localStorage.setItem('access_token', token);

      const payload = decodeJwt(token);
      if (payload) {
        setUser({
          id: payload.sub,
          role: parseRole(payload.role),
          org: payload.org,
          branch: payload.branch,
          email: email,
        });
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
