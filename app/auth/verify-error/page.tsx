// app/auth/verify-error/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

function VerifyErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  const getErrorMessage = () => {
    switch (error) {
      case 'missing_token':
        return 'The verification token is missing.';
      case 'invalid_token':
        return 'The verification token is invalid or has expired.';
      case 'token_used':
        return 'This verification token has already been used.';
      case 'already_verified':
        return 'This email address has already been verified.';
      case 'token_expired':
        return 'The verification token has expired.';
      default:
        return 'An unexpected error occurred during verification.';
    }
  };

  return (
    <div className="w-full max-w-md text-center">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
      <p className="text-gray-600 mb-8">
        {getErrorMessage()}
      </p>

      <div className="space-y-4">
        {error === 'token_expired' && email && (
          <Link href={`/auth/verify-email?email=${encodeURIComponent(email)}`}>
            <Button className="w-full" style={{ backgroundColor: '#DC143C' }}>
              Resend Verification Email
            </Button>
          </Link>
        )}
        
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyErrorContent />
      </Suspense>
    </div>
  );
}
