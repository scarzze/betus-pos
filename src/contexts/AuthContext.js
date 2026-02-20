import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
// ------------------------------
// Constants
// ------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const AuthContext = createContext(undefined);
// ------------------------------
// Helper Functions
// ------------------------------
const parseRole = (role) => {
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
const decodeJwt = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    }
    catch {
        return null;
    }
};
// ------------------------------
// AuthProvider
// ------------------------------
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            const token = res.data.access_token;
            if (!token)
                throw new Error('No access token returned');
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
        }
        catch (err) {
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
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
        }, children: children }));
};
// ------------------------------
// Hook
// ------------------------------
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
