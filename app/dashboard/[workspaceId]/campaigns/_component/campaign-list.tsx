// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/campaign-list-item.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Edit, MoreVertical, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CampaignListItemProps {
  campaign: any;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onCopyId: () => void;
}

export function CampaignListItem({ 
  campaign, 
  isSelected, 
  onSelect, 
  onDelete,
  onCopyId 
}: CampaignListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500';
      case 'SCHEDULED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const openRate = campaign.stats?.sent 
    ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)
    : '0';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all",
        isSelected ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-red-300"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getStatusColor(campaign.status))} />
          <h3 className="font-semibold line-clamp-1 capitalize">{campaign.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopyId(); }}>
                <Copy size={14} className="mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Edit size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Send size={14} className="mr-2" />
                Send Now
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2 capitalize">{campaign.subject}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">Open Rate</p>
          <p className="text-lg font-semibold text-blue-600">{openRate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Clicked</p>
          <p className="text-lg font-semibold text-purple-600">{campaign.stats?.clicked || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Created {format(new Date(campaign.createdAt), 'MMM d, yyyy')}</span>
        {campaign.sentAt && (
          <span>Sent {format(new Date(campaign.sentAt), 'MMM d')}</span>
        )}
      </div>
    </motion.div>
  );
}