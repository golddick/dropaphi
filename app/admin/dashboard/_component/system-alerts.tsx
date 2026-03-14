'use client';

import { useDashboardStore } from '@/lib/stores/admin/store/dashboard';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function SystemAlerts() {
  const { alerts } = useDashboardStore();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} style={{ color: '#DC143C' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#FF9800' }} />;
      default:
        return <Info size={18} style={{ color: '#2196F3' }} />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#FFE5E5';
      case 'warning':
        return '#FFF3E0';
      default:
        return '#E3F2FD';
    }
  };

  return (
    <div className="border rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
      <h2 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>System Alerts</h2>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm" style={{ color: '#666666' }}>No alerts at this time</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: getAlertBgColor(alert.type) }}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                  {alert.message}
                </p>
                <p className="text-xs mt-1" style={{ color: '#666666' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}