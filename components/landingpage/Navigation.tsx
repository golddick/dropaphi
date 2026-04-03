'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NavigationProps {
  user: any;
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center font-[Bricolage_Grotesque] font-extrabold text-white">
            D
          </div>
          <span className="font-[Bricolage_Grotesque] font-extrabold text-lg text-gray-900">
            Drop<span className="text-red-600">APHI</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-8">
          {[
            ['About', '/about'],
            ['Blog', '/blog'],
            ['DropID', '/docs/dropid'],
            ['Docs', '/docs']
          ].map(([label, href]) => (
            <a 
              key={label} 
              href={href} 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors no-underline"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/login" className="hidden md:block text-sm text-gray-600 hover:text-gray-900 no-underline">
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-[Bricolage_Grotesque] font-bold text-sm hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/25 no-underline"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-[Bricolage_Grotesque] font-bold text-sm hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/25 no-underline"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}