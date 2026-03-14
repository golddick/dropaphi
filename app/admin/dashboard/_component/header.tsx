'use client';

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { PeriodSelector } from './period-selector';

export function DashboardHeader() {
  const { refreshData, lastUpdated } = useDashboardStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#666666' }}>
          Platform overview and analytics
          {lastUpdated && (
            <span className="ml-2 text-xs">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <PeriodSelector />
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
    </motion.div>
  );
}