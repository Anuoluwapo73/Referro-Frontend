import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute component that guards routes requiring admin privileges.
 * Redirects non-admin users to their dashboard and unauthenticated users to login.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Dev bypass: set VITE_DEV_BYPASS_AUTH=true in .env.local to skip auth checks
  if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.userType !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
