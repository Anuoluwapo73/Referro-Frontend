import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { escrowApi } from '../../api/escrow.api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { Escrow } from '../../types';

/**
 * EscrowHistoryPage — displays all escrow transactions for the current user.
 * Requirements: 9.5
 */
export default function EscrowHistoryPage() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery<Escrow[]>({
    queryKey: ['escrow-history'],
    queryFn: async () => {
      const res = await escrowApi.getEscrowHistory() as any;
      const raw = res?.data ?? res;
      return Array.isArray(raw) ? raw : [];
    },
  });

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">Failed to load escrow history.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const records = data ?? [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escrow History</h1>
          <p className="text-gray-500 mt-1">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">No escrow transactions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Released
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((escrow) => (
                <tr
                  key={escrow.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/jobs/${escrow.jobId}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${escrow.jobId}`)}
                  aria-label={`View job ${escrow.jobId}`}
                >
                  <td className="px-4 py-3 text-sm text-primary-600 font-medium truncate max-w-[140px]">
                    {escrow.jobId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatAmount(escrow.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-700 font-medium text-right">
                    {formatAmount(escrow.releasedAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatAmount(escrow.escrowBalance)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EscrowStatusBadge status={escrow.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(escrow.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE: { label: 'Active', classes: 'bg-blue-100 text-blue-700' },
  RELEASED: { label: 'Released', classes: 'bg-green-100 text-green-700' },
  DISPUTED: { label: 'Disputed', classes: 'bg-yellow-100 text-yellow-700' },
  PENDING: { label: 'Pending', classes: 'bg-gray-100 text-gray-700' },
};

const EscrowStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

// React import needed for JSX in the helper component
import React from 'react';
