// app/auth/verify-success/page.tsx
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

function VerifySuccessContent() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-green-100 rounded-full">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
      <p className="text-gray-600 mb-8">
        Your email has been successfully verified. You can now access all features of Drop API.
      </p>

      <div className="space-y-4">
        <Link href="/dashboard">
          <Button className="w-full" style={{ backgroundColor: '#DC143C' }}>
            Go to Dashboard
          </Button>
        </Link>
        
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifySuccessContent />
      </Suspense>
    </div>
  );
}
