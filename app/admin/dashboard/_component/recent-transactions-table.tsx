'use client';

import { useDashboardStore } from "@/lib/stores/admin/store/dashboard";


export function RecentTransactionsTable() {
  const { recentTransactions } = useDashboardStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pending':
        return { bg: '#FFF3E0', text: '#F57C00' };
      case 'failed':
        return { bg: '#FFE5E5', text: '#B81C1C' };
      default:
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
        <h2 className="font-bold" style={{ color: '#1A1A1A' }}>Recent Transactions</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Workspace</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Type</th>
              <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Amount</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx, idx) => {
              const statusColors = getStatusColor(tx.status);
              return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: idx < recentTransactions.length - 1 ? '1px solid #E5E5E5' : 'none'
                  }}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                      {tx.workspaceName}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {formatType(tx.type)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold" style={{ color: '#1A1A1A' }}>
                      ₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: '#999999' }}>
                      {tx.createdAt}
                    </p>
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