import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(undefined);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const parseRole = (role) => {
    switch (role.toUpperCase()) {
        case 'SUPER_ADMIN': return 'SUPER_ADMIN';
        case 'ADMIN': return 'ADMIN';
        case 'SALES': return 'SALES';
        default: return 'SALES';
    }
};
// Decode JWT (lightweight, no validation, just payload)
const decodeJwt = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    }
    catch {
        return null;
    }
};
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
                    email: payload.email || '', // optional if backend includes email
                });
            }
        }
        setIsLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
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
        }
        catch (err) {
            console.error(err);
            setIsLoading(false);
            return false;
        }
    }, []);
    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
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
