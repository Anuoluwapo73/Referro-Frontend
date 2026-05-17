import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  circle?: boolean;
}

/**
 * Base skeleton loader element with pulse animation
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const shapeClass = circle
    ? 'rounded-full'
    : rounded
    ? 'rounded-lg'
    : 'rounded';

  return (
    <div
      className={`animate-pulse bg-gray-200 ${shapeClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton for a card with title and description lines
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-white rounded-lg shadow p-4 space-y-3 ${className}`}
    role="status"
    aria-label="Loading content"
  >
    <Skeleton height="1.25rem" width="60%" />
    <Skeleton height="0.875rem" width="100%" />
    <Skeleton height="0.875rem" width="80%" />
    <div className="flex gap-2 pt-1">
      <Skeleton height="1.5rem" width="4rem" rounded />
      <Skeleton height="1.5rem" width="4rem" rounded />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * Skeleton for a list of cards
 */
export const CardListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for a user/artisan profile header
 */
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 ${className}`}
    role="status"
    aria-label="Loading profile"
  >
    <div className="flex items-center gap-4 mb-4">
      <Skeleton circle width="4rem" height="4rem" />
      <div className="flex-1 space-y-2">
        <Skeleton height="1.25rem" width="50%" />
        <Skeleton height="0.875rem" width="35%" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton height="0.875rem" width="100%" />
      <Skeleton height="0.875rem" width="90%" />
      <Skeleton height="0.875rem" width="75%" />
    </div>
    <span className="sr-only">Loading profile...</span>
  </div>
);

/**
 * Skeleton for a table row
 */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height="0.875rem" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton for a table
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => (
  <div
    className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
    role="status"
    aria-label="Loading table data"
  >
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <Skeleton height="0.875rem" width="70%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
    <span className="sr-only">Loading table data...</span>
  </div>
);

/**
 * Skeleton for a message bubble in chat
 */
export const MessageSkeleton: React.FC<{ align?: 'left' | 'right' }> = ({ align = 'left' }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`space-y-1 max-w-xs ${align === 'right' ? 'items-end' : 'items-start'} flex flex-col`}>
      <Skeleton height="2.5rem" width="12rem" rounded />
      <Skeleton height="0.75rem" width="4rem" />
    </div>
  </div>
);

/**
 * Skeleton for a stat card (dashboard)
 */
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    <Skeleton height="0.875rem" width="50%" className="mb-2" />
    <Skeleton height="2rem" width="40%" />
  </div>
);

export default Skeleton;
