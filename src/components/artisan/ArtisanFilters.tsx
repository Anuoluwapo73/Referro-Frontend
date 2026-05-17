import React from 'react';
import { TierLevel } from '../../types';

export interface ArtisanFilterValues {
  trade: string;
  location: string;
  minRating: number;
  tier: TierLevel | '';
}

interface ArtisanFiltersProps {
  filters: ArtisanFilterValues;
  onChange: (filters: ArtisanFilterValues) => void;
}

const TRADES = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Welder',
  'Mason / Bricklayer', 'Tiler', 'Roofer', 'AC Technician',
  'Generator Technician', 'Auto Mechanic', 'Vulcanizer',
  'Tailor / Fashion Designer', 'Barber', 'Hair Stylist',
  'Make-up Artist', 'Photographer', 'Videographer',
  'Graphic Designer', 'Web Developer', 'Caterer / Chef',
  'Event Decorator', 'Cleaner / Housekeeper', 'Security Guard',
  'Laundry / Dry Cleaning', 'Fumigator / Pest Control',
  'Gardener / Landscaper', 'Nanny / Babysitter',
  'Tutor / Teacher', 'Nurse / Caregiver', 'General',
];

const TIERS: { value: TierLevel | ''; label: string }[] = [
  { value: '', label: 'All Tiers' },
  { value: 'EXPLORER', label: 'Explorer' },
  { value: 'VERIFIED', label: 'Verified ✓' },
  { value: 'SHIELD', label: 'Shield 🛡️' },
];

const selectClass = 'w-full border-[1.5px] border-line rounded-[10px] px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 min-h-[44px] bg-white transition-colors';
const inputClass = 'w-full border-[1.5px] border-line rounded-[10px] px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 min-h-[44px] transition-colors placeholder:text-slate-light';
const labelClass = 'block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5';

const ArtisanFilters: React.FC<ArtisanFiltersProps> = ({ filters, onChange }) => {
  const activeCount = [filters.trade, filters.location, filters.minRating > 0, filters.tier].filter(Boolean).length;

  const set = <K extends keyof ArtisanFilterValues>(key: K, value: ArtisanFilterValues[K]) =>
    onChange({ ...filters, [key]: value });

  const reset = () => onChange({ trade: '', location: '', minRating: 0, tier: '' });

  return (
    <div className="bg-white rounded-xl border border-line shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold text-ink">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full border border-primary-100">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-primary-600 hover:underline focus:outline-none">
            Reset
          </button>
        )}
      </div>

      {/* Trade */}
      <div>
        <label htmlFor="filter-trade" className={labelClass}>Service Type</label>
        <select id="filter-trade" value={filters.trade} onChange={(e) => set('trade', e.target.value)} className={selectClass}>
          <option value="">All Services</option>
          {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="filter-location" className={labelClass}>Location</label>
        <input
          id="filter-location"
          type="text"
          value={filters.location}
          onChange={(e) => set('location', e.target.value)}
          placeholder="City or state..."
          className={inputClass}
        />
      </div>

      {/* Min Rating */}
      <div>
        <label htmlFor="filter-rating" className={labelClass}>
          Min Rating: <span className="text-primary-600 normal-case font-bold">{filters.minRating > 0 ? `${filters.minRating}★` : 'Any'}</span>
        </label>
        <input
          id="filter-rating"
          type="range"
          min={0} max={5} step={0.5}
          value={filters.minRating}
          onChange={(e) => set('minRating', parseFloat(e.target.value))}
          className="w-full accent-primary-600 mt-1"
        />
        <div className="flex justify-between text-xs text-slate mt-1">
          <span>Any</span><span>5 ★</span>
        </div>
      </div>

      {/* Tier */}
      <div>
        <p className={labelClass}>Tier Level</p>
        <div className="space-y-1.5">
          {TIERS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tier"
                value={value}
                checked={filters.tier === value}
                onChange={() => set('tier', value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-ink group-hover:text-primary-600 transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ArtisanFilters);
