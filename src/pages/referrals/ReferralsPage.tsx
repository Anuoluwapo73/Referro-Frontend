import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { userApi } from '../../api/user.api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatting';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalCommission: number;
}

interface ReferralRecord {
  id: string;
  artisanId: string;
  artisanName?: string;
  jobsCompleted: number;
  commissionPaid: number;
  createdAt: string;
}

/**
 * ReferralsPage — displays referral statistics, referral code with copy-to-clipboard,
 * individual referral records, and commission earnings.
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5
 */
export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<{ stats: ReferralStats; referrals?: ReferralRecord[] }>({
    queryKey: ['referrals'],
    queryFn: async () => {
      const res = await userApi.getReferrals() as any;
      return res?.data ?? res;
    },
  });

  const stats = data?.stats;
  const referrals: ReferralRecord[] = data?.referrals ?? [];

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">Failed to load referral information.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-500 mt-1">Track your referrals and commission earnings</p>
      </div>

      {/* Referral code card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-md">
        <p className="text-sm font-medium text-primary-100">Your Referral Code</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-3xl font-bold tracking-widest">{stats.referralCode}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            aria-label="Copy referral code to clipboard"
            className="border-white text-white hover:bg-white hover:text-primary-700 focus:ring-white"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-sm text-primary-200 mt-2">
          Share this code with artisans to earn 5% commission on their first 3 jobs
        </p>
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Referrals"
          value={stats.totalReferrals.toString()}
          icon="👥"
          colorClass="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Successful Referrals"
          value={stats.successfulReferrals.toString()}
          icon="✅"
          colorClass="bg-green-50 text-green-700"
        />
        <StatCard
          label="Total Commission"
          value={formatCurrency(stats.totalCommission)}
          icon="💰"
          colorClass="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Referral records */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral Records</h2>

        {referrals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-lg">No referrals yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Share your referral code to start earning commissions.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artisan
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jobs Completed
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Earned
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referrals.map((referral) => (
                    <ReferralRow key={referral.id} referral={referral} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
  <div className={`rounded-xl p-5 ${colorClass} bg-opacity-10`}>
    <div className="flex items-center gap-2 mb-1">
      <span aria-hidden="true" className="text-xl">{icon}</span>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

interface ReferralRowProps {
  referral: ReferralRecord;
}

const ReferralRow: React.FC<ReferralRowProps> = ({ referral }) => {
  const isActive = referral.jobsCompleted < 3;
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">
        {referral.artisanName ?? `Artisan #${referral.artisanId.slice(0, 8)}`}
      </td>
      <td className="px-4 py-3 text-sm text-center text-gray-700">
        {referral.jobsCompleted} / 3
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-right text-purple-700">
        {formatCurrency(referral.commissionPaid)}
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isActive ? 'Active' : 'Completed'}
        </span>
      </td>
    </tr>
  );
};
