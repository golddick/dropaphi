// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/template-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy, Edit, Send, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface TemplateCardProps {
  template: any;
  onPreview: () => void;
  onCopyId: () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, onPreview, onCopyId, onDelete }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1 capitalize">{template.name}</CardTitle>
            <CardDescription className="line-clamp-1 capitalize">{template.subject}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye size={14} className="mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopyId}>
                <Copy size={14} className="mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <Send size={14} className="mr-2" />
                Use in Campaign
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-500">Used</p>
              <p className="font-medium">{template.stats?.usedCount || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Open Rate</p>
              <p className="font-medium text-green-600">
                {template.stats?.avgOpenRate?.toFixed(1) || '0'}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Click Rate</p>
              <p className="font-medium text-blue-600">
                {template.stats?.avgClickRate?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
}