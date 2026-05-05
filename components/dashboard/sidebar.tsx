
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
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceID } from '@/lib/id/workspace';
import { WorkspaceSelector } from '../workspace/workspace-selector';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { useSubscriptionStore } from '@/lib/stores/subscription';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useTheme } from 'next-themes';
import { Wallet } from 'lucide-react';




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
  const { subscription, invoices, fetchSubscription, fetchInvoices } = useSubscriptionStore();
  const { overview, fetchOverview } = useDashboardStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);
  // Fix: ensure theme variables are defined via useTheme hook
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (currentWorkspace?.id) {
       // Refresh both stores
       fetchOverview(currentWorkspace.id);
       fetchSubscription();
    }
  }, [currentWorkspace?.id]);

  // Combined wallet data for more reliable display
  const wallet = overview?.wallet || (subscription?.credits ? {
     balance: subscription.balance || 0,
     smsCredits: subscription.credits.sms || 0,
     otpCredits: subscription.credits.otp || 0,
     emailCredits: subscription.credits.email || 0,
     blogCredits: subscription.credits.blog || 0,
     pushCredits: subscription.credits.push || 0,
     apiCredits: subscription.credits.api || 0,
     storageCredits: subscription.credits.storage || 0,
  } : null);

  
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
      // { label: 'SMS', icon: MessageSquare, href: `/dashboard/${workspaceId}/sms` },
      { label: 'Email', icon: Mail, href: `/dashboard/${workspaceId}/email` },
      // { label: 'OTP', icon: Lock, href: `/dashboard/${workspaceId}/otp` },
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


  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
        className="fixed lg:relative z-40 h-full w-60 lg:w-auto lg:min-w-fit border-r"
        style={{ 
          backgroundColor: 'var(--sidebar)',
          borderColor: 'var(--sidebar-border)'
        }}
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
              <span className="hidden sm:inline font-bold text-lg" style={{ color: 'var(--sidebar-foreground)' }}>
                Drop APHI
              </span>
            </Link>
              <button
                onClick={() => onOpenChange(false)}
                className="lg:hidden text-sidebar-foreground hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

          </div>

            {/* Workspace Selector */}
            <WorkspaceSelector />

            {/* Wallet Balance */}
            {wallet && (
              <div className="mx-2 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Wallet Balance</span>
                </div>
                <p className="text-lg font-bold text-foreground">₦{wallet.balance.toLocaleString()}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2">
                  {/*<div>*/}
                  {/*  <p className="text-[9px] text-muted-foreground uppercase">SMS</p>*/}
                  {/*  <p className="text-xs font-bold text-foreground">{wallet.smsCredits.toLocaleString()}</p>*/}
                  {/*</div>*/}
                  {/*<div>*/}
                  {/*  <p className="text-[9px] text-muted-foreground uppercase">OTP</p>*/}
                  {/*  <p className="text-xs font-bold text-foreground">{wallet.otpCredits.toLocaleString()}</p>*/}
                  {/*</div>*/}
                </div>
                <div className="mt-2 text-center">
                   <Link href={`/dashboard/${workspaceId}/billing`}>
                      <button className="text-[9px] font-medium text-primary hover:underline uppercase">Manage Wallet</button>
                   </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
          <nav className="flex-1 hidden-scrollbar  overflow-y-auto space-y-6">
            {menuItems.map((group, idx) => (
              <div key={idx}>
                {'items' in group ? (
                  <>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider px-2 mb-3 text-muted-foreground"
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
                                  ? 'hsl(var(--primary) / 0.15)'
                                  : 'transparent',
                                color: isActive ? 'hsl(var(--primary))' : 'var(--sidebar-foreground)',
                                opacity: isActive ? 1 : 0.8
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
                            ? 'hsl(var(--primary) / 0.15)'
                            : 'transparent',
                        color:
                          pathname === group.href ? 'hsl(var(--primary))' : 'var(--sidebar-foreground)',
                        opacity: pathname === group.href ? 1 : 0.8
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
            className="pt-6 border-t space-y-2"
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full"
                style={{
                  color: 'var(--sidebar-foreground)',
                  opacity: 0.8
                }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full"
              style={{
                color: 'var(--sidebar-foreground)',
                opacity: 0.8
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
