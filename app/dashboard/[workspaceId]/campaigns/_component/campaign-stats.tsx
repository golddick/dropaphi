// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/campaign-stats.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown, 
  ClipboardCheckIcon,
  BookOpenCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignStatsProps {
  stats: {
    totalSent: number;
    totalClicked: number;
    totalCampaigns:number;
    totalDelivered:number;
    totalOpened:number;
    averageOpenRate: number;
    bounceRate: number;
    averageClickRate: number;
  } | null;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  change,
  subtitle 
}: any) => (




  <Card className="hover:shadow-lg transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.positive ? (
                <TrendingUp size={12} className="text-green-500" />
              ) : (
                <TrendingDown size={12} className="text-red-500" />
              )}
            </div>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-full",
          color === 'red' && "bg-red-100 text-red-600",
          color === 'blue' && "bg-blue-100 text-blue-600",
          color === 'green' && "bg-green-100 text-green-600",
          color === 'yellow' && "bg-yellow-100 text-yellow-600",
          color === 'purple' && "bg-purple-100 text-purple-600",
        )}>
          <Icon size={24} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function CampaignStats({ stats }: CampaignStatsProps) {
  if (!stats) return null;

    console.log(stats, ' stats comp')
    console.log(stats.totalCampaigns, ' total stats comp')

  const totalDelivered = stats.totalDelivered;
  const openRate = stats.averageOpenRate;
  const clickRate = stats.averageClickRate;
  const bounceRate = stats.bounceRate;
  const totalCampaign = stats.totalCampaigns;
  const totalSent = stats.totalSent


  

  return (
    <div className="grid md:grid-cols-4  lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Campaigns"
        value={totalCampaign}
        icon={Mail}
        color="blue"
 
      />
      <StatCard
        title="Emails Sent"
        value={totalSent}
        icon={Send}
        color="green"
      />

      <StatCard
        title="Delivered"
        value={totalDelivered}
        icon={CheckCircle}
        color="green"

      />
      <StatCard
        title="Avg Open Rate"
        value={openRate}
        icon={BookOpenCheck}
        color="red"
      />

      <StatCard
        title="Bounced"
        value={bounceRate}
        icon={AlertCircle}
        color="red"
      />
    </div>
  );
}