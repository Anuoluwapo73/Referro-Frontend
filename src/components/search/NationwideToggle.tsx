import React from 'react';

interface NationwideToggleProps {
  nationwide: boolean;
  onChange: (nationwide: boolean) => void;
}

/**
 * Toggle between local (user's state) and nationwide artisan search.
 * Requirements: US-6.1, US-6.2
 */
const NationwideToggle: React.FC<NationwideToggleProps> = ({ nationwide, onChange }) => {
  return (
    <div
      className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1"
      role="group"
      aria-label="Search scope"
    >
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!nationwide}
        className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[40px] ${
          !nationwide
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        📍 Local
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={nationwide}
        className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[40px] ${
          nationwide
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        🌍 Nationwide
      </button>
    </div>
  );
};

export default React.memo(NationwideToggle);
