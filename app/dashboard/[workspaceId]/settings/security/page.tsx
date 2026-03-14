// app/dashboard/settings/security/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Key, 
  Shield, 
  Smartphone, 
  CheckCircle2, 
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  Download,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettingsPage() {
  const { 
    user, 
    changePassword, 
    send2FAOTP, 
    enable2FA, 
    disable2FA,
    getBackupCodes,
    regenerateBackupCodes,
    getSessions,
    terminateSession,
    terminateAllSessions,
    isLoading 
  } = useAuthStore();

  // Password State
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA State
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled || false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  console.log('ses data in SecuritySettingsPage:', sessions);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Update twoFAEnabled when user changes
  useEffect(() => {
    setTwoFAEnabled(user?.twoFactorEnabled || false);
  }, [user]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessionsData = await getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      // Calculate password strength
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  // app/dashboard/settings/security/page.tsx - Fix handlePasswordSubmit

const handlePasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPasswordError('');
  
  // Validation
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError('Passwords do not match');
    return;
  }
  
  if (passwordStrength < 3) {
    setPasswordError('Password is too weak');
    return;
  }

  setIsChangingPassword(true);
  try {
    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    
    setPasswordSuccess(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    toast.success('Password changed successfully!');
    
    setTimeout(() => setPasswordSuccess(false), 3000);
  } catch (error: any) {
    console.error('Password change error:', error);
    // Make sure the error message is displayed
    const errorMessage = error.message || 'Failed to change password';
    setPasswordError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsChangingPassword(false);
  }
};


  const handle2FASetup = async () => {
    setShow2FASetup(true);
    setIsSendingOTP(true);
    try {
      await send2FAOTP();
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
      setShow2FASetup(false);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verify2FA = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsEnabling2FA(true);
    try {
      const result = await enable2FA(verificationCode);
      setTwoFAEnabled(true);
      setShow2FASetup(false);
      setBackupCodes(result.backupCodes);
      setShowBackupCodes(true);
      toast.success('2FA enabled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable 2FA');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!showDisableConfirm) {
      setShowDisableConfirm(true);
      return;
    }

    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsDisabling2FA(true);
    try {
      await disable2FA(disablePassword);
      setTwoFAEnabled(false);
      setShowDisableConfirm(false);
      setDisablePassword('');
      setBackupCodes([]);
      setShowBackupCodes(false);
      toast.success('2FA disabled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable 2FA');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dropapi-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('Regenerating backup codes will invalidate your old codes. Continue?')) {
      return;
    }

    try {
      const newCodes = await regenerateBackupCodes();
      setBackupCodes(newCodes);
      toast.success('Backup codes regenerated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate codes');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      await loadSessions(); // Reload sessions
      toast.success('Session terminated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm('This will sign you out from all other devices. Continue?')) {
      return;
    }

    try {
      await terminateAllSessions();
      await loadSessions(); // Reload sessions
      toast.success('All other sessions terminated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to terminate sessions');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Security Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Manage your password, two-factor authentication, and active sessions
        </p>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Key size={20} style={{ color: '#DC143C' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Change Password
            </h2>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full pr-10"
                required
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full pr-10"
                required
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength 
                          ? level <= 2 ? 'bg-red-500' : level <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: '#666666' }}>
                  {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Medium' : 'Strong'} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full pr-10"
                required
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {passwordError && (
            <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} style={{ color: '#DC143C' }} />
              <span className="text-sm" style={{ color: '#DC143C' }}>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span className="text-sm text-green-600">Password updated successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            style={{ backgroundColor: '#DC143C' }}
            className="w-full md:w-auto"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={20} style={{ color: '#DC143C' }} />
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                  Two-Factor Authentication (2FA)
                </h2>
                <p className="text-sm" style={{ color: '#666666' }}>
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <span className={`text-sm px-3 py-1 rounded-full ${
                twoFAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </span> */}
              {!twoFAEnabled ? (
                <Button 
                  onClick={handle2FASetup} 
                  style={{ backgroundColor: '#DC143C' }}
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleDisable2FA} 
                  variant="outline" 
                  className="border-red-500 text-red-500"
                  disabled={isDisabling2FA}
                >
                  {isDisabling2FA ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2FA Setup */}
        {show2FASetup && !twoFAEnabled && (
          <div className="p-6 bg-gray-50">
            <div className="max-w-md mx-auto text-center space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
                Set up Two-Factor Authentication
              </h3>
              
              <div>
                <p className="text-sm mb-4" style={{ color: '#666666' }}>
                  We've sent a 6-digit verification code to your email address.
                  Enter the code below to enable 2FA.
                </p>
              </div>

              {/* Verification */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-xl font-mono tracking-widest"
                  disabled={isEnabling2FA}
                />
                <Button
                  onClick={verify2FA}
                  disabled={verificationCode.length !== 6 || isEnabling2FA}
                  className="w-full"
                  style={{ backgroundColor: verificationCode.length === 6 && !isEnabling2FA ? '#DC143C' : '#CCCCCC' }}
                >
                  {isEnabling2FA ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable'
                  )}
                </Button>
                <Button
                  onClick={() => setShow2FASetup(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Disable 2FA Confirmation */}
        {showDisableConfirm && twoFAEnabled && (
          <div className="p-6 bg-red-50">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#DC143C' }}>
                Disable Two-Factor Authentication
              </h3>
              
              <p className="text-sm" style={{ color: '#666666' }}>
                This will make your account less secure. Please enter your password to confirm.
              </p>

              <Input
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full"
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleDisable2FA}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!disablePassword || isDisabling2FA}
                >
                  {isDisabling2FA ? 'Disabling...' : 'Confirm Disable'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setDisablePassword('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {showBackupCodes && backupCodes.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone size={18} style={{ color: '#DC143C' }} />
                <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>
                  Backup Codes
                </h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={copyBackupCodes} 
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Copy codes"
                >
                  <Copy size={18} />
                </button>
                <button 
                  onClick={downloadBackupCodes} 
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Download codes"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={handleRegenerateBackupCodes} 
                  className="p-2 hover:bg-gray-100 rounded" 
                  title="Regenerate codes"
                >
                  <Loader2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              Save these backup codes in a safe place. You can use them to access your account if you lose access to your email.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-100 rounded font-mono text-sm text-center"
                  style={{ color: '#1A1A1A' }}
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={20} style={{ color: '#DC143C' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                Active Sessions
              </h2>
            </div>
            {sessions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200"
                onClick={handleTerminateAllSessions}
              >
                Sign out all
              </Button>
            )}
          </div>
        </div>

        {isLoadingSessions ? (
          <div className="p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
            <p style={{ color: '#666666' }}>Loading sessions...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} style={{ color: '#666666' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#1A1A1A' }}>
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      {session.location} · {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    onClick={() => handleTerminateSession(session.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200"
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}



