// app/auth/login/page.tsx
import { Suspense } from 'react';
import LoginContent from './_component/login';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}