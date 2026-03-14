
import { Suspense } from 'react';
import PaymentVerifyPage from './_component/verify';

export default function Page() {
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
        <PaymentVerifyPage/>
    </Suspense>
  );
}