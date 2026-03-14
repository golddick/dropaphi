
// app/dashboard/settings/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { Camera, Save, User, Mail, Briefcase, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user, updateProfile, isLoading, isInitialized } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
  });

  console.log('[ProfileSettingsPage] User data:', user);

  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Prepare update data
      const updateData: any = {
        fullName: formData.fullName,
        phone: formData.phone || null,
      };

      // Add optional fields if they exist
      if (formData.location) updateData.location = formData.location;
      if (formData.bio) updateData.bio = formData.bio;

      // Handle avatar upload if needed
      if (avatarFile) {
        // You'll need to implement avatar upload endpoint
        // For now, we'll just update the profile without avatar
        console.log('Avatar upload not implemented yet');
      }

      const updatedUser = await updateProfile(updateData);
      
      if (updatedUser) {
        setSaveStatus('success');
        setIsEditing(false);
        setAvatarPreview(null);
        setAvatarFile(null);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to update profile');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Show loading while auth initializes
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
          <p style={{ color: '#666666' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (proxy will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Profile Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Manage your personal information and preferences
        </p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="bg-linear-to-r from-red-500 to-red-600 h-32 relative">
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="absolute top-4 right-4 bg-white text-red-600 hover:bg-gray-100"
              size="sm"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                'Saved!'
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {avatarPreview || user.avatarUrl ? (
                  <Image
                    src={avatarPreview || user.avatarUrl || ''}
                    alt={user.fullName || 'Profile'}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
                    <User size={40} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={saveStatus === 'saving'}
                />
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
              {formData.fullName || user.fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Full Name
                </label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full"
                  disabled={saveStatus === 'saving'}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Email Address
                </label>
                <Input
                  type="email"
                  value={user.email}
                  className="w-full bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                  disabled={saveStatus === 'saving'}
                  placeholder="+234 123 456 7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Location
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full"
                  disabled={saveStatus === 'saving'}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ borderColor: '#E5E5E5' }}
                placeholder="Tell us a little about yourself..."
                disabled={saveStatus === 'saving'}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} style={{ color: '#666666' }} />
            <span style={{ color: '#666666' }}>
              Member since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Briefcase size={16} style={{ color: '#666666' }} />
            <span style={{ color: '#666666' }}>
              Last active: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Today'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} style={{ color: '#666666' }} />
            <span style={{ color: '#666666' }}>
              Email verified: {user.emailVerified ? 'Yes' : 'No'}
            </span>
          </div>
          {user.phoneVerified && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-600">✓ Phone verified</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}