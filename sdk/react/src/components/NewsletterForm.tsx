import React, { useState } from 'react';

export interface NewsletterFormProps {
  apiKey: string;
  requireOTP?: boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  baseUrl?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  apiKey,
  requireOTP = false,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  onSuccess,
  onError,
  baseUrl = 'https://dropaphi.xyz/api/v1'
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = requireOTP ? `${baseUrl}/otp/send` : `${baseUrl}/newsletter/subscribe`;
      const body = requireOTP ? { email } : { email };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (requireOTP) {
          setStep('otp');
        } else {
          setStep('success');
          onSuccess?.(data);
        }
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err: any) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${baseUrl}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Invalid code');
      }

      // 2. After OTP is verified, subscribe to newsletter
      const subRes = await fetch(`${baseUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ email }),
      });

      const subData = await subRes.json();

      if (subData.success) {
        setStep('success');
        onSuccess?.(subData);
      } else {
        throw new Error(subData.error || 'Subscription failed');
      }
    } catch (err: any) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className={className}>
        <p className="text-green-600 font-medium">Thank you for subscribing!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {step === 'email' ? (
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className={`w-full px-4 py-2 border rounded ${inputClassName}`}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded font-medium disabled:opacity-50 ${buttonClassName}`}
          >
            {loading ? 'Processing...' : requireOTP ? 'Send Code' : 'Subscribe'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Enter the code sent to {email}</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              required
              disabled={loading}
              className={`w-full px-4 py-2 border rounded ${inputClassName}`}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
             <button
              type="button"
              onClick={() => setStep('email')}
              className="flex-1 py-2 px-4 border rounded font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-[2] py-2 px-4 rounded font-medium disabled:opacity-50 ${buttonClassName}`}
            >
              {loading ? 'Verifying...' : 'Verify & Subscribe'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
