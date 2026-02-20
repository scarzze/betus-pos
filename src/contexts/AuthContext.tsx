import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';

// ------------------------------
// Types
// ------------------------------
interface User {
  id: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SALES';
  org?: string;
  branch?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ------------------------------
// Constants
// ------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ------------------------------
// Helper Functions
// ------------------------------
const parseRole = (role?: string): User['role'] => {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'SUPER_ADMIN';
    case 'ADMIN':
      return 'ADMIN';
    case 'SALES':
    default:
      return 'SALES';
  }
};

// Decode JWT payload (no signature verification)
const decodeJwt = (token: string): any | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ------------------------------
// AuthProvider
// ------------------------------
export const AuthProvider = ({ children }: AuthProviderProps) => {
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
          email: payload.email || '',
        });
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.access_token;
      if (!token) throw new Error('No access token returned');

      localStorage.setItem('access_token', token);

      const payload = decodeJwt(token);
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
      console.error('Login failed:', err);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------------
// Hook
// ------------------------------
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
