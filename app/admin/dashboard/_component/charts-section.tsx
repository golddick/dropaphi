'use client';

import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChartsSection() {
  const { charts } = useDashboardStore();

  return (
    <div className="space-y-6">
      {/* User Growth Chart */}
      <div className="border rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>User Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="date" 
                stroke="#999999"
                tick={{ fill: '#999999', fontSize: 12 }}
              />
              <YAxis 
                stroke="#999999"
                tick={{ fill: '#999999', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#DC143C" 
                strokeWidth={2}
                dot={{ fill: '#DC143C', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="border rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>Revenue</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="date" 
                stroke="#999999"
                tick={{ fill: '#999999', fontSize: 12 }}
              />
              <YAxis 
                stroke="#999999"
                tick={{ fill: '#999999', fontSize: 12 }}
                tickFormatter={(value) => `₦${value/1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="amount" fill="#DC143C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}