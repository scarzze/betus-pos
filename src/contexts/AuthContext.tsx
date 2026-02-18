import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'hydancheru@gmail.com',
    password: 'DanHacks@2030',
    user: { id: '1', name: 'Dan Cheru', email: 'hydancheru@gmail.com', role: 'SUPER_ADMIN' },
  },
  {
    email: 'admin@vinlex.co.ke',
    password: 'admin123',
    user: { id: '2', name: 'Jane Wanjiku', email: 'admin@vinlex.co.ke', role: 'ADMIN' },
  },
  {
    email: 'sales@vinlex.co.ke',
    password: 'sales123',
    user: { id: '3', name: 'Kevin Ochieng', email: 'sales@vinlex.co.ke', role: 'SALES' },
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found.user);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
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
