'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { validatePasswordStrength } from '@/lib/auth/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email');
      return;
    }

    const passwordCheck = validatePasswordStrength(formData.password);

    if (!passwordCheck.valid) {
      toast.error(passwordCheck.errors[0]); 
      setFormError(passwordCheck.errors[0]);
      return;
    }

     if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return; 
    }

    try {
      await signup(formData.name, formData.email, formData.password, );
      router.push('/auth/login');
    } catch (err) {
      setFormError(error || 'Signup failed. Please try again.');
    }
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#DC143C', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: '#1A1A1A' }}
        >
          Create Account
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          Get started with Drop APHI in minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Full Name
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="w-full"
          />
        </div>

        {/* Email Field */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className="w-full"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: strengthColors[Math.min(passwordStrength, 4)],
                    }}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: strengthColors[Math.min(passwordStrength, 4)],
                  }}
                >
                  {strengthLabels[Math.min(passwordStrength, 4)]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: '#1A1A1A' }}
          >
            Confirm Password
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className="w-full"
          />
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div
            className="p-3 rounded text-sm font-medium"
            style={{
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              color: '#DC143C',
            }}
          >
            {formError || error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-base font-semibold py-2"
          style={{
            backgroundColor: '#DC143C',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1" style={{ borderTop: '1px solid #E5E5E5' }} />
        <span style={{ color: '#999999' }} className="text-sm">
          OR
        </span>
        <div className="flex-1" style={{ borderTop: '1px solid #E5E5E5' }} />
      </div>

      {/* Social Auth Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
          </svg>
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      {/* Sign In Link */}
      <p className="text-center mt-6 text-sm" style={{ color: '#666666' }}>
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-semibold"
          style={{ color: '#DC143C' }}
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
