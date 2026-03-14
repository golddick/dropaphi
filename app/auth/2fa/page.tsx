// import React from 'react'
// import TwoFactorPage from '../otp/2fa-otp'

// const page = () => {
//   return (
//     <div>
//         <TwoFactorPage/>
//     </div>
//   )
// }

// export default page 





// app/auth/2fa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { Shield, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TwoFactorPage() {
  const router = useRouter();
  const { verify2FA, resend2FACode, isLoading, error, requiresTwoFactor, twoFactorEmail } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Redirect if 2FA wasn't triggered
    if (!requiresTwoFactor) {
      router.push('/auth/login');
    }
  }, [requiresTwoFactor, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`2fa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6 && /^\d+$/.test(value)) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setFormError('Please enter complete 6-digit code');
      return;
    }

    try {
      await verify2FA(otpCode, rememberDevice);
      router.push('/dashboard');
      toast.success('Successfully verified!');
    } catch (err: any) {
      setFormError(err.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      await resend2FACode();
      setResendTimer(60);
      toast.success('New code sent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    }
  };

  // Show loading while checking auth
  if (!requiresTwoFactor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-80"
        style={{ color: '#666666' }}
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>

      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}
          >
            <Shield size={32} style={{ color: '#DC143C' }} />
          </div>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: '#1A1A1A' }}
        >
          Two-Factor Authentication
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          We've sent a verification code to
        </p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Mail size={14} style={{ color: '#DC143C' }} />
          <span className="text-sm font-medium" style={{ color: '#DC143C' }}>
            {twoFactorEmail || 'your email'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2FA Input Fields */}
        <div>
          <label
            className="block text-sm font-medium mb-3 text-center"
            style={{ color: '#1A1A1A' }}
          >
            Enter 6-digit Code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`2fa-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold"
                style={{
                  borderColor: digit ? '#DC143C' : '#E5E5E5',
                }}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Remember Device Checkbox */}
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-red-600"
          />
          <label
            htmlFor="rememberDevice"
            className="text-sm cursor-pointer"
            style={{ color: '#666666' }}
          >
            Trust this device for 30 days
          </label>
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isLoading}
            className="text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: '#DC143C' }}
          >
            {resendTimer > 0 
              ? `Resend code in ${resendTimer}s` 
              : "Didn't receive code? Resend"}
          </button>
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div
            className="p-3 rounded text-sm font-medium text-center"
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
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full text-base font-semibold py-6"
          style={{
            backgroundColor: '#DC143C',
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify & Sign In'}
        </Button>
      </form>

      {/* Help Links */}
      <div className="mt-6 space-y-2 text-center">
        <p className="text-sm" style={{ color: '#666666' }}>
          Having trouble?{' '}
          <Link
            href="/auth/recovery-codes"
            className="font-semibold hover:underline"
            style={{ color: '#DC143C' }}
          >
            Use recovery code
          </Link>
        </p>
        <p className="text-xs" style={{ color: '#999999' }}>
          Lost access to your authenticator?{' '}
          <Link
            href="/auth/2fa-recovery"
            className="hover:underline"
            style={{ color: '#DC143C' }}
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}