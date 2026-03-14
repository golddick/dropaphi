// app/dashboard/settings/team/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  Code,
  PenTool
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useWorkspaceID } from '@/lib/id/workspace';
import { WorkspaceRole } from '@/lib/stores/types';
import { toast } from 'sonner';

interface InviteFormData {
  email: string;
  role: WorkspaceRole;
}

export default function TeamPage() {
  const workspaceId = useWorkspaceID();
  const { 
    currentWorkspace,
    fetchWorkspaceById,
    fetchWorkspaceMembers,
    fetchInvitations,
    sendInvitations,
    updateMemberRole,
    removeMember,
    cancelInvitation,
    isLoading,
    error,
    clearError
  } = useWorkspaceStore();

  // State
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: '',
    role: WorkspaceRole.WRITER, // Default to WRITER
  });
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

  // Load workspace data first
  useEffect(() => {
    const loadWorkspace = async () => {
      if (workspaceId && !currentWorkspace) {
        await fetchWorkspaceById(workspaceId);
      }
      setWorkspaceLoaded(true);
    };
    loadWorkspace();
  }, [workspaceId, currentWorkspace, fetchWorkspaceById]);

  // Load data on mount
  useEffect(() => {
    if (workspaceId && workspaceLoaded) {
      loadMembers();
      loadInvitations();
    }
  }, [workspaceId, workspaceLoaded]);

  // Get current user's role from workspace members or workspace data
  const getUserRole = () => {
    if (!currentWorkspace) return null;
    
    // First try to get from currentWorkspace.members if available
    if (currentWorkspace.members && currentWorkspace.members.length > 0) {
      const currentMember = currentWorkspace.members.find((m: any) => m.role);
      if (currentMember) return currentMember.role;
    }
    
    // Fallback to workspace.role
    return currentWorkspace.role;
  };

  const currentUserRole = getUserRole();
  const isOwner = currentUserRole === WorkspaceRole.OWNER;
  const isAdmin = isOwner || currentUserRole === WorkspaceRole.ADMIN;

  console.log('Current User Role:', currentUserRole);
  console.log('Is Owner:', isOwner);
  console.log('Is Admin:', isAdmin);
  console.log('Current Workspace:', currentWorkspace);

  // Show errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadMembers = async () => {
    if (!workspaceId) return;
    setIsLoadingMembers(true);
    try {
      const membersData = await fetchWorkspaceMembers(workspaceId);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const loadInvitations = async () => {
    if (!workspaceId) return;
    setIsLoadingInvites(true);
    try {
      const invitesData = await fetchInvitations(workspaceId);
      setInvitations(invitesData);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteForm.email) return;

    try {
      await sendInvitations(workspaceId, [{
        email: inviteForm.email,
        role: inviteForm.role,
      }]);
      
      toast.success(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: '', role: WorkspaceRole.WRITER });
      setShowInviteForm(false);
      await loadInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    if (!workspaceId) return;
    
    try {
      await updateMemberRole(workspaceId, memberId, newRole);
      toast.success('Role updated successfully');
      await loadMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!workspaceId) return;
    
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the workspace?`)) {
      return;
    }

    try {
      await removeMember(workspaceId, memberId);
      toast.success('Member removed successfully');
      await loadMembers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) {
      return;
    }

    try {
      await cancelInvitation(invitationId);
      toast.success('Invitation cancelled');
      await loadInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel invitation');
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${workspaceId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeColor = (role: WorkspaceRole) => {
    switch(role) {
      case WorkspaceRole.OWNER: return 'bg-purple-100 text-purple-700';
      case WorkspaceRole.ADMIN: return 'bg-blue-100 text-blue-700';
      case WorkspaceRole.WRITER: return 'bg-green-100 text-green-700';
      case WorkspaceRole.DEVELOPER: return 'bg-orange-100 text-orange-700';
      case WorkspaceRole.VIEWER: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: WorkspaceRole) => {
    switch(role) {
      case WorkspaceRole.OWNER: return <Shield size={14} />;
      case WorkspaceRole.ADMIN: return <Shield size={14} />;
      case WorkspaceRole.WRITER: return <PenTool size={14} />;
      case WorkspaceRole.DEVELOPER: return <Code size={14} />;
      case WorkspaceRole.VIEWER: return <UserPlus size={14} />;
      default: return <UserPlus size={14} />;
    }
  };

  const getAvailableRoles = () => {
    if (isOwner) {
      // Owners can assign any role
      return [
        WorkspaceRole.ADMIN,
        WorkspaceRole.WRITER,
        WorkspaceRole.DEVELOPER,
        WorkspaceRole.VIEWER,
      ];
    } else if (isAdmin) {
      // Admins can only assign non-admin roles
      return [
        WorkspaceRole.WRITER,
        WorkspaceRole.DEVELOPER,
        WorkspaceRole.VIEWER,
      ];
    }
    return [];
  };

  const getInviteRoles = () => {
    if (isOwner) {
      return [
        { value: WorkspaceRole.ADMIN, label: 'Admin' },
        { value: WorkspaceRole.WRITER, label: 'Writer' },
        { value: WorkspaceRole.DEVELOPER, label: 'Developer' },
        { value: WorkspaceRole.VIEWER, label: 'Viewer' },
      ];
    } else if (isAdmin) {
      return [
        { value: WorkspaceRole.WRITER, label: 'Writer' },
        { value: WorkspaceRole.DEVELOPER, label: 'Developer' },
        { value: WorkspaceRole.VIEWER, label: 'Viewer' },
      ];
    }
    return [];
  };

  if (!workspaceLoaded) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Team Management
        </h1>
        <p style={{ color: '#666666' }}>
          Invite and manage team members for {currentWorkspace?.name || 'your workspace'}
        </p>
      </motion.div>

      {/* Invite Card - Only show for owners and admins */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Invite Team Members
            </h2>
          </div>

          <div className="p-6">
            {!showInviteForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowInviteForm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <UserPlus size={18} className="mr-2" />
                  Invite Member
                </Button>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                >
                  <Copy size={18} className="mr-2" />
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="colleague@example.com"
                    className="col-span-1 md:col-span-2"
                    required
                  />
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as WorkspaceRole })}
                    className="p-2 border rounded-lg bg-white"
                    style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                  >
                    {getInviteRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      )}

      {/* Not Admin Message */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-yellow-50 rounded-lg border border-yellow-200 p-6"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <p className="text-sm text-yellow-800">
              You have view-only access to team management. Only owners and admins can invite new members or modify roles.
            </p>
          </div>
        </motion.div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Pending Invitations ({invitations.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoadingInvites ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#DC143C' }} />
              </div>
            ) : (
              invitations.map((invite) => (
                <div key={invite.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail size={20} style={{ color: '#666666' }} />
                    </div>
                    <div>
                      <p className="font-medium capitalize" style={{ color: '#1A1A1A' }}>
                        {invite.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(invite.role)}`}
                        >
                          {getRoleIcon(invite.role)}
                          {invite.role}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: '#999999' }}>
                          <Clock size={12} />
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={() => handleCancelInvitation(invite.id, invite.email)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Team Members List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
            Team Members ({members.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoadingMembers ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
              <p style={{ color: '#666666' }}>Loading team members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus size={48} className="mx-auto mb-4" style={{ color: '#CCCCCC' }} />
              <p style={{ color: '#999999' }}>No team members yet</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {member.user?.avatarUrl ? (
                      <img 
                        src={member.user.avatarUrl} 
                        alt={member.user.fullName}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium capitalize" style={{ color: '#DC143C' }}>
                        {member.user?.fullName?.charAt(0) || member.user?.email?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize" style={{ color: '#1A1A1A' }}>
                      {member.user?.fullName || member.user?.email}
                    </p>
                    <p className="text-sm capitalize" style={{ color: '#666666' }}>
                      {member.user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isAdmin && member.role !== WorkspaceRole.OWNER ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                          className="text-xs p-1 border rounded"
                          style={{ borderColor: '#E5E5E5' }}
                        >
                          {getAvailableRoles().map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(member.role)}`}
                        >
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: '#999999' }}>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isAdmin && member.role !== WorkspaceRole.OWNER && (
                  <Button
                    onClick={() => handleRemoveMember(member.id, member.user?.email)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Roles Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          Roles & Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              role: WorkspaceRole.OWNER, 
              description: 'Full workspace control. Can manage billing, delete workspace, and manage all settings.',
              icon: <Shield size={18} />,
              color: 'text-purple-600'
            },
            { 
              role: WorkspaceRole.ADMIN, 
              description: 'Manage team members, settings, and all resources. Cannot delete workspace.',
              icon: <Shield size={18} />,
              color: 'text-blue-600'
            },
            { 
              role: WorkspaceRole.WRITER, 
              description: 'Create and send messages, manage campaigns, and access analytics.',
              icon: <PenTool size={18} />,
              color: 'text-green-600'
            },
            { 
              role: WorkspaceRole.DEVELOPER, 
              description: 'Access API keys, webhooks, and technical settings.',
              icon: <Code size={18} />,
              color: 'text-orange-600'
            },
            { 
              role: WorkspaceRole.VIEWER, 
              description: 'View-only access to analytics, reports, and workspace data.',
              icon: <UserPlus size={18} />,
              color: 'text-gray-600'
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={item.color}>{item.icon}</span>
                <p className="font-bold" style={{ color: '#1A1A1A' }}>
                  {item.role}
                </p>
              </div>
              <p className="text-sm" style={{ color: '#666666' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              <strong>Note:</strong> Role changes take effect immediately. Members will be notified of any role changes via email.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}










