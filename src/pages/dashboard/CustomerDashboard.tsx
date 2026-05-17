import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '../../api/job.api';
import { walletApi } from '../../api/wallet.api';
import { useAuthStore } from '../../store/authStore';
import { Job, JobStatus, Wallet } from '../../types';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ProfileWarningBanner from '../../components/common/ProfileWarningBanner';
import { formatCurrency } from '../../utils/formatting';

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
        queryKey: ['customer-jobs'],
        queryFn: async () => {
            const res = await jobApi.getJobs() as any;
            return Array.isArray(res) ? res : Array.isArray(res?.jobs) ? res.jobs : Array.isArray(res?.data) ? res.data : [];
        },
    });

    const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
        queryKey: ['wallet'],
        queryFn: async () => {
            const res = await walletApi.getWallet() as any;
            return res?.data?.wallet ?? res?.data ?? res;
        },
    });

    const activeJobs = jobs.filter((j) => (['POSTED', 'ASSIGNED', 'IN_PROGRESS'] as JobStatus[]).includes(j.status));
    const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
    const pendingPayment = jobs.filter((j) => j.paymentStatus === 'PENDING' && j.status !== 'CANCELLED');

    if (jobsLoading || walletLoading) {
        return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
    }

    const firstName = user?.firstName ?? user?.fullName?.split(' ')[0] ?? 'there';

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-ink">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="text-slate mt-0.5 text-sm">Here's what's happening with your jobs.</p>
                </div>
                <Button onClick={() => navigate('/jobs/create')} className="w-full sm:w-auto">
                    + Post a Job
                </Button>
            </div>

            {/* Profile warning banner */}
            {user && <ProfileWarningBanner user={user} />}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Jobs', value: jobs.length, icon: '📋', bg: 'bg-primary-50', text: 'text-primary-600' },
                    { label: 'Active', value: activeJobs.length, icon: '⚡', bg: 'bg-yellow-50', text: 'text-yellow-600' },
                    { label: 'Completed', value: completedJobs.length, icon: '✅', bg: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Wallet', value: wallet ? formatCurrency(wallet.balance) : '₦0', icon: '💰', bg: 'bg-purple-50', text: 'text-purple-600' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-line rounded-xl p-4 shadow-sm">
                        <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center text-lg mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs text-slate">{stat.label}</p>
                        <p className={`text-lg font-bold ${stat.text} mt-0.5 truncate`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Pending payment alert */}
            {pendingPayment.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-yellow-500 text-xl flex-shrink-0">⚠️</span>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-yellow-800 text-sm">
                            {pendingPayment.length} job{pendingPayment.length > 1 ? 's' : ''} awaiting payment
                        </p>
                        <p className="text-xs text-yellow-700 mt-0.5">Complete payment to secure your jobs with escrow.</p>
                    </div>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-xs font-semibold text-yellow-800 underline flex-shrink-0"
                    >
                        View →
                    </button>
                </div>
            )}

            {/* Quick actions */}
            <div>
                <h2 className="text-base font-display font-semibold text-ink mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        onClick={() => navigate('/jobs/create')}
                        className="flex items-center gap-3 bg-white border border-line rounded-xl p-4 hover:border-primary-600 hover:bg-primary-50 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-xl transition-colors flex-shrink-0">📝</div>
                        <div>
                            <p className="text-sm font-semibold text-ink">Post a Job</p>
                            <p className="text-xs text-slate">Describe what you need</p>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-3 bg-white border border-line rounded-xl p-4 hover:border-primary-600 hover:bg-primary-50 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-xl transition-colors flex-shrink-0">🔍</div>
                        <div>
                            <p className="text-sm font-semibold text-ink">Find Artisans</p>
                            <p className="text-xs text-slate">Browse by trade or location</p>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="flex items-center gap-3 bg-white border border-line rounded-xl p-4 hover:border-primary-600 hover:bg-primary-50 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-xl transition-colors flex-shrink-0">📋</div>
                        <div>
                            <p className="text-sm font-semibold text-ink">My Jobs</p>
                            <p className="text-xs text-slate">Track all your jobs</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Empty state — no jobs yet */}
            {jobs.length === 0 && (
                <div className="text-center py-14 bg-white rounded-xl border border-line">
                    <p className="text-4xl mb-3">🛠️</p>
                    <p className="font-display font-semibold text-ink mb-1">No jobs yet</p>
                    <p className="text-sm text-slate mb-4">Post your first job and get matched with a verified artisan.</p>
                    <Button onClick={() => navigate('/jobs/create')}>Post a Job</Button>
                </div>
            )}
        </div>
    );
}
