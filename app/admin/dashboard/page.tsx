'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { DashboardHeader } from './_component/header';
import { StatsGrid } from './_component/stats-grid';
import { ChartsSection } from './_component/charts-section';
import { SystemAlerts } from './_component/system-alerts';
import { RecentUsersTable } from './_component/recent-users-table';
import { RecentTransactionsTable } from './_component/recent-transactions-table';
import { TopWorkspaces } from './_component/top-workspaces';
import { QuickActions } from './_component/quick-actions';

export default function AdminDashboardPage() {
  const { fetchDashboardData, isLoading, error, period } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#DC143C' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFE5E5', color: '#B81C1C' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader />
      <StatsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartsSection />
        </div>
        <div>
          <SystemAlerts />
        </div>
      </div>

      <div className=" w-full gap-6">
          <TopWorkspaces />
      </div>
    </div>
  );
}








