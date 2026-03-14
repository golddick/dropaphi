// app/auth/verify-email/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import Link from 'next/link';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  console.log('Token from URL:', token);
  
  const { verifyEmail, resendVerificationEmail, isLoading } = useAuthStore();
  const [email, setEmail] = useState(emailFromUrl || '');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    const loadingToast = toast.loading('Verifying your email...');
    
    try {
      await verifyEmail(token!);
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-medium">Email verified successfully!</p>
          <p className="text-xs text-gray-500">Redirecting to login...</p>
        </div>,
        { duration: 3000 }
      );
      
      setTimeout(() => {
        router.push('/auth/login?verified=true');
      }, 2000);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    const loadingToast = toast.loading('Sending verification email...');

    try {
      await resendVerificationEmail(email);
      toast.dismiss(loadingToast);
      toast.success(
        <div>
          <p className="font-medium">Verification email sent!</p>
          <p className="text-xs text-gray-500">Please check your inbox</p>
        </div>,
        { duration: 5000 }
      );
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          Enter your email address to receive a verification link
        </p>
        
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full mb-4"
          disabled={isResending}
        />
        
        <Button
          onClick={handleResendVerification}
          disabled={isResending}
          className="w-full"
          style={{ backgroundColor: '#DC143C' }}
        >
          {isResending ? 'Sending...' : 'Send Verification Email'}
        </Button>
        
        <Link
          href="/auth/login"
          className="block text-center mt-4 text-sm text-gray-600 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mx-auto mb-4"></div>
      <p className="text-gray-600">Verifying your email...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mx-auto"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}







