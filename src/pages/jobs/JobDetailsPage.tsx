import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import JobDetails from '../../components/job/JobDetails';
import EscrowStatus from '../../components/payment/EscrowStatus';
import { PaymentModal } from '../../components/payment';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { CostBreakdown, WaybillCard, WaybillData } from '../../components/jobs';
import { jobApi } from '../../api/job.api';
import { paymentApi } from '../../api/payment.api';
import { useAuthStore } from '../../store/authStore';
import { Job, UserType } from '../../types';

interface CostBreakdownData {
  budget: number;
  waybillFee: number;
  insuranceFee: number;
  total: number;
  waybill?: WaybillData;
}

interface Application {
  id: string;
  status: string;
  note?: string;
  createdAt: string;
  artisan: {
    id: string;
    fullName: string;
    photoUrl?: string;
    trustScore: number;
    tierLevel: string;
    artisanProfile?: { trade: string; rating: number; reviewCount: number; completedJobs: number; dailyRate?: number };
  };
}

/**
 * JobDetailsPage — fetches and displays a single job with all actions.
 * Integrates EscrowStatus for jobs with active escrow.
 * Integrates CostBreakdown + WaybillCard before payment confirmation.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 4.1, 4.2
 */
export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userType = (user?.userType ?? 'CUSTOMER') as UserType;
  const queryClient = useQueryClient();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [costBreakdown, setCostBreakdown] = useState<CostBreakdownData | null>(null);
  const [isCostLoading, setIsCostLoading] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobApi.getJob(id) as any;
      const data = response?.job ?? response?.data ?? response;
      setJob(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load job');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchCostBreakdown = useCallback(async (jobId: string) => {
    setIsCostLoading(true);
    try {
      const response = await jobApi.calculateCost(jobId) as any;
      const data = response?.data ?? response;
      setCostBreakdown(data);
    } catch {
      // Non-critical — silently skip if cost calculation fails
    } finally {
      setIsCostLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async (jobId: string) => {
    try {
      const res = await jobApi.getApplications(jobId) as any;
      const apps: Application[] = res?.applications ?? res?.data?.applications ?? [];
      setApplications(apps);
      if (userType === 'ARTISAN') {
        setHasApplied(apps.some((a) => a.artisan.id === user?.id));
      }
    } catch {
      // non-fatal
    } finally {
      setApplicationsLoaded(true);
    }
  }, [userType, user?.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Fetch applications for POSTED jobs
  useEffect(() => {
    if (job && job.status === 'POSTED') {
      fetchApplications(job.id);
    }
  }, [job, fetchApplications]);

  // Fetch cost breakdown when a customer views an unpaid job (pre-payment confirmation)
  useEffect(() => {
    if (
      job &&
      userType === 'CUSTOMER' &&
      job.paymentStatus !== 'PAID' &&
      ['POSTED', 'ASSIGNED'].includes(job.status)
    ) {
      fetchCostBreakdown(job.id);
    }
  }, [job, userType, fetchCostBreakdown]);

  const handleAction = async (action: 'start' | 'complete' | 'cancel' | 'request-completion') => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      if (action === 'start') await jobApi.startJob(id);
      else if (action === 'complete') await jobApi.completeJob(id);
      else if (action === 'request-completion') await jobApi.requestCompletion(id);
      else if (action === 'cancel') await jobApi.cancelJob(id);
      toast.success(
        action === 'complete' ? 'Job confirmed complete! Payment released to artisan.' :
        action === 'request-completion' ? 'Customer notified to confirm completion.' :
        action === 'start' ? 'Job started!' :
        `Job ${action}ed successfully`
      );
      await fetchJob();
      // After completion, force escrow panel to re-fetch so it shows the released state
      if (action === 'complete') {
        queryClient.invalidateQueries({ queryKey: ['escrow', id] });
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    } catch (err: any) {
      toast.error(err?.message ?? `Failed to ${action} job`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    try {
      await jobApi.applyForJob(id);
      toast.success('Application sent! The customer will be notified.');
      setHasApplied(true);
      fetchApplications(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDecide = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!id) return;
    setDecidingId(applicationId);
    try {
      await jobApi.decideApplication(id, applicationId, status);
      toast.success(status === 'ACCEPTED' ? 'Artisan accepted!' : 'Application rejected');
      await fetchJob();
      fetchApplications(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update application');
    } finally {
      setDecidingId(null);
    }
  };

  // Show cost breakdown panel before payment — customer, unpaid, active job
  const showCostBreakdown =
    job &&
    userType === 'CUSTOMER' &&
    job.paymentStatus !== 'PAID' &&
    ['POSTED', 'ASSIGNED'].includes(job.status);

  // Show escrow panel once job is paid — covers ASSIGNED (funded, not started),
  // IN_PROGRESS, COMPLETED, and DISPUTED states
  const showEscrow =
    job &&
    ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'].includes(job.status) &&
    job.paymentStatus === 'PAID';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Job not found'}</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => navigate('/jobs')}
          className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
          aria-label="Back to jobs"
        >
          ← Back to Jobs
        </button>
      </div>

      <JobDetails
        job={job}
        userType={userType}
        onStart={userType === 'ARTISAN' && job.status === 'ASSIGNED' ? () => handleAction('start') : undefined}
        onComplete={
          userType === 'ARTISAN' && job.status === 'IN_PROGRESS'
            ? () => handleAction('request-completion')
            : userType === 'CUSTOMER' && job.status === 'IN_PROGRESS'
            ? () => handleAction('complete')
            : undefined
        }
        onCancel={
          userType === 'CUSTOMER' && ['POSTED', 'ASSIGNED'].includes(job.status)
            ? () => handleAction('cancel')
            : undefined
        }
        onLeaveReview={
          userType === 'CUSTOMER' && job.status === 'COMPLETED'
            ? () => navigate(`/reviews/create?jobId=${job.id}`)
            : undefined
        }
        isActionLoading={isActionLoading}
      />

      {/* Apply button — artisan viewing an open job */}
      {job.status === 'POSTED' && userType === 'ARTISAN' && job.artisanId !== user?.id && (
        <div className="bg-white rounded-xl border border-line p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink mb-1">Interested in this job?</h2>
          <p className="text-sm text-slate mb-4">Express your interest and the customer will be notified. They can accept or reject your application.</p>
          {!applicationsLoaded ? (
            <div className="flex items-center gap-2 text-slate text-sm">
              <Spinner size="sm" /> Checking application status...
            </div>
          ) : hasApplied ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm font-medium">
              ✅ You've already applied — waiting for the customer's decision
            </div>
          ) : (
            <Button onClick={handleApply} isLoading={isApplying} disabled={isApplying}>
              Apply for this Job
            </Button>
          )}
        </div>
      )}

      {/* Applicants panel — customer viewing their POSTED job */}
      {job.status === 'POSTED' && userType === 'CUSTOMER' && (
        <div className="bg-white rounded-xl border border-line p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink mb-4">
            Applicants <span className="text-slate font-normal text-sm">({applications.length})</span>
          </h2>
          {applications.length === 0 ? (
            <p className="text-sm text-slate">No artisans have applied yet. Share your job to get more visibility.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border border-line bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                    {app.artisan.photoUrl
                      ? <img src={app.artisan.photoUrl} alt={app.artisan.fullName} className="w-full h-full object-cover" />
                      : app.artisan.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{app.artisan.fullName}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-xs text-slate">{app.artisan.artisanProfile?.trade}</span>
                      {app.artisan.artisanProfile?.completedJobs === 0 ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">✨ New</span>
                      ) : (
                        <>
                          <span className="text-slate text-xs">·</span>
                          <span className="text-xs text-slate">⭐ {app.artisan.artisanProfile?.rating.toFixed(1)}</span>
                          <span className="text-slate text-xs">·</span>
                          <span className="text-xs text-slate">{app.artisan.artisanProfile?.completedJobs} jobs</span>
                        </>
                      )}
                    </div>
                    {app.note && <p className="text-xs text-slate mt-0.5 italic">"{app.note}"</p>}
                  </div>
                  {app.status === 'PENDING' ? (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDecide(app.id, 'ACCEPTED')}
                        disabled={decidingId === app.id}
                        className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecide(app.id, 'REJECTED')}
                        disabled={decidingId === app.id}
                        className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {app.status === 'ACCEPTED' ? '✓ Accepted' : 'Rejected'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cost breakdown + Fund Escrow button — shown before payment (Requirements 4.1, 4.2) */}
      {showCostBreakdown && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Payment Summary
          </h2>
          {isCostLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : costBreakdown ? (
            <>
              <CostBreakdown
                budget={costBreakdown.budget}
                waybillFee={costBreakdown.waybillFee}
                insuranceFee={costBreakdown.insuranceFee}
                total={costBreakdown.total}
              />
              {costBreakdown.waybill && (
                <WaybillCard waybill={costBreakdown.waybill} />
              )}
            </>
          ) : null}

          {/* Fund Escrow button — only shown when artisan has been accepted */}
          {job.status === 'ASSIGNED' && job.paymentStatus !== 'PAID' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-900">Artisan accepted — fund the job to proceed</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Funds are held securely in escrow and only released when you confirm the work is done.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex-shrink-0"
              >
                Fund Escrow
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Escrow panel — shown when job has active escrow (Requirements 9.1–9.4) */}
      {showEscrow && (
        <EscrowStatus
          jobId={job.id}
          isCustomer={userType === 'CUSTOMER'}
        />
      )}

      {/* Payment modal — opened when customer clicks Fund Escrow */}
      {job.budget && (
        <PaymentModal
          jobId={job.id}
          amount={job.budget}
          jobTitle={job.title}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(reference) => {
            setIsPaymentModalOpen(false);
            toast.success('Payment confirmed! Funds are now held in escrow.');
            fetchJob();
          }}
          onError={(error) => {
            toast.error(error);
          }}
        />
      )}
    </div>
  );
}
