import React from 'react';
import { ArtisanProfile, User, TierLevel } from '../../types';
import TrustBadge from '../common/TrustBadge';

export interface ArtisanCardData {
  id: string;
  user: User;
  profile: ArtisanProfile;
  distanceKm?: number;
}

interface ArtisanCardProps {
  artisan: ArtisanCardData;
  onClick?: (artisan: ArtisanCardData) => void;
}

const TIER_STYLES: Record<TierLevel, { label: string; className: string }> = {
  EXPLORER: { label: 'Explorer', className: 'bg-gray-100 text-gray-600' },
  VERIFIED: { label: 'Verified ✓', className: 'bg-blue-50 text-blue-600' },
  SHIELD: { label: 'Shield 🛡️', className: 'bg-green-50 text-green-600' },
};

// Compact inline star row
const StarRow: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5, ${count} reviews`}>
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
    {count > 0 && <span className="text-xs text-gray-400">({count})</span>}
  </div>
);

const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan, onClick }) => {
  const { user, profile, distanceKm } = artisan;
  const tier = TIER_STYLES[user.tierLevel] ?? TIER_STYLES.EXPLORER;
  const initials = user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col gap-2.5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      onClick={() => onClick?.(artisan)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(artisan)}
      aria-label={`View profile of ${user.fullName}`}
    >
      {/* Top row: avatar + name + badges */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Name + trade */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">{user.fullName}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${tier.className}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-xs text-primary-600 font-medium truncate leading-tight mt-0.5">{profile.trade}</p>
        </div>

        {/* Distance badge — top right */}
        {distanceKm !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium flex-shrink-0 border border-orange-100">
            📍{distanceKm < 1 ? '<1' : Math.round(distanceKm)}km
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Stats row */}
      <div className="flex items-center justify-between gap-2">
        <StarRow rating={profile.rating} count={profile.reviewCount} />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span><span className="font-medium text-gray-700">{profile.completedJobs}</span> jobs</span>
          <TrustBadge score={user.trustScore} size="sm" />
        </div>
      </div>

      {/* Rate + specialization row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        {profile.specialization ? (
          <p className="text-xs text-gray-400 truncate flex-1">{profile.specialization}</p>
        ) : <span />}
        {(profile.dailyRate || profile.hourlyRate) && (
          <p className="text-xs text-gray-600 font-medium flex-shrink-0">
            {profile.dailyRate
              ? `₦${profile.dailyRate.toLocaleString()}/day`
              : `₦${profile.hourlyRate!.toLocaleString()}/hr`}
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ArtisanCard);
