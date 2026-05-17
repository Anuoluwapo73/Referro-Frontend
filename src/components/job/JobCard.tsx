import React from 'react';
import { Job, UserType } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import JobStatusBadge from './JobStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface JobCardProps {
  job: Job;
  userType: UserType;
  onClick?: (job: Job) => void;
  onAssign?: (job: Job) => void;
  onStart?: (job: Job) => void;
  onComplete?: (job: Job) => void;
  onCancel?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  userType,
  onClick,
  onAssign,
  onStart,
  onComplete,
  onCancel,
}) => {
  const handleCardClick = () => onClick?.(job);

  const stopPropagation = (e: React.MouseEvent, handler?: (job: Job) => void) => {
    e.stopPropagation();
    handler?.(job);
  };

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (userType === 'CUSTOMER') {
      if (job.status === 'POSTED' && onAssign) {
        actions.push(
          <Button key="assign" size="sm" onClick={(e) => stopPropagation(e, onAssign)}>
            Assign Artisan
          </Button>
        );
      }
      if (['POSTED', 'ASSIGNED'].includes(job.status) && onCancel) {
        actions.push(
          <Button key="cancel" size="sm" variant="outline" onClick={(e) => stopPropagation(e, onCancel)}>
            Cancel
          </Button>
        );
      }
    }

    if (userType === 'ARTISAN') {
      if (job.status === 'ASSIGNED' && onStart) {
        actions.push(
          <Button key="start" size="sm" onClick={(e) => stopPropagation(e, onStart)}>
            Start Job
          </Button>
        );
      }
      if (job.status === 'IN_PROGRESS' && onComplete) {
        actions.push(
          <Button key="complete" size="sm" onClick={(e) => stopPropagation(e, onComplete)}>
            Complete
          </Button>
        );
      }
    }

    return actions;
  };

  const actions = renderActions();

  return (
    <Card
      hover={!!onClick}
      className={onClick ? 'cursor-pointer' : ''}
      padding="md"
    >
      <div
        onClick={handleCardClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined}
        aria-label={onClick ? `View details for job: ${job.title}` : undefined}
        className={onClick ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded' : ''}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-ink line-clamp-1">{job.title}</h3>
          <JobStatusBadge status={job.status} />
        </div>

        <p className="text-sm text-slate mb-3 capitalize">{job.trade}</p>

        {job.description && (
          <p className="text-sm text-slate mb-3 line-clamp-2">{job.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate mb-3">
          {job.budget != null && (
            <span>Budget: <span className="font-medium text-ink">{formatCurrency(job.budget)}</span></span>
          )}
          {job.location?.city && (
            <span>📍 {job.location.city}{job.location.state ? `, ${job.location.state}` : ''}</span>
          )}
          {job.scheduledDate && (
            <span>📅 {formatDate(job.scheduledDate)}</span>
          )}
        </div>

        {userType === 'CUSTOMER' && job.artisan && (
          <p className="text-sm text-slate">
            Artisan: <span className="font-medium text-ink">{job.artisan.fullName}</span>
          </p>
        )}
        {userType === 'ARTISAN' && job.customer && (
          <p className="text-sm text-slate">
            Customer: <span className="font-medium text-ink">{job.customer.fullName}</span>
          </p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-line">
          {actions}
        </div>
      )}
    </Card>
  );
};

// Memoised — prevents re-renders when parent re-renders but props haven't changed (Requirements: 23.5)
export default React.memo(JobCard);
