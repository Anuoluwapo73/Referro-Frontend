import React, { ReactNode } from 'react';
import Spinner from './Spinner';
import { CardListSkeleton } from './Skeleton';

interface AsyncBoundaryProps {
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error object or message string, if any */
  error?: Error | string | null;
  /** Content to render when not loading and no error */
  children: ReactNode;
  /** Custom loading UI; defaults to a spinner */
  loadingFallback?: ReactNode;
  /** Custom error UI; defaults to an inline error message */
  errorFallback?: ReactNode;
  /** Called when the user clicks "Try again" */
  onRetry?: () => void;
  /** Use skeleton cards instead of spinner for loading state */
  useSkeleton?: boolean;
  /** Number of skeleton cards to show */
  skeletonCount?: number;
}

/**
 * Wraps async data sections to handle loading and error states declaratively.
 *
 * Usage:
 * ```tsx
 * <AsyncBoundary isLoading={isLoading} error={error} onRetry={refetch}>
 *   <MyContent data={data} />
 * </AsyncBoundary>
 * ```
 */
const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  isLoading,
  error,
  children,
  loadingFallback,
  errorFallback,
  onRetry,
  useSkeleton = false,
  skeletonCount = 3,
}) => {
  if (isLoading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    if (useSkeleton) return <CardListSkeleton count={skeletonCount} />;
    return (
      <div className="flex justify-center items-center py-12" role="status" aria-label="Loading">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    if (errorFallback) return <>{errorFallback}</>;

    const message =
      typeof error === 'string' ? error : error.message || 'Something went wrong.';

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <svg
          className="h-10 w-10 text-red-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <p className="text-gray-700 font-medium mb-1">Failed to load</p>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default AsyncBoundary;
