import React from 'react';

export interface WaybillData {
  jobId: string;
  from: string;
  to: string;
  distanceKm: number;
  courier: string;
  waybillRef: string;
}

interface WaybillCardProps {
  waybill: WaybillData;
}

const WaybillCard: React.FC<WaybillCardProps> = ({ waybill }) => {
  // Only shown for interstate jobs (distance > 100km)
  if (waybill.distanceKm <= 100) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-200 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-blue-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-blue-800">Interstate Waybill</h3>
      </div>
      <div className="px-4 py-3 space-y-2">
        <WaybillRow label="Waybill Ref" value={waybill.waybillRef} mono />
        <WaybillRow label="From" value={waybill.from} />
        <WaybillRow label="To" value={waybill.to} />
        <WaybillRow label="Distance" value={`${waybill.distanceKm.toLocaleString()} km`} />
        <WaybillRow label="Courier" value={waybill.courier} />
        <WaybillRow label="Job ID" value={waybill.jobId} mono />
      </div>
    </div>
  );
};

const WaybillRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono = false,
}) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-xs text-blue-600 font-medium w-24 flex-shrink-0">{label}</span>
    <span className={`text-sm text-blue-900 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export default WaybillCard;
