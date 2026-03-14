'use client';

import { WorkspaceOverview } from '@/lib/stores/dashboard/dashboard';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle, DollarSign } from 'lucide-react';

interface QuickStatsProps {
  overview: WorkspaceOverview | null;
  isLoading: boolean;
}

export function QuickStats({ overview, isLoading }: QuickStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-lg border animate-pulse"
            style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5' }}
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Messages This Month',
      value: overview ? (overview.stats.monthly.sms + overview.stats.monthly.email + overview.stats.monthly.otp).toLocaleString() : '0',
      icon: TrendingUp,
      color: '#DC143C',
    },
    {
      label: 'API Calls',
      value: overview ? (overview.stats.total.sms + overview.stats.total.email + overview.stats.total.otp).toLocaleString() : '0',
      icon: Zap,
      color: '#4CAF50',
    },
    {
      label: 'Success Rate',
      value: overview ? `${Math.round(
        (overview.stats.success.sms + overview.stats.success.email + overview.stats.success.otp) / 3
      )}%` : '0%',
      icon: CheckCircle,
      color: '#2196F3',
    },
    // {
    //   label: 'Credit Balance',
    //   value: '—',
    //   icon: DollarSign,
    //   color: '#FF9800',
    // },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E5E5',
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm" style={{ color: '#999999' }}>
                {stat.label}
              </p>
              <Icon size={18} style={{ color: stat.color, opacity: 0.5 }} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </motion.div>
  );
}