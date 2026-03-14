// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/campaign-details.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Copy, Send, X, TrendingUp, MousePointer, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CampaignDetailsProps {
  campaign: any;
  onClose: () => void;
}

export function CampaignDetails({ campaign, onClose }: CampaignDetailsProps) {
  const stats = campaign.stats || {
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
  };

  const total = stats.sent;
  const totalDelivered = stats.totalDelivered;
  const openRate = stats.averageOpenRate;
  const clickRate = stats.averageClickRate;
  const bounceRate = stats.bounceRate;
  const totalCampaign = stats.totalCampaigns;
  const totalSent = stats.totalSent

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2 capitalize">{campaign.name}</CardTitle>
              <p className="text-gray-600 mb-2 capitalize">{campaign.subject}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created {format(new Date(campaign.createdAt), 'MMM d, yyyy')}</span>
                <span>•</span>
                <Badge variant={campaign.status === 'SENT' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Delivered</p>
                <p className="text-2xl font-bold">{totalDelivered}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Opened</p>
                {/* <p className="text-2xl font-bold text-blue-600">{stats.opened.toLocaleString()}</p> */}
                <p className="text-xs text-gray-400 mt-1">{openRate}% rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Clicked</p>
                <p className="text-2xl font-bold text-purple-600">{stats.clicked.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{clickRate}% of opens</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Bounced</p>
                <p className="text-2xl font-bold text-red-600">{stats.bounced.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{bounceRate}% rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Opens per Email</p>
                  <p className="text-2xl font-bold">
                    {total > 0 ? (stats.opened / total).toFixed(2) : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Clicks per Email</p>
                  <p className="text-2xl font-bold">
                    {total > 0 ? (stats.clicked / total).toFixed(2) : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Clicks per Open</p>
                  <p className="text-2xl font-bold">
                    {stats.opened > 0 ? (stats.clicked / stats.opened).toFixed(2) : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Emails */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>user{i}@example.com</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          DELIVERED
                        </Badge>
                      </TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>{format(new Date(), 'MMM d, HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}