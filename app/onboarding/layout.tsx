import Image from 'next/image';
import { ReactNode } from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background" >
      {/* Progress Header */}
      <div
        className=""
        style={{ borderColor: '#E5E5E5' }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-extrabold hidden md:block text-lg text-secondary-foreground">
              Drop<span className="text-red-600">APHI</span>
            </span>
              <p style={{ color: '#666666' }} className="text-sm mt-1">
                Complete these steps to launch your workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                <Image
                src="/image/drop-logo.png"
                alt="Dropaphi Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
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
