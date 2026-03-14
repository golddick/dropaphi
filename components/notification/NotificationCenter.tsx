// components/notifications/NotificationCenter.tsx
'use client';

import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/stores/notification.store';
import { formatDistanceToNow } from 'date-fns';
import { Check, Archive, Bell, X } from 'lucide-react';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archive,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      PAYMENT_SUCCESS: '💰',
      SUBSCRIPTION_RENEWED: '🔄',
      SUBSCRIPTION_EXPIRING: '⚠️',
      CARD_EXPIRING: '💳',
      PROMO_APPLIED: '🏷️',
    };
    return icons[type] || '📬';
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      PAYMENT_SUCCESS: 'text-green-500',
      SUBSCRIPTION_RENEWED: 'text-blue-500',
      SUBSCRIPTION_EXPIRING: 'text-yellow-500',
      CARD_EXPIRING: 'text-orange-500',
      PROMO_APPLIED: 'text-purple-500',
    };
    return colors[type] || 'text-gray-500';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                    notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`text-2xl ${getColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {notification.actionLabel || 'View details'} →
                        </a>
                      )}
                      <div className="flex gap-2 mt-2">
                        {notification.status === 'UNREAD' && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                        <button
                          onClick={() => archive(notification.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <Archive className="w-3 h-3" /> Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}