'use client';

import { useEffect, useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { WorkspacePopup } from '@/components/dashboard/WorkspacePopup';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useWorkspaceStore } from '@/lib/stores/workspace';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuthStore();
  const { workspaces, currentWorkspace, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    // Auto-select first workspace if none selected
    if (workspaces.length > 0 && !currentWorkspace) {
      useWorkspaceStore.getState().setCurrentWorkspace(workspaces[0] as any);
    }
  }, [workspaces, currentWorkspace]);


  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content */}
        <main className="flex-1 hidden-scrollbar overflow-auto">
          <div className=" p-4">
            {children}
          </div>
        </main>
        
        {currentWorkspace && (
          <WorkspacePopup workspaceId={currentWorkspace.id} />
        )}
      </div>
    </div>
  );
}
