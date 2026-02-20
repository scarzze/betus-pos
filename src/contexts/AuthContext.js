import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
const AuthContext = createContext(undefined);
const mapRole = (dbRole) => {
    switch (dbRole) {
        case 'super_admin': return 'SUPER_ADMIN';
        case 'admin': return 'ADMIN';
        case 'sales': return 'SALES';
        default: return 'SALES';
    }
};
const buildUser = async (supaUser) => {
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
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const appUser = await buildUser(session.user);
                setUser(appUser);
            }
            else {
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
    const login = useCallback(async (email, password) => {
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
    return (_jsx(AuthContext.Provider, { value: { user, isAuthenticated: !!user, isLoading, login, logout }, children: children }));
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
