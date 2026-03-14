




// app/dashboard/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() { 
  const router = useRouter();
  const initialized = useRef(false);
  
  const { user, isInitialized: authReady } = useAuthStore();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    // Prevent double execution in strict mode
    if (initialized.current) return;
    
    const handleRedirect = async () => {
      // Wait for auth to be ready
      if (!authReady) return;

      // Not authenticated - redirect to login
      if (!user) {
        router.replace('/auth/login?redirect=%2Fdashboard');
        return;
      }

      try {
        // Fetch workspaces if needed
        const workspaceList = workspaces.length > 0 
          ? workspaces 
          : await fetchWorkspaces();

        // Redirect based on workspace availability
        if (workspaceList.length > 0) {
          router.replace(`/dashboard/${workspaceList[0].id}/overview`);
        } else {
          router.replace('/onboarding/step1');
        }
      } catch (error) {
        console.error('Failed to load workspaces:', error);
        router.replace('/onboarding/step1');
      } finally {
        initialized.current = true;
      }
    };

    handleRedirect();
  }, [user, authReady, workspaces, router, fetchWorkspaces]);

  // Loading UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 
          size={48} 
          className="animate-spin mx-auto mb-4" 
          style={{ color: '#DC143C' }} 
        />
        <p className="text-sm text-gray-600">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}