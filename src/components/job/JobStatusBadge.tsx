import React from 'react';
import { JobStatus } from '../../types';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

// Each status has a color, a text label, AND a non-color symbol indicator
// to satisfy Requirement 22.4 (color must not be the sole conveyor of information)
const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string; symbol: string }> = {
  POSTED: {
    label: 'Posted',
    classes: 'bg-blue-100 text-blue-800',
    symbol: '○',
  },
  ASSIGNED: {
    label: 'Assigned',
    classes: 'bg-yellow-100 text-yellow-800',
    symbol: '◑',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-orange-100 text-orange-800',
    symbol: '◕',
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-800',
    symbol: '✓',
  },
  DISPUTED: {
    label: 'Disputed',
    classes: 'bg-red-100 text-red-800',
    symbol: '!',
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-gray-100 text-gray-600',
    symbol: '✕',
  },
};

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600', symbol: '?' };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
      aria-label={`Job status: ${config.label}`}
    >
      {/* Non-color indicator symbol — satisfies Requirement 22.4 */}
      <span aria-hidden="true" className="font-bold leading-none">{config.symbol}</span>
      {config.label}
    </span>
  );
};

export default JobStatusBadge;
