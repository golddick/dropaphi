'use client';

import { useDashboardStore } from "@/lib/stores/admin/store/dashboard";


const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
] as const;

export function PeriodSelector() {
  const { period, setPeriod } = useDashboardStore();

  return (
    <select
      value={period}
      onChange={(e) => setPeriod(e.target.value as typeof period)}
      className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
      style={{ borderColor: '#E5E5E5',  }}
    >
      {periods.map(p => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}