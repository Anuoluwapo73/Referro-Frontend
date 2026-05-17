import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import JobCard from '../../components/job/JobCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { jobApi } from '../../api/job.api';
import { useAuthStore } from '../../store/authStore';
import { Job, JobStatus, UserType } from '../../types';

const STATUS_TABS: { label: string; statuses: JobStatus[] | 'ALL' }[] = [
  { label: 'All', statuses: 'ALL' },
  { label: 'Open', statuses: ['POSTED'] },
  { label: 'Active', statuses: ['ASSIGNED', 'IN_PROGRESS'] },
  { label: 'Done', statuses: ['COMPLETED'] },
];

export default function JobList() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userType = (user?.userType ?? 'CUSTOMER') as UserType;
  const isArtisan = userType === 'ARTISAN';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobApi.getJobs() as any;
      const raw = Array.isArray(response) ? response
        : Array.isArray(response?.jobs) ? response.jobs
        : Array.isArray(response?.data) ? response.data : [];
      setJobs(raw);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleJobClick = (job: Job) => navigate(`/jobs/${job.id}`);

  const handleAction = async (job: Job, action: 'start' | 'complete' | 'cancel') => {
    try {
      if (action === 'start') await jobApi.startJob(job.id);
      else if (action === 'complete') await jobApi.completeJob(job.id);
      else if (action === 'cancel') await jobApi.cancelJob(job.id);
      toast.success(`Job ${action === 'complete' ? 'completed' : action + 'ed'} successfully`);
      await fetchJobs();
    } catch (err: any) {
      toast.error(err?.message ?? `Failed to ${action} job`);
    }
  };

  const tabDef = STATUS_TABS[activeTab];
  const filtered = tabDef.statuses === 'ALL'
    ? jobs
    : jobs.filter((j) => (tabDef.statuses as JobStatus[]).includes(j.status));

  // For artisans: my jobs = assigned/in-progress/completed; open = POSTED
  const myArtisanJobs = isArtisan ? jobs.filter((j) => j.artisanId === user?.id) : [];
  const openJobs = isArtisan ? jobs.filter((j) => j.status === 'POSTED' && j.artisanId !== user?.id) : [];

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchJobs}>Retry</Button>
      </div>
    );
  }

  /* ── ARTISAN VIEW ── */
  if (isArtisan) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
        {/* Open jobs from customers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Available Jobs</h1>
              <p className="text-sm text-gray-500 mt-0.5">Jobs posted by customers near you</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {openJobs.length} open
            </span>
          </div>

          {openJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No open jobs right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {openJobs.map((job) => (
                <JobCard key={job.id} job={job} userType="ARTISAN" onClick={handleJobClick} />
              ))}
            </div>
          )}
        </section>

        {/* Artisan's own jobs */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">My Jobs</h2>
          {myArtisanJobs.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">You haven't been assigned any jobs yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myArtisanJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  userType="ARTISAN"
                  onClick={handleJobClick}
                  onStart={job.status === 'ASSIGNED' ? (j) => handleAction(j, 'start') : undefined}
                  onComplete={job.status === 'IN_PROGRESS' ? (j) => handleAction(j, 'complete') : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ── CUSTOMER VIEW ── */
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Button onClick={() => navigate('/jobs/create')} className="w-full sm:w-auto">+ Post a Job</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 min-w-[60px] px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.statuses !== 'ALL' && (
              <span className="ml-1 text-xs text-gray-400">
                ({jobs.filter((j) => (tab.statuses as JobStatus[]).includes(j.status)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-base mb-4">
            {jobs.length === 0 ? 'No jobs yet' : 'No jobs in this category'}
          </p>
          {jobs.length === 0 && (
            <Button onClick={() => navigate('/jobs/create')}>Post your first job</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              userType="CUSTOMER"
              onClick={handleJobClick}
              onCancel={['POSTED', 'ASSIGNED'].includes(job.status) ? (j) => handleAction(j, 'cancel') : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
