


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
  PenTool,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceID } from '@/lib/id/workspace';
import { WorkspaceSelector } from '../workspace/workspace-selector';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { useSubscriptionStore } from '@/lib/stores/subscription';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useTheme } from 'next-themes';
import { Wallet } from 'lucide-react';
import Image from 'next/image';

// Sidebar Content Component (reused for both mobile and desktop)
function SidebarContent({ 
  workspaceId, 
  wallet, 
  menuItems, 
  onItemClick,
  theme,
  setTheme,
  mounted,
  handleLogout
}: { 
  workspaceId: string;
  wallet: any;
  menuItems: any[];
  onItemClick?: () => void;
  theme?: string;
  setTheme?: (theme: string) => void;
  mounted?: boolean;
  handleLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full p-4 w-60">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center w-full justify-between mb-4">
          <Link href="/" className="flex items-center gap-2" onClick={onItemClick}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded overflow-hidden bg-white"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <Image
                src="/image/drop-logo.png"
                alt="Dropaphi Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:inline font-bold text-lg" style={{ color: 'var(--sidebar-foreground)' }}>
              DropAPHI
            </span>
          </Link>
          {onItemClick && (
            <button
              onClick={onItemClick}
              className="lg:hidden text-sidebar-foreground hover:opacity-70"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Workspace Selector */}
      <WorkspaceSelector />

      {/* Navigation */}
      <nav className="flex-1 hidden-scrollbar overflow-y-auto space-y-6">
        {menuItems.map((group, idx) => {
          // Check if we should insert the wallet component after Management
          const shouldInsertWallet = group.label === 'Management' && idx < menuItems.length - 1;
          
          return (
            <div key={idx}>
              <div>
                {'items' in group ? (
                  <>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider px-2 mb-3 text-muted-foreground"
                    >
                      {group.label}
                    </h3>
                    <div className="space-y-1">
                      {('items' in group && group.items) && (() => {
                        interface MenuItem {
                          label: string;
                          icon: (props: { size?: number }) => React.JSX.Element;
                          href: string;
                        }

                        const typedItems = group.items as MenuItem[];

                        return typedItems.map((item: MenuItem) => {
                          const Icon = item.icon;
                          const isActive: boolean = pathname === item.href;
                          return (
                            <Link key={item.href} href={item.href} onClick={onItemClick}>
                              <div
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                style={{
                                  backgroundColor: isActive
                                    ? '#DC143C'
                                    : 'transparent',
                                  color: isActive ? '#fff' : 'var(--sidebar-foreground)',
                                  opacity: isActive ? 1 : 0.8
                                }}
                              >
                                <Icon size={18} />
                                <span className="text-sm">{item.label}</span>
                              </div>
                            </Link>
                          );
                        });
                      })()}
                    </div>
                  </>
                ) : (
                  <Link href={group.href} onClick={onItemClick}>
                    <div
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      style={{
                        backgroundColor:
                          pathname === group.href
                            ? 'hsl(var(--destructive) / 0.15)'
                            : 'transparent',
                        color:
                          pathname === group.href ? 'hsl(var(--destructive))' : 'var(--sidebar-foreground)',
                        opacity: pathname === group.href ? 1 : 0.8
                      }}
                    >
                      {group.icon && <group.icon size={18} />}
                      <span className="text-sm">{group.label}</span>
                    </div>
                  </Link>
                )}
              </div>
              
              {/* Insert Wallet Display Component after Management section */}
              {shouldInsertWallet && wallet && (
                <div className="mx-2 my-6 p-3 rounded-xl bg-primary/10 border-none">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Wallet Balance</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">₦{wallet.balance.toLocaleString()}</p>
                  <div className="mt-2 text-center">
                    <Link href={`/dashboard/${workspaceId}/billing`} onClick={onItemClick}>
                      <button className="text-[9px] font-medium text-destructive-foreground hover:underline uppercase w-full">
                        Manage Wallet
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="pt-4 border-t space-y-2"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {/* Theme Toggle */}
        {mounted && setTheme && (
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
  );
}

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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (currentWorkspace?.id) {
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
     aiCredits: subscription.credits.ai || 0,
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
        { label: 'Email', icon: Mail, href: `/dashboard/${workspaceId}/email` },
        { label: 'Blog', icon: PenTool, href: `/dashboard/${workspaceId}/blog/new` },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Subscribers Manager', icon: Users, href: `/dashboard/${workspaceId}/subscribers` },
        { label: 'File Manager', icon: FileText, href: `/dashboard/${workspaceId}/file-manager` },
        { label: 'Blog Manager', icon: FileText, href: `/dashboard/${workspaceId}/blog` },
        { label: 'Email Manager', icon: Files, href: `/dashboard/${workspaceId}/email-manager` },
        { label: 'Campaigns Manager', icon: Mail, href: `/dashboard/${workspaceId}/campaigns` },
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
      {/* Mobile Sidebar - Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
            
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 z-40 h-full w-60 lg:hidden"
              style={{ 
                backgroundColor: 'var(--sidebar)',
                borderColor: 'var(--sidebar-border)',
                borderRight: '1px solid var(--sidebar-border)'
              }}
            >
              <SidebarContent
                workspaceId={workspaceId}
                wallet={wallet}
                menuItems={menuItems}
                onItemClick={() => onOpenChange(false)}
                theme={theme}
                setTheme={setTheme}
                mounted={mounted}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible */}
      <motion.aside
        className="hidden lg:block fixed lg:relative z-40 h-full w-60 border-r"
        style={{ 
          backgroundColor: 'var(--sidebar)',
          borderColor: 'var(--sidebar-border)'
        }}
      >
        <SidebarContent
          workspaceId={workspaceId}
          wallet={wallet}
          menuItems={menuItems}
          theme={theme}
          setTheme={setTheme}
          mounted={mounted}
          handleLogout={handleLogout}
        />
      </motion.aside>
    </>
  );
}