import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Define UserRole type inline
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center gradient-dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;
