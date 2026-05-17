import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard', { replace: true });
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow-sm rounded-xl border border-line sm:px-10">
          <RegisterForm onSuccess={handleSuccess} />
        </div>

        <div className="mt-5 sm:mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F8FAFC] text-slate">
                Join thousands of users on Referro
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

export default Register;
