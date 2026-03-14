'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function OtpVerificationPage() {
  const router = useRouter();
  const { verifyOtp, isLoading, error, userEmail } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Redirect if no email in store
    if (!userEmail) {
      router.push('/auth/signup');
    }
  }, [userEmail, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6 && /^\d+$/.test(value)) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setFormError('Please enter complete 6-digit code');
      return;
    }

    try {
      await verifyOtp(userEmail, otpCode);
      router.push('/onboarding/step1');
    } catch (err) {
      setFormError(error || 'Verification failed. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      // Call resend OTP API
      // await resendOtp(userEmail);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setFormError('Failed to resend code');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#666666' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}
          >
            <Mail size={32} style={{ color: '#DC143C' }} />
          </div>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: '#1A1A1A' }}
        >
          Verify Your Email
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          We've sent a verification code to<br />
          <span className="font-semibold" style={{ color: '#DC143C' }}>
            {userEmail}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Fields */}
        <div>
          <label
            className="block text-sm font-medium mb-3 text-center"
            style={{ color: '#1A1A1A' }}
          >
            Enter 6-digit code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold"
                style={{
                  borderColor: digit ? '#DC143C' : '#E5E5E5',
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          {!canResend ? (
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#666666' }}>
              <Clock size={16} />
              Resend code in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm font-semibold hover:underline"
              style={{ color: '#DC143C' }}
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div
            className="p-3 rounded text-sm font-medium"
            style={{
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              color: '#DC143C',
            }}
          >
            {formError || error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full text-base font-semibold py-2"
          style={{
            backgroundColor: '#DC143C',
            opacity: isLoading || otp.join('').length !== 6 ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>

      {/* Help Text */}
      <p className="text-center mt-6 text-xs" style={{ color: '#999999' }}>
        Didn't receive the code? Check your spam folder or{' '}
        <button
          onClick={handleResendCode}
          className="font-semibold hover:underline"
          style={{ color: '#DC143C' }}
          disabled={!canResend}
        >
          try again
        </button>
      </p>
    </div>
  );
}