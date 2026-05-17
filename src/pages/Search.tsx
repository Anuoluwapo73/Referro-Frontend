import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArtisanCard, { ArtisanCardData } from '../components/artisan/ArtisanCard';
import ArtisanFilters, { ArtisanFilterValues } from '../components/artisan/ArtisanFilters';
import NationwideToggle from '../components/search/NationwideToggle';
import { useJobs } from '../hooks/useJobs';

const DEFAULT_FILTERS: ArtisanFilterValues = {
  trade: '',
  location: '',
  minRating: 0,
  tier: '',
};

/**
 * Search and Discovery page.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ArtisanFilterValues>({
    ...DEFAULT_FILTERS,
    // Pre-fill trade from URL query param (e.g. /search?trade=plumbing from landing page)
    trade: searchParams.get('trade') ?? '',
  });
  const [nationwide, setNationwide] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Update trade filter if URL param changes
  useEffect(() => {
    const t = searchParams.get('trade');
    if (t) setFilters((prev) => ({ ...prev, trade: t }));
  }, [searchParams]);

  const { artisans, isLoading, error, refetch } = useJobs({ ...filters, nationwide });

  const handleFiltersChange = useCallback((newFilters: ArtisanFilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleArtisanClick = useCallback(
    (artisan: ArtisanCardData) => {
      navigate(`/artisans/${artisan.id}`);
    },
    [navigate]
  );

  const activeFilterCount = [
    filters.trade,
    filters.location,
    filters.minRating > 0,
    filters.tier,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">Find Artisans</h1>
            <p className="text-slate mt-1 text-sm sm:text-base">
              Browse verified artisans by trade, location, and rating.
            </p>
          </div>
          <NationwideToggle nationwide={nationwide} onChange={setNationwide} />
        </div>

        {/* Mobile filter toggle */}
        <div className="mt-3 lg:hidden">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 border border-line rounded-lg text-sm font-medium text-ink bg-white hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 min-h-[44px]"
            aria-expanded={showFilters}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <svg className={`h-4 w-4 ml-auto transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFilters && (
            <div className="mt-2">
              <ArtisanFilters filters={filters} onChange={handleFiltersChange} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar — desktop only */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ArtisanFilters filters={filters} onChange={handleFiltersChange} />
        </aside>

        {/* Results area */}
        <main className="flex-1 min-w-0">
          {/* Result count / status bar */}
          <div className="flex items-center justify-between mb-4">
            {!isLoading && !error && (
              <p className="text-sm text-slate">
                {artisans.length === 0
                  ? 'No artisans found'
                  : `${artisans.length} artisan${artisans.length !== 1 ? 's' : ''} found`}
              </p>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              aria-busy="true"
              aria-label="Loading artisans"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-line shadow-sm p-4 animate-pulse"
                  aria-hidden="true"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-line" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-line rounded w-3/4" />
                      <div className="h-3 bg-line rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-line rounded w-1/3 mb-3" />
                  <div className="h-3 bg-line rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div
              role="alert"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
              <p className="text-ink font-medium mb-2">Something went wrong</p>
              <p className="text-slate text-sm mb-6">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors min-h-[44px]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && artisans.length === 0 && (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
              <p className="text-ink font-medium mb-2">No artisans found</p>
              <p className="text-slate text-sm">
                Try adjusting your filters or search in a different location.
              </p>
            </div>
          )}

          {/* Results grid */}
          {!isLoading && !error && artisans.length > 0 && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              aria-label="Artisan search results"
            >
              {artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  onClick={handleArtisanClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
