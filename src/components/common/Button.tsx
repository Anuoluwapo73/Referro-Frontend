import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600 shadow-blue',
    secondary: 'bg-ink text-white hover:bg-ink-2 focus-visible:ring-ink',
    outline:   'border-[1.5px] border-line text-ink hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-600',
    ghost:     'text-slate hover:text-ink hover:bg-primary-50 focus-visible:ring-primary-600',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px] rounded-[var(--radius-sm)]',
    md: 'px-4 py-2.5 text-sm min-h-[44px] rounded-[var(--radius-md)]',
    lg: 'px-6 py-3 text-base min-h-[52px] rounded-[var(--radius-lg)]',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
