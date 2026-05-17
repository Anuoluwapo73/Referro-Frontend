import React from 'react';
import { formatCurrency } from '../../utils/formatting';

interface CostBreakdownProps {
  budget: number;
  waybillFee: number;
  insuranceFee: number;
  total: number;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({ budget, waybillFee, insuranceFee, total }) => {
  const rows = [
    { label: 'Job Budget', amount: budget },
    { label: 'Waybill Fee', amount: waybillFee },
    { label: 'Insurance Fee', amount: insuranceFee },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Cost Breakdown</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map(({ label, amount }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-50">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-primary-700">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
