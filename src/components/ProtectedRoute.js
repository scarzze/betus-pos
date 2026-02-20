import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center gradient-dark", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
