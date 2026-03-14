// app/dashboard/[workspaceId]/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';
import { useWorkspaceID } from '@/lib/id/workspace';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = useWorkspaceID();
  
  const { user } = useAuthStore();
  const { 
    currentWorkspace, 
    workspaces,
    updateWorkspace, 
    deleteWorkspace,
    fetchWorkspaceById,
    isUpdating,
    error,
    clearError
  } = useWorkspaceStore(); 

  const [formData, setFormData] = useState({
    name: '',
    timezone: 'Africa/Lagos',
    industry: '',
    website: '',
    description: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('Workspace Settings Page - workspace:', currentWorkspace);
  console.log('Current workspace:', currentWorkspace);
  console.log('All workspaces:', workspaces);

  // Load workspace data
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }

      try {
        // Find workspace in store
        let workspace = currentWorkspace?.id === workspaceId 
          ? currentWorkspace 
          : workspaces.find(w => w.id === workspaceId);

        // If not found in store, fetch it
        if (!workspace) {
          const fetchedWorkspace = await fetchWorkspaceById(workspaceId);
          if (fetchedWorkspace) {
            workspace = fetchedWorkspace;
          }
        }

        if (workspace) {
          console.log('Found workspace:', workspace);
          setFormData({
            name: workspace.name || '',
            timezone: workspace.timezone || 'Africa/Lagos',
            industry: workspace.industry || '',
            website: workspace.website || '',
            description: workspace.description || '',
          });
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
        toast.error('Failed to load workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
  }, [workspaceId, currentWorkspace, workspaces, fetchWorkspaceById]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      const updateData: any = {
        name: formData.name,
        timezone: formData.timezone,
        industry: formData.industry || null,
        website: formData.website || null,
        description: formData.description || null,
      };

      const updated = await updateWorkspace(workspaceId, updateData);
      
      if (updated) {
        setSaveStatus('success');
        setIsEditing(false);
        toast.success('Workspace updated successfully');
      }
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to update workspace');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      const deleted = await deleteWorkspace(workspaceId);
      if (deleted) {
        toast.success('Workspace deleted successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
    setShowDeleteConfirm(false);
  };

  // Get workspace to display
  const displayWorkspace = currentWorkspace?.id === workspaceId 
    ? currentWorkspace 
    : workspaces.find(w => w.id === workspaceId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
          <p style={{ color: '#666666' }}>Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  if (!displayWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: '#DC143C' }} />
          <p style={{ color: '#666666' }}>Workspace not found</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4"
            style={{ backgroundColor: '#DC143C' }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Workspace Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Manage your workspace configuration and branding
        </p>
      </motion.div>

      {/* Main Settings Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        {/* Header with Save Button */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
            Workspace Details
          </h2>
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || isUpdating}
              style={{ backgroundColor: '#DC143C' }}
              className="flex items-center gap-2"
            >
              {saveStatus === 'saving' || isUpdating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>Saved!</>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {(logoPreview || displayWorkspace.logo || displayWorkspace.logoUrl) ? (
                <Image
                  src={logoPreview || displayWorkspace.logo || displayWorkspace.logoUrl || ''}
                  alt="Workspace logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload size={24} style={{ color: '#999999' }} />
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUpdating}
                />
                <span className="text-red-600 hover:underline text-sm font-medium">
                  Upload new logo
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 256x256px, max 2MB
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Workspace Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                disabled={isUpdating}
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                style={{ borderColor: '#E5E5E5' }}
                disabled={isUpdating}
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Website
              </label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full"
                disabled={isUpdating}
                placeholder="https://example.com"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Timezone *
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                style={{ borderColor: '#E5E5E5' }}
                disabled={isUpdating}
              >
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-lg"
              style={{ borderColor: '#E5E5E5' }}
              disabled={isUpdating}
              placeholder="Tell us about your workspace..."
            />
          </div>

          {/* Workspace Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
              Workspace Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Workspace ID</p>
                <p className="font-mono">{displayWorkspace.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Slug</p>
                <p className="font-mono">{displayWorkspace.slug}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(displayWorkspace.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Your Role</p>
                <p className="capitalize">{displayWorkspace.role?.toLowerCase() || 'owner'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone - Only show for owners */}
      {displayWorkspace.role === 'OWNER' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 rounded-lg border border-red-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} style={{ color: '#DC143C' }} />
            <h2 className="text-xl font-bold" style={{ color: '#DC143C' }}>
              Danger Zone
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: '#666666' }}>
            Once you delete your workspace, there is no going back. Please be certain.
          </p>
          
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating}
            >
              Delete Workspace
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-600">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isUpdating}
                >
                  Yes, Delete Workspace
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}