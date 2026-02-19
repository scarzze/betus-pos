import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

const mapRole = (dbRole: string): UserRole => {
  switch (dbRole) {
    case 'super_admin': return 'SUPER_ADMIN';
    case 'admin': return 'ADMIN';
    case 'sales': return 'SALES';
    default: return 'SALES';
  }
};

const buildUser = async (supaUser: SupabaseUser): Promise<User | null> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, avatar_url')
    .eq('user_id', supaUser.id)
    .single();

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supaUser.id);

  const topRole = roles && roles.length > 0
    ? roles.some(r => r.role === 'super_admin') ? 'super_admin'
      : roles.some(r => r.role === 'admin') ? 'admin' : 'sales'
    : 'sales';

  return {
    id: supaUser.id,
    name: profile?.name || supaUser.email?.split('@')[0] || 'User',
    email: profile?.email || supaUser.email || '',
    role: mapRole(topRole),
    avatar: profile?.avatar_url || undefined,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser = await buildUser(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await buildUser(session.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return false;
    }
    // onAuthStateChange will handle setting the user
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
