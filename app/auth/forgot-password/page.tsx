// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Check Your Email
          </h1>
          <p style={{ color: '#666666' }} className="text-sm">
            We've sent a password reset link to <strong>{email}</strong>. The link will expire in 1 hour.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="text-sm hover:underline block"
          style={{ color: '#DC143C' }}
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Forgot Password?
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div
            className="p-3 rounded text-sm font-medium"
            style={{
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              color: '#DC143C',
            }}
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-base font-semibold py-2"
          style={{
            backgroundColor: '#DC143C',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Sending...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm hover:underline"
          style={{ color: '#666666' }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}