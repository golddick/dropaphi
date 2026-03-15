// app/onboarding/step1/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { Upload, Globe, Users2 } from 'lucide-react';
import { toast } from 'sonner';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'E-commerce',
  'Logistics',
  'Education',
  'Government',
  'Other',
];

const teamSizes = [
  'Just me',
  '2-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

export default function Step1Page() {
  const router = useRouter();
  const { createWorkspace, isLoading } = useWorkspaceStore();
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    teamSize: '',
    description: '',
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleIndustrySelect = (industry: string) => {
    setFormData((prev) => ({ ...prev, industry }));
    if (errors.industry) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.industry;
        return newErrors;
      });
    }
  };

  const handleTeamSizeSelect = (teamSize: string) => {
    setFormData((prev) => ({ ...prev, teamSize }));
    if (errors.teamSize) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.teamSize;
        return newErrors;
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ logo: 'Logo must be less than 2MB' });
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Workspace name is required';
  } else if (formData.name.length < 3) {
    newErrors.name = 'Workspace name must be at least 3 characters';
  }

  if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
    newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
  }

  if (!formData.industry) {
    newErrors.industry = 'Please select an industry';
  }

  if (!formData.teamSize) {
    newErrors.teamSize = 'Please select team size';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Prepare workspace data for API
  const workspaceData = {
    name: formData.name,
    website: formData.website,
    industry: formData.industry,
    teamSize: formData.teamSize,
    description: formData.description,
  };

  try {
    // Show loading toast
    const loadingToast = toast.loading('Creating your workspace...');
    
    // Call API to create workspace
    const newWorkspace = await createWorkspace(workspaceData);
    
    toast.dismiss(loadingToast);
    
    if (newWorkspace) {
      toast.success('Workspace created successfully!', {
        duration: 3000,
      });
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push('/onboarding/step2');
      }, 1000);
    } else {
      toast.error('Failed to create workspace. Please try again.');
    }
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    // Show specific error message from API if available
    toast.error(error.message || 'An error occurred. Please try again.');
  }
};

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator - Now only 2 steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between w-full mb-4">
          {[1, 2].map((step, idx) => (
            <div key={step} className="flex  items-center flex-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm"
                style={{
                  backgroundColor: step === 1 ? '#DC143C' : '#E5E5E5',
                  color: step === 1 ? 'white' : '#999999',
                }}
              >
                {step}
              </div>
              {idx < 1 && (
                <div
                  className="flex-1 h-1  mx-2"
                  style={{ backgroundColor: '#E5E5E5' }}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Let's set up your workspace
          </h2>
          <p style={{ color: '#666666' }} className="text-sm">
            This is where all your API projects and team members will live
          </p>
        </div>

        {/* Workspace Name */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Workspace Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Acme Corporation"
            className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: '#DC143C' }}>
              {errors.name}
            </p>
          )}
          {formData.name && (
            <p className="text-xs mt-2" style={{ color: '#999999' }}>
              URL: <span className="font-mono">/{(formData.website)}</span>
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Website (Optional)
          </label>
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#999999' }} />
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className={`pl-10 w-full ${errors.website ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.website && (
            <p className="text-xs mt-1" style={{ color: '#DC143C' }}>
              {errors.website}
            </p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: '#1A1A1A' }}
          >
            Industry *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {industries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => handleIndustrySelect(industry)}
                className="p-3 rounded border transition-all text-sm"
                style={{
                  borderColor:
                    formData.industry === industry ? '#DC143C' : '#E5E5E5',
                  backgroundColor:
                    formData.industry === industry
                      ? 'rgba(220, 20, 60, 0.1)'
                      : 'transparent',
                  color: '#1A1A1A',
                  fontWeight: formData.industry === industry ? '600' : '400',
                }}
                disabled={isLoading}
              >
                {industry}
              </button>
            ))}
          </div>
          {errors.industry && (
            <p className="text-xs mt-2" style={{ color: '#DC143C' }}>
              {errors.industry}
            </p>
          )}
        </div>

        {/* Team Size */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: '#1A1A1A' }}
          >
            Team Size *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {teamSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleTeamSizeSelect(size)}
                className="p-3 rounded border transition-all text-sm"
                style={{
                  borderColor:
                    formData.teamSize === size ? '#DC143C' : '#E5E5E5',
                  backgroundColor:
                    formData.teamSize === size
                      ? 'rgba(220, 20, 60, 0.1)'
                      : 'transparent',
                  color: '#1A1A1A',
                  fontWeight: formData.teamSize === size ? '600' : '400',
                }}
                disabled={isLoading}
              >
                {size}
              </button>
            ))}
          </div>
          {errors.teamSize && (
            <p className="text-xs mt-2" style={{ color: '#DC143C' }}>
              {errors.teamSize}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell us about your workspace..."
            rows={3}
            className="w-full p-2 border rounded-lg"
            style={{ borderColor: '#E5E5E5' }}
            disabled={isLoading}
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Workspace Logo (Optional)
          </label>
          <label
            className="flex items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-red-300"
            style={{
              borderColor: logoPreview ? '#DC143C' : '#E5E5E5',
              backgroundColor: logoPreview ? 'rgba(220, 20, 60, 0.05)' : 'transparent',
            }}
          >
            {logoPreview ? (
              <div className="text-center">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-16 mx-auto mb-2 rounded-lg object-cover"
                />
                <p className="text-xs" style={{ color: '#666666' }}>
                  Click to change
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={24} style={{ color: '#999999' }} className="mx-auto mb-2" />
                <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  PNG, JPG up to 2MB
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {errors.logo && (
            <p className="text-xs mt-1" style={{ color: '#DC143C' }}>
              {errors.logo}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 text-base font-semibold py-2"
            style={{ 
              backgroundColor: '#DC143C',
              opacity: isLoading ? 0.7 : 1 
            }}
          >
            {isLoading ? 'Creating Workspace...' : 'Continue to Step 2'}
          </Button>
        </div>
      </form>
    </div>
  );
}