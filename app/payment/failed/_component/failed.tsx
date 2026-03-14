// app/payment/failed/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() { 
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={48} className="text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Payment Failed
          </h1>
          
          <p className="text-sm mb-6" style={{ color: '#666666' }}>
            Your payment could not be processed
          </p>

          <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
              <HelpCircle size={18} />
              Possible Reasons:
            </h3>
            <ul className="text-sm space-y-2" style={{ color: '#666666' }}>
              <li>• Insufficient funds</li>
              <li>• Transaction timeout</li>
              <li>• Card declined by bank</li>
              <li>• Network error</li>
            </ul>
          </div>

          {reference && (
            <p className="text-xs mb-4 font-mono p-2 bg-gray-50 rounded" style={{ color: '#999999' }}>
              Reference: {reference}
            </p>
          )}

          <div className="space-y-3">
            <Link href="/dashboard/billing">
              <Button className="w-full" style={{ backgroundColor: '#DC143C' }}>
                Try Again
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft size={18} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs mt-6" style={{ color: '#999999' }}>
            Need help? <Link href="/support" className="text-red-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}