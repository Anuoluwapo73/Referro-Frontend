import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || getDashboardRoute(user.userType);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const getDashboardRoute = (userType: string): string => {
    switch (userType) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ARTISAN':
      case 'CUSTOMER':
      case 'REFERRER':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const handleSuccess = () => {
    const from = (location.state as any)?.from?.pathname || getDashboardRoute(user?.userType || 'CUSTOMER');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">Referro</span>
            <span className="w-2 h-2 rounded-full bg-primary-600 mb-1 flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-display font-bold text-ink">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow-sm rounded-xl border border-line sm:px-10">
          <LoginForm onSuccess={handleSuccess} />
        </div>

        <div className="mt-5 sm:mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F8FAFC] text-slate">
                Sign in with your email and password
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-slate hover:text-ink transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
