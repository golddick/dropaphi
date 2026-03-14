// app/payment/verify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, CreditCard, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (!reference && !trxref) {
      setStatus('failed');
      setError('No payment reference found');
      return;
    }

    verifyPayment((reference || trxref) as string);
  }, [reference, trxref]);

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch(`/api/billing/verify?reference=${ref}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setPaymentDetails(data.data);
      setStatus('success');
    } catch (err: any) {
      setStatus('failed');
      setError(err.message || 'Failed to verify payment');
    }
  };

  const getAmount = () => {
    if (!paymentDetails) return '0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(paymentDetails.amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            Payment Verification
          </h1>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Loader2 size={64} className="animate-spin mx-auto mb-6" style={{ color: '#DC143C' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Verifying Payment
              </h2>
              <p className="text-sm" style={{ color: '#666666' }}>
                Please wait while we confirm your transaction...
              </p>
              <p className="text-xs mt-4 font-mono" style={{ color: '#999999' }}>
                Reference: {reference || trxref}
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Payment Successful!
              </h2>
              <p className="text-sm mb-6" style={{ color: '#666666' }}>
                Your transaction has been completed successfully
              </p>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                  Transaction Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: '#666666' }}>Amount:</span>
                    <span className="font-bold" style={{ color: '#1A1A1A' }}>
                      {getAmount()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: '#666666' }}>Reference:</span>
                    <span className="text-sm font-mono" style={{ color: '#1A1A1A' }}>
                      {paymentDetails?.reference}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: '#666666' }}>Status:</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-green-100 text-green-700">
                      {paymentDetails?.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: '#666666' }}>Date:</span>
                    <span className="text-sm" style={{ color: '#1A1A1A' }}>
                      {paymentDetails?.paidAt ? new Date(paymentDetails.paidAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  {paymentDetails?.metadata?.credits && (
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#666666' }}>Credits Added:</span>
                      <span className="font-bold" style={{ color: '#DC143C' }}>
                        +{paymentDetails.metadata.credits.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {paymentDetails?.plan && (
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: '#666666' }}>Plan:</span>
                      <span className="font-bold" style={{ color: '#1A1A1A' }}>
                        {paymentDetails.plan}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard/billing')}
                  className="w-full"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <CreditCard size={18} className="mr-2" />
                  Go to Billing
                </Button>
                
                <Button
                  onClick={() => router.push('/dashboard/overview')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Email Notice */}
              <p className="text-xs mt-6 flex items-center justify-center gap-1" style={{ color: '#999999' }}>
                <Mail size={12} />
                A receipt has been sent to your email
              </p>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle size={48} className="text-red-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Payment Failed
              </h2>
              <p className="text-sm mb-6" style={{ color: '#666666' }}>
                {error || 'We could not verify your payment'}
              </p>

              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm" style={{ color: '#DC143C' }}>
                  If money was deducted from your account, it will be refunded automatically within 3-5 business days.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard/billing')}
                  className="w-full"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>

              <p className="text-xs mt-6" style={{ color: '#999999' }}>
                Reference: {reference || trxref}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}