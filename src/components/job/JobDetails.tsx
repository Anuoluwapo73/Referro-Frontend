import React from 'react';
import { Job, UserType } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import JobStatusBadge from './JobStatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatting';

interface JobDetailsProps {
  job: Job;
  userType: UserType;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onLeaveReview?: () => void;
  isActionLoading?: boolean;
}

const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  userType,
  onStart,
  onComplete,
  onCancel,
  onLeaveReview,
  isActionLoading = false,
}) => {
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    if (userType === 'CUSTOMER') {
      if (job.status === 'IN_PROGRESS' && onComplete) {
        actions.push(
          <Button key="confirm" onClick={onComplete} isLoading={isActionLoading}>
            ✅ Confirm Job Complete
          </Button>
        );
        actions.push(
          <p key="confirm-note" className="text-xs text-gray-400 w-full">
            Only confirm when you are satisfied with the work. This releases payment to the artisan.
          </p>
        );
      }
      if (job.status === 'COMPLETED' && onLeaveReview) {
        actions.push(
          <Button key="review" variant="secondary" onClick={onLeaveReview}>
            Leave a Review
          </Button>
        );
      }
      if (['POSTED', 'ASSIGNED'].includes(job.status) && onCancel) {
        actions.push(
          <Button key="cancel" variant="outline" onClick={onCancel} isLoading={isActionLoading}>
            Cancel Job
          </Button>
        );
      }
    }

    if (userType === 'ARTISAN') {
      if (job.status === 'ASSIGNED' && onStart) {
        actions.push(
          <Button key="start" onClick={onStart} isLoading={isActionLoading}>
            Accept & Start Job
          </Button>
        );
      }
      if (job.status === 'IN_PROGRESS' && onComplete) {
        actions.push(
          <Button key="complete" variant="secondary" onClick={onComplete} isLoading={isActionLoading}>
            Mark Work as Done
          </Button>
        );
        actions.push(
          <p key="complete-note" className="text-xs text-gray-400 w-full">
            ℹ️ The customer will be notified to confirm completion before payment is released.
          </p>
        );
      }
    }

    return actions;
  };

  const actions = renderActions();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card padding="lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-display font-bold text-ink">{job.title}</h1>
            <p className="text-sm text-slate mt-1 capitalize">{job.trade}</p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>

        {job.description && (
          <p className="text-slate mb-4">{job.description}</p>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {job.budget != null && (
            <>
              <dt className="text-slate">Budget</dt>
              <dd className="font-medium text-ink">{formatCurrency(job.budget)}</dd>
            </>
          )}
          {job.quotedPrice != null && (
            <>
              <dt className="text-slate">Quoted Price</dt>
              <dd className="font-medium text-ink">{formatCurrency(job.quotedPrice)}</dd>
            </>
          )}
          {job.finalPrice != null && (
            <>
              <dt className="text-slate">Final Price</dt>
              <dd className="font-medium text-ink">{formatCurrency(job.finalPrice)}</dd>
            </>
          )}
          {job.scheduledDate && (
            <>
              <dt className="text-slate">Scheduled Date</dt>
              <dd className="font-medium text-ink">{formatDate(job.scheduledDate)}</dd>
            </>
          )}
          <dt className="text-slate">Payment Status</dt>
          <dd className="font-medium text-ink capitalize">{(job.paymentStatus ?? 'pending').toLowerCase()}</dd>
          <dt className="text-slate">Posted</dt>
          <dd className="font-medium text-ink">{formatDateTime(job.createdAt)}</dd>
        </dl>
      </Card>

      {/* Location */}
      {job.location && (
        <Card padding="md">
          <h2 className="text-sm font-semibold text-slate mb-2">Location</h2>
          <p className="text-ink">{job.location.address}</p>
          <p className="text-slate text-sm">
            {job.location.city}, {job.location.state}
          </p>
        </Card>
      )}

      {/* Customer info */}
      {job.customer && userType !== 'CUSTOMER' && (
        <Card padding="md">
          <h2 className="text-sm font-semibold text-slate mb-2">Customer</h2>
          <p className="font-medium text-ink">{job.customer.fullName}</p>
          {job.customer.phoneNumber && (
            <p className="text-sm text-slate">{job.customer.phoneNumber}</p>
          )}
        </Card>
      )}

      {/* Artisan info */}
      {job.artisan && (
        <Card padding="md">
          <h2 className="text-sm font-semibold text-slate mb-2">Artisan</h2>
          <p className="font-medium text-ink">{job.artisan.fullName}</p>
          {job.artisan.phoneNumber && (
            <p className="text-sm text-slate">{job.artisan.phoneNumber}</p>
          )}
        </Card>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default JobDetails;
