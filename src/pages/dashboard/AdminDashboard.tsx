import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../api/admin.api';
import { useAuthStore } from '../../store/authStore';
import { User, UserType, Transaction, TransactionStatus, TransactionType } from '../../types';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatting';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlatformStats {
    totalUsers: number;
    totalArtisans: number;
    totalCustomers: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    totalRevenue: number;
    pendingVerifications: number;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
    <Card padding="md" shadow="sm">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </Card>
);

// ── User Type Badge ───────────────────────────────────────────────────────────

const USER_TYPE_CONFIG: Record<UserType, { label: string; classes: string }> = {
    CUSTOMER: { label: 'Customer', classes: 'bg-blue-100 text-blue-700' },
    ARTISAN: { label: 'Artisan', classes: 'bg-green-100 text-green-700' },
    REFERRER: { label: 'Referrer', classes: 'bg-purple-100 text-purple-700' },
    ADMIN: { label: 'Admin', classes: 'bg-red-100 text-red-700' },
};

const UserTypeBadge: React.FC<{ type: UserType }> = ({ type }) => {
    const config = USER_TYPE_CONFIG[type] ?? { label: type, classes: 'bg-gray-100 text-gray-700' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
            {config.label}
        </span>
    );
};

// ── Transaction Type Badge ────────────────────────────────────────────────────

const TX_TYPE_CONFIG: Record<TransactionType, { label: string; colorClass: string }> = {
    CREDIT: { label: 'Credit', colorClass: 'bg-green-100 text-green-700' },
    DEBIT: { label: 'Debit', colorClass: 'bg-red-100 text-red-700' },
    ESCROW_HOLD: { label: 'Escrow Hold', colorClass: 'bg-yellow-100 text-yellow-700' },
    ESCROW_RELEASE: { label: 'Escrow Release', colorClass: 'bg-blue-100 text-blue-700' },
    REFERRAL_COMMISSION: { label: 'Referral', colorClass: 'bg-purple-100 text-purple-700' },
    WITHDRAWAL: { label: 'Withdrawal', colorClass: 'bg-gray-100 text-gray-700' },
};

const TX_STATUS_CONFIG: Record<TransactionStatus, { label: string; classes: string }> = {
    PENDING: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700' },
    COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
    FAILED: { label: 'Failed', classes: 'bg-red-100 text-red-700' },
};

// ── Users Tab ─────────────────────────────────────────────────────────────────

