'use client';

import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  MessageSquare,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from './stat-card';

export function StatsGrid() {
  const { stats } = useDashboardStore();

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Users',
      value: stats.users.total.toLocaleString(),
      subValue: `${stats.users.growth}% growth`,
      icon: Users,
      color: '#DC143C',
      trend: stats.users.growth,
    },
    {
      label: 'Active Users',
      value: stats.users.active.toLocaleString(),
      subValue: `${stats.users.pending} pending`,
      icon: Activity,
      color: '#4CAF50',
    },
    {
      label: 'Workspaces',
      value: stats.workspaces.total.toLocaleString(),
      subValue: `${stats.workspaces.active} active`,
      icon: Building2,
      color: '#2196F3',
    },
    {
      label: 'Revenue (30d)',
      value: `₦${stats.revenue.thisPeriod.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
      subValue: `Net: ₦${stats.revenue.net.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: '#FFA500',
    },
    {
      label: 'API Calls',
      value: (stats.api.thisPeriod / 1000000).toFixed(1) + 'M',
      subValue: `${(stats.api.totalCalls / 1000000).toFixed(1)}M total`,
      icon: TrendingUp,
      color: '#9C27B0',
    },
    {
      label: 'Emails',
      value: stats.communications.emails.thisPeriod.toLocaleString(),
      subValue: `${stats.communications.emails.total.toLocaleString()} total`,
      icon: Mail,
      color: '#FF5722',
    },
    {
      label: 'SMS',
      value: stats.communications.sms.thisPeriod.toLocaleString(),
      subValue: `${stats.communications.sms.total.toLocaleString()} total`,
      icon: MessageSquare,
      color: '#009688',
    },
    {
      label: 'Pending Tx',
      value: stats.transactions.pending.toString(),
      subValue: `${stats.transactions.failed} failed`,
      icon: AlertCircle,
      color: '#F44336',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </motion.div>
  );
}