




// components/dashboard/workspace/_component/usage-chart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Loader2 } from 'lucide-react';
import { ChartDataPoint, ChartTotals, ChartRates } from '@/lib/stores/dashboard/dashboard';

interface UsageChartProps {
  data: ChartDataPoint[];
  totals?: ChartTotals | null;
  rates?: ChartRates | null;
  isLoading: boolean;
}

export function UsageChart({ data, totals, rates, isLoading }: UsageChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis 
              dataKey="date" 
              stroke="#666666" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis yAxisId="left" stroke="#666666" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#666666" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  sms: 'SMS',
                  email: 'Email',
                  otp: 'OTP',
                  emailOpens: 'Email Opens',
                  emailClicks: 'Email Clicks',
                  newSubscribers: 'New Subscribers',
                };
                return [value.toLocaleString(), labels[name] || name];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sms"
              stroke="#DC143C"
              strokeWidth={2}
              dot={{ r: 3, fill: '#DC143C' }}
              name="SMS"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="email"
              stroke="#4CAF50"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4CAF50' }}
              name="Email"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="otp"
              stroke="#FF9800"
              strokeWidth={2}
              dot={{ r: 3, fill: '#FF9800' }}
              name="OTP"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="emailOpens"
              stroke="#2196F3"
              strokeWidth={2}
              dot={{ r: 3, fill: '#2196F3' }}
              name="Email Opens"
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="emailClicks"
              stroke="#9C27B0"
              strokeWidth={2}
              dot={{ r: 3, fill: '#9C27B0' }}
              name="Email Clicks"
              strokeDasharray="3 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total SMS</p>
            <p className="text-2xl font-bold text-gray-900">{totals.sms.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Email</p>
            <p className="text-2xl font-bold text-gray-900">{totals.email.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total OTP</p>
            <p className="text-2xl font-bold text-gray-900">{totals.otp.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Email Opens</p>
            <p className="text-2xl font-bold text-gray-900">{totals.emailOpens.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Email Clicks</p>
            <p className="text-2xl font-bold text-gray-900">{totals.emailClicks.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">New Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{totals.newSubscribers.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Email Engagement Rates */}
      {rates && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600">Open Rate</p>
            <p className="text-3xl font-bold text-green-700">{rates.openRate}%</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-purple-600">Click Rate</p>
            <p className="text-3xl font-bold text-purple-700">{rates.clickRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
}