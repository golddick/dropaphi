import { ReactNode } from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Progress Header */}
      <div
        className="border-b"
        style={{ borderColor: '#E5E5E5' }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: '#1A1A1A' }}
              >
                Get Started with Drop API
              </h1>
              <p style={{ color: '#666666' }} className="text-sm mt-1">
                Complete these steps to launch your workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                D
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
