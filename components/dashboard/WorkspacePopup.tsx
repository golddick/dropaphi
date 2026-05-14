'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  isDismissible: boolean;
  linkUrl?: string;
}

export function WorkspacePopup({ workspaceId }: { workspaceId: string }) {
  const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  useEffect(() => {
    if (workspaceId) {
      fetchAlerts();
    }
  }, [workspaceId]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/workspace/${workspaceId}/alerts`);
      const data = await res.json();
      if (data.status === 'success') {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/workspace/${workspaceId}/alerts`, {
        method: 'PATCH',
        body: JSON.stringify({ alertId }),
        headers: { 'Content-Type': 'application/json' },
      });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      if (currentAlertIndex >= alerts.length - 1 && currentAlertIndex > 0) {
        setCurrentAlertIndex(currentAlertIndex - 1);
      }
    } catch (error) {
      console.error('Failed to dismiss alert');
    }
  };

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentAlertIndex];

  const iconMap: Record<string, any> = {
    info: <Info className="text-blue-500" size={24} />,
    warning: <AlertTriangle className="text-amber-500" size={24} />,
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-6 overflow-hidden"
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {iconMap[currentAlert.type] || iconMap.info}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {currentAlert.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-3">
              {currentAlert.message}
            </p>
            {currentAlert.linkUrl && (
              <a 
                href={currentAlert.linkUrl}
                className="mt-3 inline-block text-xs font-bold text-red-600 hover:text-red-700"
              >
                Learn More →
              </a>
            )}
          </div>
          {currentAlert.isDismissible && (
            <button 
              onClick={() => dismissAlert(currentAlert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {alerts.length > 1 && (
          <div className="mt-4 flex justify-center gap-1">
            {alerts.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i === currentAlertIndex ? 'w-4 bg-red-600' : 'w-1 bg-gray-200'}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
