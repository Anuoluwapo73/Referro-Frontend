import React, { useState } from 'react';
import { ArtisanProfile as ArtisanProfileType, PortfolioItem, Review, User, TierLevel } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import TrustBadge from '../common/TrustBadge';

export interface ArtisanProfileData {
  user: User;
  profile: ArtisanProfileType;
  reviews?: Review[];
  isLoading?: boolean;
}

interface ArtisanProfileProps {
  data: ArtisanProfileData;
  onHire?: () => void;
  currentUserId?: string;
}

const TIER_STYLES: Record<TierLevel, { label: string; className: string }> = {
  EXPLORER: { label: 'Explorer', className: 'bg-gray-100 text-gray-700' },
  VERIFIED: { label: 'Verified', className: 'bg-blue-100 text-blue-700' },
  SHIELD: { label: 'Shield', className: 'bg-green-100 text-green-700' },
};

const REVIEWS_PER_PAGE = 5;

// ── Star Rating ──────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({
  rating,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${iconSize} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

// ── Portfolio Lightbox ───────────────────────────────────────────────────────
const PortfolioGallery: React.FC<{ items: PortfolioItem[] }> = ({ items }) => {
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="portfolio-heading">
      <h2 id="portfolio-heading" className="text-lg font-semibold text-gray-900 mb-3">
        Portfolio
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={`View portfolio item: ${item.title}`}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
              <p className="text-white text-xs font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                {item.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Modal
        isOpen={lightboxItem !== null}
        onClose={() => setLightboxItem(null)}
        title={lightboxItem?.title}
        size="lg"
      >
        {lightboxItem && (
          <div className="flex flex-col gap-3">
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title}
              className="w-full rounded-lg object-contain max-h-[60vh]"
            />
            {lightboxItem.description && (
              <p className="text-sm text-gray-600">{lightboxItem.description}</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
};

// ── Reviews Section ──────────────────────────────────────────────────────────
const ReviewsSection: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const visible = reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-lg font-semibold text-gray-900 mb-3">
        Reviews{' '}
        <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {visible.map((review) => (
              <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {review.reviewer.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4" role="navigation" aria-label="Reviews pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Previous page"
              >
                ‹
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const ArtisanProfile: React.FC<ArtisanProfileProps> = ({ data, onHire, currentUserId }) => {
  const { user, profile, reviews = [], isLoading } = data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading artisan profile..." />
      </div>
    );
  }

  const tier = TIER_STYLES[user.tierLevel] ?? TIER_STYLES.EXPLORER;
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwnProfile = currentUserId === user.id;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{user.fullName}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.className}`}>
                {tier.label}
              </span>
              {user.isVerified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-0.5">{profile.trade}</p>
            {profile.specialization && (
              <p className="text-sm text-gray-400">{profile.specialization}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <StarRating rating={profile.rating} />
            <p className="text-xs text-gray-400 mt-0.5">{profile.reviewCount} reviews</p>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <p className="font-semibold text-gray-900">{profile.completedJobs}</p>
            <p className="text-xs text-gray-400">Jobs done</p>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <TrustBadge score={user.trustScore} size="md" showLabel />
            <p className="text-xs text-gray-400 mt-0.5">Trust score</p>
          </div>
          {profile.yearsOfExperience !== undefined && (
            <div className="border-l border-gray-200 pl-4">
              <p className="font-semibold text-gray-900">{profile.yearsOfExperience}</p>
              <p className="text-xs text-gray-400">Years exp.</p>
            </div>
          )}
        </div>

        {/* Rates */}
        {(profile.dailyRate || profile.hourlyRate) && (
          <div className="mt-3 flex gap-4 text-sm">
            {profile.dailyRate && (
              <span className="text-gray-700">
                <span className="font-medium">₦{profile.dailyRate.toLocaleString()}</span> / day
              </span>
            )}
            {profile.hourlyRate && (
              <span className="text-gray-700">
                <span className="font-medium">₦{profile.hourlyRate.toLocaleString()}</span> / hr
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {(user.city || user.state) && (
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {[user.city, user.state].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Hire button */}
        {!isOwnProfile && onHire && (
          <div className="mt-4">
            <Button onClick={onHire} className="w-full sm:w-auto">
              Hire {user.fullName.split(' ')[0]}
            </Button>
          </div>
        )}
      </div>

      {/* Portfolio */}
      {profile.portfolio && profile.portfolio.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <PortfolioGallery items={profile.portfolio} />
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <ReviewsSection reviews={reviews} />
      </div>
    </div>
  );
};

export default ArtisanProfile;
