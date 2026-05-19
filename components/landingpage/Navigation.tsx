'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '../theme-toggle';

interface NavigationProps {
  user: any;
}

export default function Navigation({ user }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-xl border-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
          className="flex h-8 w-8 items-center justify-center rounded overflow-hidden bg-background"
          style={{ backgroundColor: '#1A1A1A' }}
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
          <span className="font-extrabold hidden md:block text-lg text-secondary-foreground">
            Drop<span className="text-red-600">APHI</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-8">
          {[
            ['About', '/about'],
            ['Blog', '/blog'],
            ['Drop-id', '/docs/dropid'],
            ['Docs', '/docs']
          ].map(([label, href]) => (
            <a 
              key={label} 
              href={href} 
              className="text-sm text-foreground hover:text-muted-foreground transition-colors no-underline"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user ? (
            <>
              <Link href="/auth/login" className="hidden md:block text-sm text-foreground hover:text-muted-foreground no-underline">
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/25 no-underline"
              >
                Get Started <ArrowRight size={14} className=" hidden md:block" />
              </Link>
            </>
          ) : (
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/25 no-underline"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}