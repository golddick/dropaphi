// app/onboarding/step2/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Users, 
  Plus, 
  Trash2,
  Check, 
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceRole } from '@/lib/stores/types';

interface TeamMember {
  email: string;
  role: WorkspaceRole;
}
 
const teamRoles = [
  { value: WorkspaceRole.ADMIN, label: 'Admin', description: 'Full access to workspace' },
  { value: WorkspaceRole.DEVELOPER, label: 'Developer', description: 'Access to dev key and dev tools' },
  { value: WorkspaceRole.OWNER, label: 'Owner', description: 'Can manage workspace and members' },
  { value: WorkspaceRole.VIEWER, label: 'Viewer', description: 'Read-only access' },
  { value: WorkspaceRole.WRITER, label: 'Writer', description: 'Can create and edit content' },
];

export default function Step2Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentWorkspace, sendInvitations, isLoading } = useWorkspaceStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', role: WorkspaceRole.DEVELOPER }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/onboarding/step1');
    }
  }, [user, router]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: WorkspaceRole.DEVELOPER }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
    
    if (field === 'email' && errors[`member_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`member_${index}`];
      setErrors(newErrors);
    }
  };

  const validateEmails = () => {
    const newErrors: Record<string, string> = {};
    
    teamMembers.forEach((member, index) => {
      if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[`member_${index}`] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmails()) {
      toast.error('Please fix the invalid email addresses');
      return;
    }

    if (!currentWorkspace?.id) {
      toast.error('No workspace found');
      router.push('/onboarding/step1');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending invitations...');

    try {
      // Filter out empty emails
      const validMembers = teamMembers.filter(m => m.email.trim() !== '');
      
      // Send invitations if there are valid members
      if (validMembers.length > 0) {
        // await sendInvitations(currentWorkspace.id, validMembers);
        await sendInvitations(currentWorkspace.id, validMembers.map(m => ({
          email: m.email,
          role: m.role
        })));
        toast.success(`Invitations sent to ${validMembers.length} team member(s)`);
      }
 
      toast.dismiss(loadingToast);
      
      // Redirect to completion page
      router.push(`/onboarding/complete?workspaceId=${currentWorkspace.id}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      if (error.message === 'Not authenticated' || error.message.includes('Session expired')) {
        router.push('/auth/login?redirect=/onboarding/step1');
      } else {
        toast.error(error.message || 'Failed to send invitations. You can invite them later.');
        // Still proceed to next step
        router.push(`/onboarding/complete?workspaceId=${currentWorkspace.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentWorkspace?.id) {
      router.push(`/onboarding/complete?workspaceId=${currentWorkspace.id}`);
    } else {
      router.push('/onboarding/step1');
    }
  };

  // Redirect if no workspace exists
  if (!currentWorkspace) {
    router.push('/onboarding/step1');
    return null;
  }

  // Show loading if user not checked yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#666666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {[1, 2].map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm"
                style={{
                  backgroundColor: step <= 2 ? '#DC143C' : '#E5E5E5',
                }}
              >
                {step < 2 ? <Check size={16} /> : step}
              </div>
              {idx < 1 && (
                <div
                  className="flex-1 h-1 mx-2"
                  style={{
                    backgroundColor: step < 2 ? '#DC143C' : '#E5E5E5',
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs" style={{ color: '#666666' }}>
          <span style={{ color: '#DC143C' }}>Workspace Details</span>
          <span>Team Invitation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Invite your team
          </h2>
          <p style={{ color: '#666666' }} className="text-sm">
            Add team members to collaborate on your workspace. You can always invite more later.
          </p>
        </div>

        {/* Workspace Summary */}
        {currentWorkspace && (
          <div 
            className="p-4 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.05)', borderLeft: '4px solid #DC143C' }}
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              {currentWorkspace.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>{currentWorkspace.name}</p>
              <p className="text-xs" style={{ color: '#666666' }}>
                Team size: {currentWorkspace.teamSize || 'Not specified'} • 
                Your role: {currentWorkspace.role || 'OWNER'}
              </p>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: '#DC143C' }} />
            <h3 className="font-medium" style={{ color: '#1A1A1A' }}>Team Members</h3>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                    placeholder="colleague@company.com"
                    className={`w-full ${errors[`member_${index}`] ? 'border-red-500' : ''}`}
                    disabled={isSubmitting || isLoading}
                  />
                  {errors[`member_${index}`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`member_${index}`]}</p>
                  )}
                </div>
                <select
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value as any)}
                  className="px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#E5E5E5' }}
                  disabled={isSubmitting || isLoading}
                >
                  {teamRoles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={isSubmitting || isLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTeamMember}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: '#DC143C' }}
            disabled={isSubmitting || isLoading}
          >
            <Plus size={16} />
            Add another member
          </button>
        </div>

        {/* Role Descriptions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
            Role descriptions
          </h4>
          <div className="space-y-2">
            {teamRoles.map(role => (
              <div key={role.value} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#DC143C' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>
                    {role.label}
                  </p>
                  <p className="text-xs" style={{ color: '#666666' }}>
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting || isLoading}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 text-base font-semibold py-2"
            style={{ backgroundColor: '#DC143C' }}
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send size={16} />
                Send Invitations
              </span>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm hover:underline"
            style={{ color: '#999999' }}
            disabled={isSubmitting || isLoading}
          >
            Skip for now
          </button>
        </div>

        <p className="text-xs text-center" style={{ color: '#999999' }}>
          You can always invite more team members later from workspace settings
        </p>
      </form>
    </div>
  );
}