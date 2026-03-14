'use client';

import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { Building2, Mail, MessageSquare, Users } from 'lucide-react';

export function TopWorkspaces() {
  const { topWorkspaces } = useDashboardStore();

  return (
    <div className="border rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <h2 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>Top Workspaces by Usage</h2>

      <div className="space-y-4">
        {topWorkspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="p-4 rounded-lg"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: '#666666' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                    {workspace.name}
                  </p>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    {workspace.owner}
                  </p>
                </div>
              </div>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: workspace.plan === 'BUSINESS' ? '#FFE5E5' : '#E8F5E9',
                  color: workspace.plan === 'BUSINESS' ? '#B81C1C' : '#2E7D32',
                }}
              >
                {workspace.plan}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <Mail size={14} className="mx-auto mb-1" style={{ color: '#666666' }} />
                <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                  {workspace.emailsSent.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#999999' }}>Emails</p>
              </div>
              <div className="text-center">
                <MessageSquare size={14} className="mx-auto mb-1" style={{ color: '#666666' }} />
                <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                  {workspace.smsSent.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#999999' }}>SMS</p>
              </div>
              <div className="text-center">
                <Users size={14} className="mx-auto mb-1" style={{ color: '#666666' }} />
                <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                  {workspace.subscribers.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#999999' }}>Subscribers</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}