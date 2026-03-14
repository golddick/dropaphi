'use client';

import { LucideIcon } from 'lucide-react';

interface UsageProgressProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  color: string;
  icon: LucideIcon;
  unit?: string;
}

export function UsageProgress({ 
  title, 
  used, 
  limit, 
  percentage, 
  color, 
  icon: Icon,
  unit = ''
}: UsageProgressProps) {
  const getProgressColor = () => {
    if (percentage >= 90) return '#DC143C';
    if (percentage >= 75) return '#FF9800';
    return color;
  };

  return (
    <div 
      className="p-6 rounded-lg border"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}10` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: '#1A1A1A' }}>
              {title}
            </h3>
            <p className="text-xs" style={{ color: '#999999' }}>
              {used.toLocaleString()} / {limit.toLocaleString()} {unit}
            </p>
          </div>
        </div>
        <span 
          className="text-sm font-bold"
          style={{ color: getProgressColor() }}
        >
          {percentage}%
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </div>

      {percentage >= 90 && (
        <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#DC143C' }}>
          <span>⚠️</span> Approaching limit. Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}