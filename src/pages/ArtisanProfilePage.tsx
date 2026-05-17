import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArtisanProfile from '../components/artisan/ArtisanProfile';
import { userApi } from '../api/user.api';
import { reviewApi } from '../api/review.api';
import { useAuthStore, selectUser } from '../store/authStore';
import { ArtisanProfile as ArtisanProfileType, Review, User } from '../types';

/**
 * ArtisanProfilePage – fetches and displays a full artisan profile.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function ArtisanProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore(selectUser);

  // Fetch artisan user + profile data
  const {
    data: artisanData,
    isLoading: artisanLoading,
    error: artisanError,
  } = useQuery({
    queryKey: ['artisan', id],
    queryFn: async () => {
      const res = await userApi.getArtisan(id!) as any;
      // Backend may return { data: {...} } or the object directly
      return (res?.data ?? res) as { user: User; profile: ArtisanProfileType } & User & {
        artisanProfile?: ArtisanProfileType;
      };
    },
    enabled: !!id,
  });

  // Fetch reviews for this artisan
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['artisan-reviews', id],
    queryFn: async () => {
      const res = await reviewApi.getUserReviews(id!) as any;
      const raw = res?.data ?? res;
      return (Array.isArray(raw) ? raw : []) as Review[];
    },
    enabled: !!id,
  });

  const isLoading = artisanLoading || reviewsLoading;

  // Normalise the artisan response into the shape ArtisanProfile component expects
  const profileData = artisanData
    ? (() => {
        // Backend may return a flat user object with nested artisanProfile,
        // or a { user, profile } shape.
        const user: User = (artisanData as any).user ?? (artisanData as unknown as User);
        const profile: ArtisanProfileType =
          (artisanData as any).profile ??
          (artisanData as any).artisanProfile ?? {
            id: '',
            userId: user.id,
            trade: (artisanData as any).trade ?? '',
            rating: (artisanData as any).rating ?? 0,
            reviewCount: (artisanData as any).reviewCount ?? 0,
            completedJobs: (artisanData as any).completedJobs ?? 0,
          };
        return { user, profile };
      })()
    : null;

  const handleHire = () => {
    if (!profileData) return;
    navigate('/jobs/create', {
      state: {
        artisanId: id,
        artisanName: profileData.user.fullName,
        artisanPhoto: profileData.user.photoUrl,
        trade: profileData.profile.trade,
      },
    });
  };

  // Error state
  if (!isLoading && artisanError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" role="alert">
        <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
        <p className="text-gray-700 font-medium mb-2">Failed to load artisan profile</p>
        <p className="text-gray-500 text-sm mb-6">
          {(artisanError as Error).message ?? 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {profileData ? (
        <ArtisanProfile
          data={{
            user: profileData.user,
            profile: profileData.profile,
            reviews: reviewsData ?? [],
            isLoading,
          }}
          onHire={handleHire}
          currentUserId={currentUser?.id}
        />
      ) : (
        // Still loading – delegate to the component's own loading state
        <ArtisanProfile
          data={{ user: {} as User, profile: {} as ArtisanProfileType, isLoading: true }}
        />
      )}
    </div>
  );
}
