'use client';

import { useAuthStore } from '@/lib/stores/auth';
import { Menu, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceSelector } from '../workspace/workspace-selector';

export function DashboardHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const { user } = useAuthStore();
  return (
    <header
      className="border-b px-4 sm:px-6 lg:px-8 py-4"
      style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
    >
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
            {/* <WorkspaceSelector /> */}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Help Button */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <HelpCircle size={20} />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell size={20} />
            <div
              className="absolute top-1 right-1 h-2 w-2 rounded-full"
              style={{ backgroundColor: '#DC143C' }}
            />
          </Button>

          {/* User Menu */}
          <div
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l"
            style={{ borderColor: '#E5E5E5' }}
          >
            <div className="hidden sm:flex flex-col items-end text-right">
              <p className="text-sm font-medium capitalize" style={{ color: '#1A1A1A' }}>
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs" style={{ color: '#999999' }}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white text-sm"
              style={{ backgroundColor: '#DC143C' }}
            >
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
