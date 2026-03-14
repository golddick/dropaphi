'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const adminMenuItems = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/admin/dashboard',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
  },
  {
    label: 'Transactions',
    icon: TrendingUp,
    href: '/admin/transactions',
  },
  {
    label: 'Promo Codes',
    icon: Gift,
    href: '/admin/promo',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-white" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          marginLeft: sidebarOpen ? 0 : '-100%',
        }}
        transition={{ duration: 0.3 }}
        className="fixed lg:relative z-40 h-full w-80 lg:w-auto lg:min-w-fit"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        <div className="flex flex-col h-full p-6 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded font-bold text-white text-lg"
                style={{ backgroundColor: '#DC143C' }}
              >
                A
              </div>
              <span className="font-bold text-white text-lg">Drop Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:opacity-70"
            >
              <X size={20} />
            </button>
          </div>

          {/* Badge */}
          <div
            className="mb-6 p-3 rounded-lg text-center text-xs font-bold text-white"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.2)' }}
          >
            SUPER ADMIN PORTAL
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-2">
            {adminMenuItems.map((item) => {
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

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
            Admin Portal
          </h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
