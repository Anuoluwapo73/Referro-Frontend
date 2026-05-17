import React from 'react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * FormError component for displaying validation errors
 * Can be used for field-specific errors or general form errors
 */
const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg bg-red-50 border border-red-200 p-3 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-red-800">{message}</p>
      </div>
    </div>
  );
};

export default FormError;
