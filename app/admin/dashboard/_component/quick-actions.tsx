'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  MessageSquare,
  FileText,
  Settings,
} from 'lucide-react';

const actions = [
  { label: 'Users', icon: Users, href: '/admin/users', color: '#DC143C' },
  { label: 'Workspaces', icon: Building2, href: '/admin/workspaces', color: '#2196F3' },
  { label: 'Transactions', icon: DollarSign, href: '/admin/transactions', color: '#FFA500' },
  { label: 'API Usage', icon: Activity, href: '/admin/api-usage', color: '#9C27B0' },
  { label: 'Emails', icon: Mail, href: '/admin/emails', color: '#FF5722' },
  { label: 'SMS', icon: MessageSquare, href: '/admin/sms', color: '#009688' },
  { label: 'Reports', icon: FileText, href: '/admin/reports', color: '#795548' },
  { label: 'Settings', icon: Settings, href: '/admin/settings', color: '#607D8B' },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="border rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <h2 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>Quick Actions</h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              onClick={() => router.push(action.href)}
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto"
              style={{ borderColor: '#E5E5E5' }}
            >
              <Icon size={20} style={{ color: action.color, marginBottom: '8px' }} />
              <span className="text-xs" style={{ color: '#666666' }}>{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}