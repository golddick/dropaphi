'use client';

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';

export function RecentUsersTable() {
  const router = useRouter();
  const { recentUsers } = useDashboardStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pending_verification':
        return { bg: '#FFF3E0', text: '#F57C00' };
      case 'suspended':
        return { bg: '#FFE5E5', text: '#B81C1C' };
      default:
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
        <h2 className="font-bold" style={{ color: '#1A1A1A' }}>Recent Users</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>User</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Workspace</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Joined</th>
              <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user, idx) => {
              const statusColors = getStatusColor(user.status);
              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: idx < recentUsers.length - 1 ? '1px solid #E5E5E5' : 'none'
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: '#DC143C' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}
                    >
                      {user.status === 'pending_verification' ? 'Pending' : user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {user.workspace}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: '#999999' }}>
                      {user.joinedAt}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: '#DC143C' }}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}