import React, { useState } from 'react';
import { escrowApi } from '../../api/escrow.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { Escrow } from '../../types';

interface EscrowStatusProps {
  jobId: string;
  /** Whether the current user is the customer (can raise disputes) */
  isCustomer?: boolean;
}

const EscrowStatus: React.FC<EscrowStatusProps> = ({ jobId, isCustomer = false }) => {
  const queryClient = useQueryClient();
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const {
    data: escrow,
    isLoading,
    error,
  } = useQuery<Escrow>({
    queryKey: ['escrow', jobId],
    queryFn: async () => {
      const res = await escrowApi.getEscrow(jobId);
      return (res as any)?.data ?? res;
    },
    enabled: !!jobId,
  });

  const disputeMutation = useMutation({
    mutationFn: (reason: string) => escrowApi.createDispute({ jobId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow', jobId] });
      setShowDisputeForm(false);
      setDisputeReason('');
    },
  });

  const formatAmount = (value: number | undefined | null) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value ?? 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
        Failed to load escrow information.
      </div>
    );
  }

  const hasDispute = escrow.status === 'DISPUTED';
  const isReleased = escrow.status === 'RELEASED' || escrow.escrowBalance === 0;
  const isPending = !isReleased && !hasDispute;

  const progressPercent =
    escrow.totalAmount > 0
      ? Math.round((escrow.releasedAmount / escrow.totalAmount) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Escrow</h3>
        <StatusBadge status={escrow.status} />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <AmountCard label="Total" value={formatAmount(escrow.totalAmount)} />
        <AmountCard label="Released" value={formatAmount(escrow.releasedAmount)} highlight />
        <AmountCard label="Balance" value={formatAmount(escrow.escrowBalance)} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Released</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dispute notice */}
      {hasDispute && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
          <svg className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">Dispute Active</p>
            <p className="text-xs text-yellow-700 mt-0.5">Fund release is suspended while the dispute is under review.</p>
          </div>
        </div>
      )}

      {/* Pending info — funds are locked, payment releases on job confirmation */}
      {isPending && isCustomer && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-6v2M5.05 5.05a7 7 0 109.9 9.9" />
          </svg>
          <p className="text-xs text-blue-700">
            Funds are locked securely. Payment is released automatically when you confirm the job is complete.
          </p>
        </div>
      )}
      {isPending && !isCustomer && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-6v2M5.05 5.05a7 7 0 109.9 9.9" />
          </svg>
          <p className="text-xs text-blue-700">
            Your payment is secured in escrow. Mark the work as done — the customer will confirm and release it to your wallet.
          </p>
        </div>
      )}

      {/* Dispute form toggle */}
      {isCustomer && !hasDispute && !isReleased && (
        <div>
          {!showDisputeForm ? (
            <button
              className="text-sm text-red-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
              onClick={() => setShowDisputeForm(true)}
            >
              Raise a dispute
            </button>
          ) : (
            <div className="space-y-2 border border-red-200 rounded-lg p-3 bg-red-50">
              <label htmlFor="dispute-reason" className="block text-sm font-medium text-red-800">
                Reason for dispute
              </label>
              <textarea
                id="dispute-reason"
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                placeholder="Describe the issue..."
              />
              {disputeMutation.isError && (
                <p className="text-sm text-red-600" role="alert">
                  {(disputeMutation.error as Error)?.message || 'Failed to raise dispute.'}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setShowDisputeForm(false); setDisputeReason(''); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  isLoading={disputeMutation.isPending}
                  disabled={!disputeReason.trim()}
                  onClick={() => disputeMutation.mutate(disputeReason)}
                >
                  Submit Dispute
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isReleased && (
        <p className="text-sm text-green-700 text-center font-medium">
          ✓ All funds have been released to the artisan.
        </p>
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const AmountCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div className={`rounded-lg p-2 ${highlight ? 'bg-green-50' : 'bg-gray-50'}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE: { label: 'Active', classes: 'bg-blue-100 text-blue-700' },
  RELEASED: { label: 'Released', classes: 'bg-green-100 text-green-700' },
  DISPUTED: { label: 'Disputed', classes: 'bg-yellow-100 text-yellow-700' },
  PENDING: { label: 'Pending', classes: 'bg-gray-100 text-gray-700' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default EscrowStatus;
