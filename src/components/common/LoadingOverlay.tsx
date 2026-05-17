import React from 'react';
import Spinner from './Spinner';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Optional message shown below the spinner */
  message?: string;
  /** When true, covers only the nearest positioned ancestor instead of the full screen */
  contained?: boolean;
}

/**
 * Semi-transparent overlay with a spinner for blocking async operations.
 * Use `contained` for section-level loading, default for full-screen.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  contained = false,
}) => {
  if (!isLoading) return null;

  const positionClass = contained ? 'absolute' : 'fixed';

  return (
    <div
      role="status"
      aria-label={message}
      aria-live="polite"
      className={`${positionClass} inset-0 z-40 flex flex-col items-center justify-center bg-white bg-opacity-75`}
    >
      <Spinner size="lg" color="primary" />
      {message && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingOverlay;
