// app/auth/login/_components/login-content.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const { login, resendVerificationEmail, isLoading, error, clearMessages } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);

  // Check for pending invitation on mount
  useEffect(() => {
    const pending = localStorage.getItem('pendingInvitation');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        setPendingInvitation(parsed);
        // Pre-fill email if available
        if (parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }));
        }
        toast.info('Please login to accept your invitation', {
          duration: 5000,
          icon: '📧',
        });
      } catch (e) {
        console.error('Failed to parse pending invitation');
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (showVerificationPrompt) {
      setShowVerificationPrompt(false);
      clearMessages();
    }
  };

  const handleLoginSuccess = async () => {
    // Check for pending invitation
    if (pendingInvitation) {
      const { token } = pendingInvitation;
      localStorage.removeItem('pendingInvitation');
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        router.push(`/invite/${token}`);
      }, 150);
    } else {
      // Regular redirect
      setTimeout(() => {
        router.replace(redirectTo);
        router.refresh();
      }, 150);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    const loadingToast = toast.loading('Signing in...');

    try {
      const result = await login(formData.email, formData.password, rememberMe);

      console.log('📦 Raw login result:', result);
      
      toast.dismiss(loadingToast);
      
      if (result?.requiresTwoFactor) {
        toast.success('Redirecting to 2FA verification...');
        router.push('/auth/2fa');
      } else {
        toast.success('Successfully logged in!');
        await handleLoginSuccess();
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setShowVerificationPrompt(true);
        toast.error('Please verify your email before logging in', {
          duration: 5000,
          icon: '📧',
        });
      } else if (err.message.includes('suspended')) {
        toast.error('Your account has been suspended. Please contact support.', {
          duration: 6000,
        });
      } else {
        toast.error(err.message || 'Login failed');
      }
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    const loadingToast = toast.loading('Sending verification email...');

    try {
      await resendVerificationEmail(formData.email);
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-medium">Verification email sent!</p>
          <p className="text-xs text-gray-500">Please check your inbox and spam folder</p>
        </div>,
        {
          duration: 5000,
          icon: '✉️',
        }
      );
      setShowVerificationPrompt(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Show invitation banner if there's a pending invitation
  const renderInvitationBanner = () => {
    if (!pendingInvitation) return null;

    return (
      <div
        className="mb-6 p-4 rounded-lg text-sm animate-slideDown"
        style={{
          backgroundColor: 'rgba(220, 20, 60, 0.05)',
          border: '1px solid #DC143C',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <svg className="w-5 h-5" style={{ color: '#DC143C' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1" style={{ color: '#1A1A1A' }}>
              Workspace Invitation Pending
            </h3>
            <p style={{ color: '#666666' }} className="text-sm mb-2">
              You've been invited to join <strong>{pendingInvitation.workspaceName}</strong> as{' '}
              <strong>{pendingInvitation.role}</strong>. Login to accept the invitation.
            </p>
            <p className="text-xs" style={{ color: '#999999' }}>
              Invited email: {pendingInvitation.email}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Welcome Back
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          {pendingInvitation 
            ? 'Login to accept your workspace invitation' 
            : 'Sign in to your Drop API account'}
        </p>
      </div>

      {renderInvitationBanner()}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className="w-full"
            disabled={isLoading || isResending}
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full pr-10"
              disabled={isLoading || isResending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading || isResending}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 cursor-pointer rounded border-gray-300"
              style={{ accentColor: '#DC143C' }}
              disabled={isLoading || isResending}
            />
            <label htmlFor="remember" className="text-sm cursor-pointer" style={{ color: '#666666' }}>
              Remember me
            </label>
          </div>
          
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium hover:underline"
            style={{ color: '#DC143C' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Email Verification Prompt */}
        {showVerificationPrompt && (
          <div
            className="p-4 rounded text-sm animate-slideDown"
            style={{
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid #FF9800',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="w-5 h-5" style={{ color: '#FF9800' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1" style={{ color: '#FF9800' }}>
                  Email Not Verified
                </h3>
                <p style={{ color: '#666666' }} className="text-sm mb-3">
                  Please verify your email address before logging in. Check your inbox for the verification link.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ color: '#FF9800' }}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || isResending}
          className="w-full text-base font-semibold py-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: '#DC143C',
            opacity: isLoading || isResending ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Signing In...' : pendingInvitation ? 'Login & Accept Invitation' : 'Sign In'}
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
          className="w-full hover:bg-gray-50 transition-colors"
          disabled={isLoading || isResending}
          onClick={() => toast.info('Google login coming soon!', { icon: '🚧' })}
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
          className="w-full hover:bg-gray-50 transition-colors"
          disabled={isLoading || isResending}
          onClick={() => toast.info('GitHub login coming soon!', { icon: '🚧' })}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      {/* Sign Up Link */}
      <p className="text-center mt-6 text-sm" style={{ color: '#666666' }}>
        Don't have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold hover:underline transition-colors"
          style={{ color: '#DC143C' }}
        >
          Sign Up
        </Link>
      </p>

      {pendingInvitation && (
        <p className="text-center mt-4 text-xs" style={{ color: '#999999' }}>
          <Link 
            href={`/invite/${pendingInvitation.token}`}
            className="hover:underline"
            style={{ color: '#DC143C' }}
          >
            ← Back to invitation
          </Link>
        </p>
      )}
    </div>
  );
}