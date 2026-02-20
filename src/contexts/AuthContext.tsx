import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SALES';
  org?: string;
  branch?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const parseRole = (role: string) => {
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN': return 'SUPER_ADMIN';
    case 'ADMIN': return 'ADMIN';
    case 'SALES': return 'SALES';
    default: return 'SALES';
  }
};

// Lightweight JWT decode
const decodeJwt = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload: any = decodeJwt(token);
      if (payload) {
        setUser({
          id: payload.sub,
          role: parseRole(payload.role),
          org: payload.org,
          branch: payload.branch,
          email: payload.email || '',
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.access_token;
      localStorage.setItem('access_token', token);
      const payload: any = decodeJwt(token);
      if (payload) {
        setUser({
          id: payload.sub,
          role: parseRole(payload.role),
          org: payload.org,
          branch: payload.branch,
          email,
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
