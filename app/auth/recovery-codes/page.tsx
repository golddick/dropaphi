// app/auth/recovery-codes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  Shield, 
  ArrowLeft, 
  Copy, 
  Download, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Key
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RecoveryCodesPage() {
  const router = useRouter();
  const { 
    getBackupCodes, 
    useRecoveryCode, 
    isLoading, 
    error,
    requiresTwoFactor,
    twoFactorEmail 
  } = useAuthStore();
  
  const [codes, setCodes] = useState<string[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [showUseCode, setShowUseCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If user is in 2FA flow, load codes
    if (requiresTwoFactor && twoFactorEmail) {
      loadCodes();
    }
  }, [requiresTwoFactor, twoFactorEmail]);

  const loadCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const backupCodes = await getBackupCodes();
      setCodes(backupCodes);
    } catch (error) {
      console.error('Failed to load backup codes:', error);
      toast.error('Failed to load backup codes');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleUseRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryCode.trim()) {
      toast.error('Please enter a recovery code');
      return;
    }

    setIsVerifying(true);
    try {
      await useRecoveryCode(recoveryCode.trim());
      toast.success('Recovery code verified! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Invalid recovery code');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    toast.success('All codes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dropapi-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  // If not in 2FA flow, show message
  if (!requiresTwoFactor || !twoFactorEmail) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#DC143C' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            No Active Session
          </h1>
          <p className="mb-6" style={{ color: '#666666' }}>
            You need to start the 2FA verification process first.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            style={{ backgroundColor: '#DC143C' }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-80"
        style={{ color: '#666666' }}
      >
        <ArrowLeft size={16} />
        Back to 2FA Verification
      </button>

      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}
          >
            <Shield size={32} style={{ color: '#DC143C' }} />
          </div>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: '#1A1A1A' }}
        >
          Recovery Codes
        </h1>
        <p style={{ color: '#666666' }} className="text-sm">
          {twoFactorEmail}
        </p>
      </div>

      {!showUseCode ? (
        <>
          {/* Display Backup Codes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
                Your Backup Codes
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyAllCodes}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Copy all codes"
                >
                  <Copy size={18} style={{ color: copied ? '#10B981' : '#666666' }} />
                </button>
                <button
                  onClick={downloadCodes}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Download codes"
                >
                  <Download size={18} style={{ color: '#666666' }} />
                </button>
              </div>
            </div>

            {isLoadingCodes ? (
              <div className="py-8 text-center">
                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
                <p style={{ color: '#666666' }}>Loading your backup codes...</p>
              </div>
            ) : codes.length > 0 ? (
              <>
                <p className="text-sm mb-4" style={{ color: '#666666' }}>
                  Save these backup codes in a safe place. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {codes.map((code, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded font-mono text-sm text-center border border-gray-200"
                      style={{ color: '#1A1A1A' }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle size={20} style={{ color: '#F59E0B' }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#92400E' }}>
                        Important
                      </p>
                      <p className="text-xs" style={{ color: '#666666' }}>
                        These codes will not be shown again. Store them securely.
                        Each code can only be used once to access your account.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p style={{ color: '#666666' }}>No backup codes available.</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowUseCode(true)}
              variant="outline"
              className="w-full"
              style={{ borderColor: '#DC143C', color: '#DC143C' }}
            >
              I have a recovery code
            </Button>
            <Button
              onClick={() => router.push('/auth/2fa')}
              variant="outline"
              className="w-full"
            >
              Back to 2FA Verification
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Use Recovery Code Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Key size={20} style={{ color: '#DC143C' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
                Enter Recovery Code
              </h2>
            </div>

            <form onSubmit={handleUseRecoveryCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Recovery Code
                </label>
                <Input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="w-full font-mono"
                  disabled={isVerifying}
                />
                <p className="text-xs mt-2" style={{ color: '#999999' }}>
                  Enter one of your backup codes (format: XXXX-XXXX-XXXX-XXXX)
                </p>
              </div>

              {error && (
                <div
                  className="p-3 rounded text-sm"
                  style={{
                    backgroundColor: 'rgba(220, 20, 60, 0.1)',
                    color: '#DC143C',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isVerifying || !recoveryCode.trim()}
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowUseCode(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm" style={{ color: '#666666' }}>
            <Link
              href="/auth/2fa"
              className="hover:underline"
              style={{ color: '#DC143C' }}
            >
              Back to 2FA verification
            </Link>
          </p>
        </>
      )}
    </div>
  );
}