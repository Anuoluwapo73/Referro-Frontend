import React from 'react';

interface TrustBadgeProps {
  score: number;
  /** 'sm' for compact inline use (cards), 'md' for profile view */
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

function getTrustLevel(score: number): { label: string; className: string; icon: string } {
  if (score >= 8) return { label: 'High Trust', className: 'bg-emerald-100 text-emerald-700', icon: '🛡️' };
  if (score >= 5) return { label: 'Good Trust', className: 'bg-blue-100 text-blue-700', icon: '✅' };
  if (score >= 2) return { label: 'Building Trust', className: 'bg-yellow-100 text-yellow-700', icon: '⭐' };
  return { label: 'New', className: 'bg-gray-100 text-gray-600', icon: '🔰' };
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ score, size = 'sm', showLabel = false }) => {
  const clamped = Math.min(10, Math.max(0, score));
  const { label, className, icon } = getTrustLevel(clamped);

  if (size === 'md') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm ${className}`}
        aria-label={`Trust score: ${clamped.toFixed(1)} out of 10 — ${label}`}
        title={label}
      >
        <span aria-hidden="true">{icon}</span>
        <span>{clamped.toFixed(1)}</span>
        {showLabel && <span className="text-xs opacity-75">/ 10 · {label}</span>}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      aria-label={`Trust score: ${clamped.toFixed(1)} — ${label}`}
      title={`Trust score: ${clamped.toFixed(1)} / 10`}
    >
      <span aria-hidden="true">{icon}</span>
      {clamped.toFixed(1)}
      {showLabel && <span className="opacity-75 ml-0.5">trust</span>}
    </span>
  );
};

export default TrustBadge;
