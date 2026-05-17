import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ReviewForm from '../../components/review/ReviewForm';
import Spinner from '../../components/common/Spinner';
import { reviewApi } from '../../api/review.api';
import { jobApi } from '../../api/job.api';
import { Job } from '../../types';

/**
 * CreateReviewPage — allows a customer to submit a review for a completed job.
 * Navigated to from JobDetailsPage via /reviews/create?jobId=<id>
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export default function CreateReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const jobId = searchParams.get('jobId');

  // Fetch job to display context and get artisan info
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await jobApi.getJob(jobId!) as any;
      return (res?.data ?? res) as Job;
    },
    enabled: !!jobId,
  });

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    if (!jobId) return;
    try {
      await reviewApi.createReview({ jobId, ...data });
      toast.success('Review submitted successfully');

      // Invalidate artisan reviews cache so the profile page refreshes
      if (job?.artisanId) {
        queryClient.invalidateQueries({ queryKey: ['artisan-reviews', job.artisanId] });
        queryClient.invalidateQueries({ queryKey: ['artisan', job.artisanId] });
      }

      navigate(`/jobs/${jobId}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Failed to submit review';
      toast.error(message);
      throw err; // re-throw so the form stays in error state
    }
  };

  if (!jobId) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center" role="alert">
        <p className="text-gray-600">No job specified. Please go back and try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center" role="alert">
        <p className="text-red-600 mb-4">
          {(error as Error)?.message ?? 'Failed to load job details'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const artisanName = job.artisan?.fullName ?? 'the artisan';

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Back link */}
      <button
        onClick={() => navigate(`/jobs/${jobId}`)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded"
        aria-label="Back to job details"
      >
        ← Back to Job
      </button>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Leave a Review</h1>
        <p className="text-sm text-gray-500 mb-6">
          Share your experience working with{' '}
          <span className="font-medium text-gray-700">{artisanName}</span> on{' '}
          <span className="font-medium text-gray-700">{job.title}</span>.
        </p>

        <ReviewForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