interface UsersTabProps {
    userTypeFilter: string;
    onUserTypeFilterChange: (v: string) => void;
    verifiedFilter: string;
    onVerifiedFilterChange: (v: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
    userTypeFilter,
    onUserTypeFilterChange,
    verifiedFilter,
    onVerifiedFilterChange,
}) => {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery<{ users: User[]; total: number }>({
        queryKey: ['admin-users', userTypeFilter, verifiedFilter],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (userTypeFilter) params.userType = userTypeFilter;
            if (verifiedFilter !== '') params.isVerified = verifiedFilter;
            const res = await adminApi.getUsers(params) as any;
            const raw = res?.data ?? res;
            const users = Array.isArray(raw) ? raw : raw?.users ?? raw?.data ?? [];
            const total = raw?.total ?? users.length;
            return { users, total };
        },
    });

    const verifyMutation = useMutation({
        mutationFn: (userId: string) => adminApi.verifyUser(userId),
        onSuccess: () => {
            toast.success('User verified successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? 'Verification failed');
        },
    });

    const users = data?.users ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={userTypeFilter}
                    onChange={(e) => onUserTypeFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by user type"
                >
                    <option value="">All Types</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ARTISAN">Artisan</option>
                    <option value="REFERRER">Referrer</option>
                    <option value="ADMIN">Admin</option>
                </select>

                <select
                    value={verifiedFilter}
                    onChange={(e) => onVerifiedFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by verification status"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                </select>

                {total > 0 && (
                    <span className="self-center text-sm text-gray-500 ml-auto">
                        {total} user{total !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="md" />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-3">Failed to load users.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg">No users found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Phone
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Verified
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Joined
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                                {user.email && (
                                                    <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                                            {user.phoneNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <UserTypeBadge type={user.userType} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.isVerified ? (
                                                <span className="text-green-600 text-lg" aria-label="Verified">✓</span>
                                            ) : (
                                                <span className="text-gray-400 text-lg" aria-label="Not verified">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                                            {formatDateTime(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!user.isVerified && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    isLoading={verifyMutation.isPending && verifyMutation.variables === user.id}
                                                    disabled={verifyMutation.isPending}
                                                    onClick={() => verifyMutation.mutate(user.id)}
                                                    aria-label={`Verify ${user.fullName}`}
                                                >
                                                    Verify
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Transactions Tab ──────────────────────────────────────────────────────────

const TransactionsTab: React.FC = () => {
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data, isLoading, error, refetch } = useQuery<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>({
        queryKey: ['admin-transactions', page],
        queryFn: async () => {
            const res = await adminApi.getTransactions({ page, pageSize }) as any;
            const raw = res?.data ?? res;
            if (Array.isArray(raw)) {
                return { transactions: raw, total: raw.length, totalPages: 1 };
            }
            const transactions = raw?.transactions ?? raw?.data ?? [];
            const total = raw?.total ?? transactions.length;
            const totalPages = (raw?.totalPages ?? Math.ceil(total / pageSize)) || 1;
            return { transactions, total, totalPages };
        },
        placeholderData: (prev) => prev,
    });

    const transactions = data?.transactions ?? [];
    const totalPages = data?.totalPages ?? 1;
    const total = data?.total ?? 0;

    return (
        <div className="space-y-4">
            {total > 0 && (
                <p className="text-sm text-gray-500 text-right">
                    {total} transaction{total !== 1 ? 's' : ''}
                </p>
            )}

            {isLoading && transactions.length === 0 ? (
                <div className="flex justify-center py-10">
                    <Spinner size="md" />
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-3">Failed to load transactions.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg">No transactions found.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Reference
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => {
                                        const typeConfig = TX_TYPE_CONFIG[tx.type] ?? {
                                            label: tx.type,
                                            colorClass: 'bg-gray-100 text-gray-700',
                                        };
                                        const statusConfig = TX_STATUS_CONFIG[tx.status] ?? {
                                            label: tx.status,
                                            classes: 'bg-gray-100 text-gray-700',
                                        };
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.colorClass}`}>
                                                        {typeConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell max-w-[180px] truncate">
                                                    {tx.description ?? tx.reference}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                                                    {formatCurrency(tx.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.classes}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                                                    {formatDateTime(tx.createdAt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    aria-label="Previous page"
                                >
                                    ← Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    aria-label="Next page"
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ── Main AdminDashboard ───────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'transactions';

/**
 * AdminDashboard — platform statistics, user management, and transaction management.
 * Admin role is verified by AdminRoute before this component renders.
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */
export default function AdminDashboard() {
    const user = useAuthStore((s) => s.user);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('');

    const {
        data: stats,
        isLoading: statsLoading,
        error: statsError,
        refetch: refetchStats,
    } = useQuery<PlatformStats>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await adminApi.getStats() as any;
            return res?.data ?? res;
        },
    });

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'transactions', label: 'Transactions', icon: '💳' },
    ];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Welcome, {user?.fullName ?? 'Admin'} — platform management overview
                </p>
            </div>

            {/* Tab navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6" aria-label="Admin sections">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <span aria-hidden="true">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {statsLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size="lg" />
                        </div>
                    ) : statsError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600 mb-3">Failed to load platform statistics.</p>
                            <Button variant="outline" onClick={() => refetchStats()}>Retry</Button>
                        </div>
                    ) : stats ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard
                                    label="Total Users"
                                    value={stats.totalUsers ?? 0}
                                    icon="👤"
                                    colorClass="bg-blue-100"
                                />
                                <StatCard
                                    label="Artisans"
                                    value={stats.totalArtisans ?? 0}
                                    icon="🔧"
                                    colorClass="bg-green-100"
                                />
                                <StatCard
                                    label="Customers"
                                    value={stats.totalCustomers ?? 0}
                                    icon="🛒"
                                    colorClass="bg-yellow-100"
                                />
                                <StatCard
                                    label="Pending Verifications"
                                    value={stats.pendingVerifications ?? 0}
                                    icon="⏳"
                                    colorClass="bg-orange-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard
                                    label="Total Jobs"
                                    value={stats.totalJobs ?? 0}
                                    icon="📋"
                                    colorClass="bg-indigo-100"
                                />
                                <StatCard
                                    label="Active Jobs"
                                    value={stats.activeJobs ?? 0}
                                    icon="⚡"
                                    colorClass="bg-yellow-100"
                                />
                                <StatCard
                                    label="Completed Jobs"
                                    value={stats.completedJobs ?? 0}
                                    icon="✅"
                                    colorClass="bg-green-100"
                                />
                                <StatCard
                                    label="Total Revenue"
                                    value={formatCurrency(stats.totalRevenue ?? 0)}
                                    icon="💰"
                                    colorClass="bg-purple-100"
                                />
                            </div>

                            {/* Quick actions */}
                            {(stats.pendingVerifications ?? 0) > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                                    <span className="text-orange-500 text-xl" aria-hidden="true">⏳</span>
                                    <div>
                                        <p className="font-medium text-orange-800">
                                            {stats.pendingVerifications} user{stats.pendingVerifications !== 1 ? 's' : ''} pending verification
                                        </p>
                                        <p className="text-sm text-orange-700 mt-1">
                                            Review and verify users to grant them platform access.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setVerifiedFilter('false');
                                                setActiveTab('users');
                                            }}
                                            className="text-sm text-orange-800 font-medium underline mt-2"
                                        >
                                            Review pending users →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            )}

            {activeTab === 'users' && (
                <UsersTab
                    userTypeFilter={userTypeFilter}
                    onUserTypeFilterChange={setUserTypeFilter}
                    verifiedFilter={verifiedFilter}
                    onVerifiedFilterChange={setVerifiedFilter}
                />
            )}

            {activeTab === 'transactions' && <TransactionsTab />}
        </div>
    );
}
