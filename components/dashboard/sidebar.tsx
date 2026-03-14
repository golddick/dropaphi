
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import {
  BarChart3,
  MessageSquare,
  Mail,
  Lock,
  FileText,
  Files,
  Key,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceID } from '@/lib/id/workspace';
import { WorkspaceSelector } from '../workspace/workspace-selector';




export function DashboardSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  
  // Get the actual workspace ID from the store or from the URL
  const workspaceId = useWorkspaceID();

  const menuItems = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: `/dashboard/${workspaceId}/overview`,
  },
  {
    label: 'Services',
    items: [
      { label: 'SMS', icon: MessageSquare, href: `/dashboard/${workspaceId}/sms` },
      { label: 'Email', icon: Mail, href: `/dashboard/${workspaceId}/email` },
      { label: 'OTP', icon: Lock, href: `/dashboard/${workspaceId}/otp` },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Subscribers', icon: Users, href: `/dashboard/${workspaceId}/subscribers` },
      { label: 'File Manager', icon: FileText, href: `/dashboard/${workspaceId}/file-manager` },
      { label: 'Email Manager', icon: Files, href: `/dashboard/${workspaceId}/email-manager` },
      { label: 'campaigns Manager', icon: Mail, href: `/dashboard/${workspaceId}/campaigns` },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'API Keys', icon: Key, href: `/dashboard/${workspaceId}/api-keys` },
      { label: 'Billing', icon: TrendingUp, href: `/dashboard/${workspaceId}/billing` },
      { label: 'Team', icon: Users, href: `/dashboard/${workspaceId}/team` },
      { label: 'Settings', icon: Settings, href: `/dashboard/${workspaceId}/settings/workspace` },
    ],
  },
];


  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          marginLeft: open ? 0 : '-100%',
        }}
        transition={{ duration: 0.3 }}
        className="fixed lg:relative z-40 h-full w-60 lg:w-auto lg:min-w-fit"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        <div className="flex flex-col h-full p-4 w-60">
          {/* Header */}
          <div className="flex items-center  justify-between ">
            <div className="flex items-center w-full  justify-between mb-4">
              <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                D
              </div>
              <span className="hidden sm:inline font-bold text-lg" style={{ color: '#1A1A1A' }}>
                Drop APHI
              </span>
            </Link>
              <button
                onClick={() => onOpenChange(false)}
                className="lg:hidden text-white hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

          </div>

            {/* Workspace Selector */}
            <WorkspaceSelector />

          {/* Navigation */}
          <nav className="flex-1 hidden-scrollbar  overflow-y-auto space-y-6">
            {menuItems.map((group, idx) => (
              <div key={idx}>
                {'items' in group ? (
                  <>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider px-2 mb-3"
                      style={{ color: '#999999' }}
                    >
                      {group.label}
                    </h3>
                    <div className="space-y-1">
                      {('items' in group && group.items) && group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div
                              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                              style={{
                                backgroundColor: isActive
                                  ? 'rgba(220, 20, 60, 0.15)'
                                  : 'transparent',
                                color: isActive ? '#DC143C' : '#999999',
                              }}
                            >
                              <Icon size={18} />
                              <span className="text-sm">{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Link href={group.href}>
                    <div
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      style={{
                        backgroundColor:
                          pathname === group.href
                            ? 'rgba(220, 20, 60, 0.15)'
                            : 'transparent',
                        color:
                          pathname === group.href ? '#DC143C' : '#999999',
                      }}
                    >
                      {group.icon && <group.icon size={18} />}
                      <span className="text-sm">{group.label}</span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div
            className="pt-6 border-t"
            style={{ borderColor: '#333333' }}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full"
              style={{
                color: '#999999',
              }}
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
