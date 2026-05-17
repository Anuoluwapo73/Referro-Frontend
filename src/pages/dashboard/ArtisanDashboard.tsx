import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '../../api/job.api';
import { walletApi } from '../../api/wallet.api';
import { useAuthStore } from '../../store/authStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Job, JobStatus, Wallet } from '../../types';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import JobCard from '../../components/job/JobCard';
import ProfileWarningBanner from '../../components/common/ProfileWarningBanner';
import { formatCurrency } from '../../utils/formatting';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
    <Card padding="md" shadow="sm">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate truncate">{label}</p>
                <p className="text-lg sm:text-2xl font-bold text-ink truncate">{value}</p>
            </div>
        </div>
    </Card>
);

/**
 * ArtisanDashboard — shows earnings, jobs, and nearby jobs for artisans.
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
export default function ArtisanDashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { latitude, longitude, error: geoError, isLoading: geoLoading } = useGeolocation();

    const {
        data: jobs = [],
        isLoading: jobsLoading,
        error: jobsError,
        refetch: refetchJobs,
    } = useQuery<Job[]>({
        queryKey: ['artisan-jobs'],
        queryFn: async () => {
            const res = await jobApi.getJobs() as any;
            const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
            return raw;
        },
    });

    const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
        queryKey: ['wallet'],
        queryFn: async () => {
            const res = await walletApi.getWallet() as any;
            return res?.data?.wallet ?? res?.data ?? res;
        },
    });

    // Fetch nearby jobs once we have coordinates
    const {
        data: nearbyJobs = [],
        isLoading: nearbyLoading,
        error: nearbyError,
    } = useQuery<Job[]>({
        queryKey: ['nearby-jobs', latitude, longitude],
        queryFn: async () => {
            const res = await jobApi.findNearbyJobs(latitude!, longitude!) as any;
            const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
            return raw;
        },
        enabled: latitude !== null && longitude !== null,
    });

    const isLoading = jobsLoading || walletLoading;

    // Derived statistics
    const activeJobs = jobs.filter((j) =>
        (['ASSIGNED', 'IN_PROGRESS'] as JobStatus[]).includes(j.status)
    );
    const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-ink">
                    Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}!
                </h1>
                <p className="text-slate mt-1 text-sm sm:text-base">Here's your work overview</p>
            </div>

            {/* Profile warning banner — aggressive, shown until profile is complete */}
            {user && <ProfileWarningBanner user={user} />}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Active Jobs" value={activeJobs.length} icon="⚡" colorClass="bg-yellow-100" />
                <StatCard label="Completed" value={completedJobs.length} icon="✅" colorClass="bg-green-100" />
                <StatCard
                    label="Trust Score"
                    value={user?.trustScore ? user.trustScore.toFixed(1) : 'New'}
                    icon="⭐"
                    colorClass="bg-blue-100"
                />
                <StatCard
                    label="Wallet Balance"
                    value={wallet ? formatCurrency(wallet.balance) : '—'}
                    icon="💰"
                    colorClass="bg-purple-100"
                />
            </div>

            {/* Active jobs */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-display font-semibold text-ink">My Active Jobs</h2>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-sm text-primary-600 hover:underline min-h-[44px] flex items-center"
                    >
                        Browse all jobs →
                    </button>
                </div>

                {jobsError ? (
                    <div className="text-center py-8">
                        <p className="text-error mb-3">Failed to load jobs.</p>
                        <Button variant="outline" size="sm" onClick={() => refetchJobs()}>Retry</Button>
                    </div>
                ) : activeJobs.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 bg-white rounded-xl border border-line">
                        <p className="text-slate text-base sm:text-lg">No active jobs at the moment</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {activeJobs.slice(0, 4).map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                userType="ARTISAN"
                                onClick={(j) => navigate(`/jobs/${j.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Nearby jobs */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-display font-semibold text-ink">Nearby Jobs</h2>
                    {latitude && longitude && (
                        <span className="text-xs text-slate">Within 50 km</span>
                    )}
                </div>

                {geoLoading ? (
                    <div className="flex items-center gap-2 text-slate py-4">
                        <Spinner size="sm" />
                        <span className="text-sm">Detecting your location…</span>
                    </div>
                ) : geoError ? (
                    <div className="bg-[#F8FAFC] border border-line rounded-xl p-4 text-sm text-slate">
                        📍 Location access denied. Enable location permissions to see nearby jobs.
                    </div>
                ) : nearbyLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner size="md" />
                    </div>
                ) : nearbyError ? (
                    <div className="text-center py-8">
                        <p className="text-error text-sm">Failed to load nearby jobs.</p>
                    </div>
                ) : nearbyJobs.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 bg-white rounded-xl border border-line">
                        <p className="text-slate text-base sm:text-lg">No nearby jobs found</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {nearbyJobs.slice(0, 4).map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                userType="ARTISAN"
                                onClick={(j) => navigate(`/jobs/${j.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
