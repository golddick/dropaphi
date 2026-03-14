'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  User, 
  Key, 
  Shield, 
  Bell, 
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useWorkspaceID } from '@/lib/id/workspace';


export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { currentWorkspace } = useWorkspaceStore();
    
    // Get the actual workspace ID from the store or from the URL
    const workspaceId = useWorkspaceID();

    const settingsNavItems = [
  {
    name: 'Workspace',
    href: `/dashboard/${workspaceId}/settings/workspace`,
    icon: Building2,
    description: 'Manage your workspace settings'
  },
  {
    name: 'Profile',
    href: `/dashboard/${workspaceId}/settings/profile`,
    icon: User,
    description: 'Update your personal information'
  },
  {
    name: 'Security',
    href: `/dashboard/${workspaceId}/settings/security`,
    icon: Shield,
    description: 'Password and 2FA settings'
  },
  {
    name: 'SMS Settings',
    href: `/dashboard/${workspaceId}/settings/sms`,
    icon: MessageSquare,
    description: 'Configure SMS sender IDs'
  },
  {
    name: 'Email Settings',
    href: `/dashboard/${workspaceId}/settings/email`,
    icon: Mail,
    description: 'Manage email verification'
  },
  {
    name: 'Notifications',
    href: `/dashboard/${workspaceId}/settings/notifications`,
    icon: Bell,
    description: 'Configure notification preferences'
  },
];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-50 bg-white border-r border-gray-200 fixed h-full hidden-scrollbar overflow-y-auto hidden md:block">
        <div className="p-2">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Settings
          </h2>
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg"
        >
          <Building2 size={24} />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileNavOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg p-4 shadow-xl">
            <nav className="space-y-2">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive 
                        ? 'bg-red-50 text-red-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    <Icon size={20} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-50 p-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}