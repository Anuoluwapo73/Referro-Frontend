import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/user.api';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatDate, formatPhoneNumber, getInitials } from '../../utils/formatting';
import { getProfileCompleteness } from '../../utils/profileCompleteness';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

const TIER_CONFIG = {
  EXPLORER: {
    label: 'Explorer',
    classes: 'bg-gray-100 text-gray-700',
    next: 'VERIFIED' as const,
    nextLabel: 'Verified',
    description: 'Basic access. Limited to 3 active jobs at a time.',
  },
  VERIFIED: {
    label: 'Verified',
    classes: 'bg-blue-100 text-blue-700',
    next: 'SHIELD' as const,
    nextLabel: 'Shield',
    description: 'Up to 10 active jobs. Access to priority matching.',
  },
  SHIELD: {
    label: 'Shield',
    classes: 'bg-purple-100 text-purple-700',
    next: null,
    nextLabel: null,
    description: 'Highest trust level. Unlimited jobs and all features unlocked.',
  },
};

const TIER_FEATURES = {
  EXPLORER: ['Up to 3 active jobs', 'Basic profile', 'Standard support'],
  VERIFIED: ['Up to 10 active jobs', 'Verified badge on profile', 'Priority in search results', 'Access to premium jobs'],
  SHIELD: ['Unlimited active jobs', 'Shield badge', 'Top search placement', 'Dedicated support', 'Early access to new features'],
};

const USER_TYPE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  ARTISAN: 'Artisan',
  REFERRER: 'Referrer',
  ADMIN: 'Admin',
};

const ProfileField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</dd>
  </div>
);



export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await userApi.getProfile() as any;
      return res?.user ?? res?.profile ?? res?.data ?? res;
    },
    initialData: storeUser ?? undefined,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (targetTier: string) => {
      const res = await apiClient.post('/users/upgrade', { targetTier }) as any;
      const { accessCode, reference, amount } = res;
      return new Promise<string>((resolve, reject) => {
        const handler = (window as any).PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: user?.email || `${user?.phoneNumber?.replace('+', '')}@referro.app`,
          amount: amount * 100,
          ref: reference,
          access_code: accessCode,
          onSuccess: async () => {
            try {
              await apiClient.post('/users/upgrade/verify', { reference, targetTier });
              resolve(targetTier);
            } catch (err) { reject(err); }
          },
          onCancel: () => reject(new Error('Payment cancelled')),
        });
        handler.openIframe();
      });
    },
    onSuccess: (targetTier: string) => {
      toast.success('Tier upgraded successfully!');
      if (user) {
        const updatedUser = { ...user, tierLevel: targetTier as any, isVerified: true };
        setUser(updatedUser);
        queryClient.setQueryData(['profile'], updatedUser);
      }
    },
    onError: (err: any) => {
      if (err?.message !== 'Payment cancelled') toast.error(err?.message || 'Upgrade failed');
    },
  });

  /** Handle photo file selection — converts to base64 and saves via PATCH /profile */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const res = await userApi.updateProfile({ photoUrl: dataUrl }) as any;
        const updated: User = res?.user ?? res?.data ?? res;
        if (updated?.id) {
          setUser(updated);
          queryClient.setQueryData(['profile'], updated);
          toast.success('Photo updated!');
        }
        setUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  if (isLoading && !user) {
    return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
  }

  if (error && !user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">Failed to load profile.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!user) return null;

  const tierConfig = TIER_CONFIG[user.tierLevel] ?? TIER_CONFIG.EXPLORER;
  const initials = getInitials(user.fullName);
  const { score, missing } = getProfileCompleteness(user);
  const isIncomplete = score < 100;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={() => navigate('/profile/edit')} size="sm">Edit Profile</Button>
      </div>

      {/* Profile completeness banner */}
      {isIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">Your profile is {score}% complete</p>
              <p className="text-xs text-amber-700 mt-0.5">Complete your profile to build trust with customers and get more jobs.</p>
              <div className="mt-2 w-full bg-amber-200 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.map((item) => (
                  <span key={item} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    + {item}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="mt-3 text-xs font-medium text-amber-800 underline underline-offset-2"
              >
                Complete profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar + summary */}
      <Card padding="lg" shadow="sm">
        <div className="flex items-center gap-4">
          {/* Photo with upload button */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-700 text-xl sm:text-2xl font-bold">{initials}</span>
              )}
            </div>
            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center transition-all group"
              aria-label="Change profile photo"
            >
              {uploadingPhoto ? (
                <Spinner size="sm" />
              ) : (
                <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">📷</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{user.fullName}</h2>
            <p className="text-sm text-gray-500">{USER_TYPE_LABELS[user.userType] ?? user.userType}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierConfig.classes}`}>
                {tierConfig.label}
              </span>
              {user.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  ✓ Verified
                </span>
              )}
              <span className="text-xs text-gray-500">
                Trust: <span className="font-medium text-gray-700">{user.trustScore ? user.trustScore.toFixed(1) : 'New'}</span>
              </span>
            </div>
            {!user.photoUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-primary-600 underline underline-offset-2"
              >
                + Add profile photo
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal information */}
      <Card padding="lg" shadow="sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <ProfileField label="Surname" value={user.lastName} />
          <ProfileField label="First Name" value={user.firstName} />
          <ProfileField label="Phone Number" value={formatPhoneNumber(user.phoneNumber)} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Member Since" value={formatDate(user.createdAt)} />
        </dl>
      </Card>

      {/* Address */}
      <Card padding="lg" shadow="sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Address</h3>
        {user.address ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Address" value={user.address} />
            <ProfileField label="City" value={user.city} />
            <ProfileField label="State" value={user.state} />
          </dl>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">No address set. Adding your address helps match you with nearby artisans.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/profile/edit')}>Add Address</Button>
          </div>
        )}
      </Card>

      {/* Tier & Upgrade */}
      <Card padding="lg" shadow="sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Account Tier</h3>
        <p className="text-sm text-gray-500 mb-4">{tierConfig.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {(['EXPLORER', 'VERIFIED', 'SHIELD'] as const).map((tier) => {
            const cfg = TIER_CONFIG[tier];
            const isActive = user.tierLevel === tier;
            return (
              <div key={tier} className={`rounded-xl border p-4 ${isActive ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                  {isActive && <span className="text-xs text-primary-600 font-medium">Current</span>}
                </div>
                <ul className="space-y-1">
                  {TIER_FEATURES[tier].map((f) => (
                    <li key={f} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {tierConfig.next ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Upgrade to {tierConfig.nextLabel}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Pay ₦{tierConfig.next === 'VERIFIED' ? '1,000' : '2,500'} to unlock more features instantly
              </p>
            </div>
            <Button size="sm" onClick={() => upgradeMutation.mutate(tierConfig.next!)} isLoading={upgradeMutation.isPending} className="w-full sm:w-auto">
              Upgrade — ₦{tierConfig.next === 'VERIFIED' ? '1,000' : '2,500'}
            </Button>
          </div>
        ) : (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
            <p className="text-sm font-medium text-purple-800">🎉 You're on the highest tier!</p>
            <p className="text-xs text-purple-600 mt-1">All features are unlocked for you.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
