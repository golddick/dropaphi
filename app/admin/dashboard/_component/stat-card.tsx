'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  color: string;
  trend?: number;
}

export function StatCard({ label, value, subValue, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div
      className="p-6 border rounded-lg transition-shadow hover:shadow-md"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E5E5',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p style={{ color: '#999999' }} className="text-xs font-bold uppercase">
          {label}
        </p>
        <Icon size={20} style={{ color, opacity: 0.5 }} />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs mt-1" style={{ color: '#666666' }}>
              {subValue}
            </p>
          )}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}