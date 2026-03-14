'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, Zap, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || 'workspace';

  const handleContinue = () => {
    router.push(`/dashboard/${workspaceId}/overview`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          className="mb-6"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}
          >
            <CheckCircle2 size={48} style={{ color: '#DC143C' }} />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: '#1A1A1A' }}
          >
            Welcome to Drop APHI!
          </h1>
          <p style={{ color: '#666666' }} className="text-lg max-w-xl">
            Your workspace is all set up and ready to go. Here's what we've prepared for you.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap size={18} style={{ color: '#DC143C' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>API Keys Ready</h3>
            </div>
            <p className="text-xs" style={{ color: '#666666' }}>
              Your API credentials are generated and ready to use
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users size={18} style={{ color: '#DC143C' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>Team Ready</h3>
            </div>
            <p className="text-xs" style={{ color: '#666666' }}>
              {workspaceId === 'workspace' ? 'Invite team members anytime' : 'Your team invitations are sent'}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail size={18} style={{ color: '#DC143C' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>Email Ready</h3>
            </div>
            <p className="text-xs" style={{ color: '#666666' }}>
              Start sending emails immediately
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText size={18} style={{ color: '#DC143C' }} />
              </div>
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>Documentation</h3>
            </div>
            <p className="text-xs" style={{ color: '#666666' }}>
              Access comprehensive API docs and examples
            </p>
          </div>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full mb-8 p-6 rounded-lg"
          style={{ backgroundColor: 'rgba(220, 20, 60, 0.05)', borderLeft: '4px solid #DC143C' }}
        >
          <h3 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
            Quick Start Guide
          </h3>
          <ol className="space-y-2 text-sm" style={{ color: '#666666' }}>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">1</span>
              Go to API Keys and copy your credentials
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">2</span>
              Check out the code examples in your dashboard
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">3</span>
              Send your first SMS, Email, or OTP
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold">4</span>
              Invite team members to collaborate
            </li>
          </ol>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          <Button
            onClick={handleContinue}
            className="flex-1 text-base font-semibold py-2"
            style={{ backgroundColor: '#DC143C' }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open('/docs', '_blank')}
          >
            Read Documentation
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

