import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/user.api';
import { ArtisanCardData } from '../components/artisan/ArtisanCard';
import { TierLevel } from '../types';

export interface JobFilters {
    trade: string;
    location: string;
    minRating: number;
    tier: TierLevel | '';
    nationwide?: boolean;
}

interface UseJobsResult {
    artisans: ArtisanCardData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * useJobs hook for fetching artisans with filters.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function useJobs(filters: JobFilters): UseJobsResult {
    const [artisans, setArtisans] = useState<ArtisanCardData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchArtisans = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params: Record<string, string | number | boolean> = {};
            if (filters.trade) params.trade = filters.trade;
            if (filters.location) params.location = filters.location;
            if (filters.minRating > 0) params.minRating = filters.minRating;
            if (filters.tier) params.tier = filters.tier;
            if (filters.nationwide) params.nationwide = true;

            const response = await userApi.getArtisans(params) as any;

            // Normalise the response — backend returns { artisans: [...] }
            const raw: any[] = Array.isArray(response)
                ? response
                : Array.isArray(response?.artisans)
                    ? response.artisans
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];

            const mapped: ArtisanCardData[] = raw.map((item: any) => ({
                id: item.id ?? item.userId ?? item.user?.id,
                user: item.user ?? {
                    id: item.id,
                    fullName: item.fullName ?? '',
                    userType: item.userType ?? 'ARTISAN',
                    tierLevel: item.tierLevel ?? 'EXPLORER',
                    trustScore: item.trustScore ?? 0,
                    isVerified: item.isVerified ?? false,
                    phoneNumber: item.phoneNumber ?? '',
                    createdAt: item.createdAt ?? '',
                    updatedAt: item.updatedAt ?? '',
                },
                profile: item.artisanProfile ?? item.profile ?? {
                    id: item.profileId ?? '',
                    userId: item.id ?? '',
                    trade: item.trade ?? '',
                    rating: item.rating ?? 0,
                    reviewCount: item.reviewCount ?? 0,
                    completedJobs: item.completedJobs ?? 0,
                },
                distanceKm: item.distanceKm ?? undefined,
            }));

            setArtisans(mapped);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load artisans. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filters.trade, filters.location, filters.minRating, filters.tier, filters.nationwide]);

    useEffect(() => {
        fetchArtisans();
    }, [fetchArtisans]);

    return { artisans, isLoading, error, refetch: fetchArtisans };
}
