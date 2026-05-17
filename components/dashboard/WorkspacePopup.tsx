// 'use client';

// import { useState, useEffect } from 'react';
// import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface WorkspaceAlert {
//   id: string;
//   title: string;
//   message: string;
//   type: string;
//   isDismissible: boolean;
//   linkUrl?: string;
// }

// export function WorkspacePopup({ workspaceId }: { workspaceId: string }) {
//   const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
//   const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

//   useEffect(() => {
//     if (workspaceId) {
//       fetchAlerts();
//     }
//   }, [workspaceId]);

//   const fetchAlerts = async () => {
//     try {
//       const res = await fetch(`/api/workspace/${workspaceId}/alerts`);
//       const data = await res.json();
//       if (data.status === 'success') {
//         setAlerts(data.data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch alerts');
//     }
//   };

//   const dismissAlert = async (alertId: string) => {
//     try {
//       await fetch(`/api/workspace/${workspaceId}/alerts`, {
//         method: 'PATCH',
//         body: JSON.stringify({ alertId }),
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setAlerts(prev => prev.filter(a => a.id !== alertId));
//       if (currentAlertIndex >= alerts.length - 1 && currentAlertIndex > 0) {
//         setCurrentAlertIndex(currentAlertIndex - 1);
//       }
//     } catch (error) {
//       console.error('Failed to dismiss alert');
//     }
//   };

//   if (alerts.length === 0) return null;

//   const currentAlert = alerts[currentAlertIndex];

//   const iconMap: Record<string, any> = {
//     info: <Info className="text-blue-500" size={24} />,
//     warning: <AlertTriangle className="text-amber-500" size={24} />,
//     success: <CheckCircle className="text-green-500" size={24} />,
//     error: <AlertCircle className="text-red-500" size={24} />,
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.9, y: 20 }}
//         className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-6 overflow-hidden"
//       >
//         <div className="flex gap-4">
//           <div className="flex-shrink-0">
//             {iconMap[currentAlert.type] || iconMap.info}
//           </div>
//           <div className="flex-1 min-w-0">
//             <h3 className="text-sm font-bold text-gray-900 truncate">
//               {currentAlert.title}
//             </h3>
//             <p className="mt-1 text-sm text-gray-500 line-clamp-3">
//               {currentAlert.message}
//             </p>
//             {currentAlert.linkUrl && (
//               <a 
//                 href={currentAlert.linkUrl}
//                 className="mt-3 inline-block text-xs font-bold text-red-600 hover:text-red-700"
//               >
//                 Learn More →
//               </a>
//             )}
//           </div>
//           {currentAlert.isDismissible && (
//             <button 
//               onClick={() => dismissAlert(currentAlert.id)}
//               className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X size={18} />
//             </button>
//           )}
//         </div>
        
//         {alerts.length > 1 && (
//           <div className="mt-4 flex justify-center gap-1">
//             {alerts.map((_, i) => (
//               <div 
//                 key={i} 
//                 className={`h-1 rounded-full transition-all ${i === currentAlertIndex ? 'w-4 bg-red-600' : 'w-1 bg-gray-200'}`}
//               />
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );
// }








'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  isDismissible: boolean;
  linkUrl?: string;
}

// Welcome alert configuration
const WELCOME_ALERT: WorkspaceAlert = {
  id: 'welcome-dropaphi',
  title: 'Welcome to Dropaphi! 🎉',
  message: 'Thank you for choosing Dropaphi. Start by exploring our features or topping up your wallet to get started.',
  type: 'info',
  isDismissible: true,
  linkUrl: '/dashboard/help',
};

export function WorkspacePopup({ workspaceId }: { workspaceId: string }) {
  const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasDismissedWelcome, setHasDismissedWelcome] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchAlerts();
      // Check if welcome alert has been dismissed before
      const dismissed = localStorage.getItem(`welcome_dismissed_${workspaceId}`);
      setHasDismissedWelcome(dismissed === 'true');
    }
  }, [workspaceId]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/workspace/${workspaceId}/alerts`);
      const data = await res.json();
      if (data.status === 'success') {
        setAlerts(data.data);
        // Show welcome alert only if no real alerts and not dismissed before
        if (data.data.length === 0 && !hasDismissedWelcome) {
          setShowWelcome(true);
        } else {
          setShowWelcome(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch alerts');
      // Show welcome alert on error if not dismissed
      if (!hasDismissedWelcome) {
        setShowWelcome(true);
      }
    }
  };

  const dismissWelcomeAlert = () => {
    setShowWelcome(false);
    // Store dismissal in localStorage
    localStorage.setItem(`welcome_dismissed_${workspaceId}`, 'true');
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

  // Determine which alert to show
  const getCurrentAlert = (): WorkspaceAlert | null => {
    if (alerts.length > 0) {
      return alerts[currentAlertIndex];
    }
    if (showWelcome) {
      return WELCOME_ALERT;
    }
    return null;
  };

  const currentAlert = getCurrentAlert();
  
  if (!currentAlert) return null;

  // Handle dismiss for welcome alert
  const handleDismiss = () => {
    if (currentAlert.id === 'welcome-dropaphi') {
      dismissWelcomeAlert();
    } else {
      dismissAlert(currentAlert.id);
    }
  };

  const iconMap: Record<string, any> = {
    info: <Info className="text-blue-500" size={24} />,
    warning: <AlertTriangle className="text-amber-500" size={24} />,
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
  };

  // Custom icon for welcome alert
  const getIcon = () => {
    if (currentAlert.id === 'welcome-dropaphi') {
      return <Sparkles className="text-purple-500" size={24} />;
    }
    return iconMap[currentAlert.type] || iconMap.info;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 overflow-hidden"
      >
        <div className="flex gap-4">
          <div className="shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {currentAlert.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
              {currentAlert.message}
            </p>
            {currentAlert.linkUrl && (
              <a 
                href={currentAlert.linkUrl}
                className="mt-3 inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Learn More →
              </a>
            )}
          </div>
          {currentAlert.isDismissible && (
            <button 
              onClick={handleDismiss}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Pagination dots for real alerts only */}
        {alerts.length > 1 && (
          <div className="mt-4 flex justify-center gap-1">
            {alerts.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i === currentAlertIndex ? 'w-4 bg-purple-600 dark:bg-purple-400' : 'w-1 bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}