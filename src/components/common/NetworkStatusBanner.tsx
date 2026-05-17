import React from 'react';
import useNetworkStatus from '../../hooks/useNetworkStatus';

/**
 * Displays a persistent banner when the user is offline.
 * Automatically hides when connectivity is restored.
 */
const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 px-4 text-sm font-medium"
    >
      <span className="inline-flex items-center gap-2">
        <svg
          className="h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 010-7.072M5.636 18.364a9 9 0 010-12.728"
          />
        </svg>
        No internet connection. Please check your network.
      </span>
    </div>
  );
};

export default NetworkStatusBanner;
