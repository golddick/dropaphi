// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/campaign-header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export function CampaignHeader({ onRefresh, refreshing }: CampaignHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Campaigns</h1>
        <p className="text-gray-600">
          Manage and monitor your email campaigns and templates
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={cn("mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
        {/* <Button onClick={onNewCampaign} style={{ backgroundColor: '#DC143C' }}>
          <Plus size={16} className="mr-2" />
          New Campaign
        </Button> */}
      </div>
    </div>
  );
}