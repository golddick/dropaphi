'use client';

import Link from 'next/link';
import { MessageSquare, Mail, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SMSActivity {
  id: string;
  recipient: string;
  message: string;
  status: string;
  createdAt: string;
  type: 'sms';
}

interface EmailActivity {
  id: string;
  subject: string;
  to: string;
  status: string;
  createdAt: string;
  type: 'email';
}

type ActivityItem = SMSActivity | EmailActivity;

interface RecentActivityProps {
  sms: Array<{
    id: string;
    recipient: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
  emails: Array<{
    id: string;
    subject: string;
    to: string;
    status: string;
    createdAt: string;
  }>;
  workspaceId: string;
}

export function RecentActivity({ sms, emails, workspaceId }: RecentActivityProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return <CheckCircle size={14} style={{ color: '#4CAF50' }} />;
      case 'failed':
      case 'bounced':
        return <XCircle size={14} style={{ color: '#DC143C' }} />;
      default:
        return <Clock size={14} style={{ color: '#FF9800' }} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Create typed activity items
  const allActivity: ActivityItem[] = [
    ...sms.map(s => ({ ...s, type: 'sms' as const })),
    ...emails.map(e => ({ ...e, type: 'email' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allActivity.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <p style={{ color: '#999999' }}>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
        <h2 className="font-bold" style={{ color: '#1A1A1A' }}>Recent Activity</h2>
      </div>

      <div className="divide-y" style={{ borderColor: '#E5E5E5' }}>
        {allActivity.slice(0, 10).map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg shrink-0"
                style={{ backgroundColor: activity.type === 'sms' ? 'rgba(220,20,60,0.1)' : 'rgba(76,175,80,0.1)' }}
              >
                {activity.type === 'sms' ? (
                  <MessageSquare size={16} style={{ color: '#DC143C' }} />
                ) : (
                  <Mail size={16} style={{ color: '#4CAF50' }} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>
                    {activity.type === 'sms' ? activity.recipient : activity.subject}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                    backgroundColor: activity.type === 'sms' ? 'rgba(220,20,60,0.1)' : 'rgba(76,175,80,0.1)',
                    color: activity.type === 'sms' ? '#DC143C' : '#4CAF50',
                  }}>
                    {activity.type.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-xs mb-1" style={{ color: '#666666' }}>
                  {activity.type === 'sms' ? activity.message : `To: ${activity.to}`}
                </p>
                
                <div className="flex items-center gap-3 text-xs" style={{ color: '#999999' }}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(activity.status)}
                    <span className="capitalize">{activity.status}</span>
                  </div>
                  <span>•</span>
                  <span>{formatTime(activity.createdAt)}</span>
                </div>
              </div>

              <Link 
                href={`/dashboard/${workspaceId}/${activity.type === 'sms' ? 'sms' : 'email'}/${activity.id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye size={16} style={{ color: '#999999' }} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t" style={{ borderColor: '#E5E5E5' }}>
        <Link 
          href={`/dashboard/${workspaceId}/activity`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#DC143C' }}
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}