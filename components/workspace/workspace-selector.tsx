'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronDown, 
  Plus, 
  Settings,
  Users,
  Loader2
} from 'lucide-react';
import { CreateWorkspaceModal } from './create-workspace-modal';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useAuthStore } from '@/lib/stores/auth';

export function WorkspaceSelector() {
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Get workspace store state and actions
  const { 
    workspaces, 
    currentWorkspace, 
    isLoading, 
    fetchWorkspaces, 
    fetchWorkspaceById,
    setCurrentWorkspaceById,
    createWorkspace 
  } = useWorkspaceStore();
  
  const { user } = useAuthStore();

  const currentWorkspaceId = params.workspaceId as string;

  // Fetch workspaces on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  // Set current workspace based on URL param
  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspace = setCurrentWorkspaceById(currentWorkspaceId);
      if (workspace) {
        // Fetch detailed workspace info
        fetchWorkspaceById(currentWorkspaceId);
      }
    }
  }, [currentWorkspaceId, workspaces, setCurrentWorkspaceById, fetchWorkspaceById]);

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setIsOpen(false);
    
    // Always navigate to overview page when switching workspaces
    router.push(`/dashboard/${workspaceId}/overview`);
  };

  const handleCreateWorkspace = async (data: { name: string; plan?: string }) => {
    try {
      const newWorkspace = await createWorkspace({
        name: data.name,
      });
      
      if (newWorkspace) {
        // Navigate to overview page of the new workspace
        router.push(`/dashboard/${newWorkspace.id}/overview`);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error; // Let the modal handle the error
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="relative w-full mb-2">
        {/* Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50"
          style={{
            backgroundColor: isOpen ? 'rgba(220, 20, 60, 0.15)' : 'transparent',
            color: '#FFFFFF',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" style={{ color: '#999999' }} />
            ) : (
              <div className="text-left min-w-0">
                <p className="text-sm font-medium truncate capitalize">
                  {currentWorkspace?.name || 'Select Workspace'}
                </p>
              </div>
            )}
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: '#999999' }}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 z-50 rounded-lg shadow-xl overflow-hidden"
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #333333',
                }}
              >
                {/* Workspace List */}
                <div className="max-h-64 overflow-y-auto">
                  {workspaces.length === 0 ? (
                    <div className="px-3 py-4 text-center">
                      <p className="text-sm" style={{ color: '#999999' }}>
                        No workspaces yet
                      </p>
                    </div>
                  ) : (
                    workspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => handleWorkspaceSwitch(workspace.id)}
                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-800 transition-colors text-left"
                        style={{
                          backgroundColor: workspace.id === currentWorkspaceId ? 'rgba(220, 20, 60, 0.15)' : 'transparent',
                        }}
                      >
                        <div className="flex-1 w-full">
                          <div className="flex w-full items-center gap-2">
                            <p className="text-sm font-medium truncate capitalize" style={{ color: '#FFFFFF' }}>
                              {workspace.name}
                            </p>
                            {workspace.id === currentWorkspaceId && (
                              <Check size={14} style={{ color: '#DC143C' }} />
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #333333' }} />

                {/* Actions */}
                <div className="p-2">
                  {currentWorkspace && (
                    <>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/dashboard/${currentWorkspaceId}/settings/workspace`);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                        style={{ color: '#999999' }}
                      >
                        <Settings size={16} />
                        <span className="text-sm">Workspace Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/dashboard/${currentWorkspaceId}/team`);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                        style={{ color: '#999999' }}
                      >
                        <Users size={16} />
                        <span className="text-sm">Manage Team</span>
                      </button>

                      {/* Divider */}
                      <div className="my-2" style={{ borderTop: '1px solid #333333' }} />
                    </>
                  )}

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
                    style={{ color: '#DC143C' }}
                  >
                    <Plus size={16} />
                    <span className="text-sm">Create Workspace</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </>
  );
}