// app/dashboard/settings/email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  X, 
  Shield, 
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useWorkspaceID } from '@/lib/id/workspace';
import { toast } from 'sonner';
import { useEmailSenderStore } from '@/lib/stores/email-sender-store';

export default function EmailSettingsPage() {
  const workspaceId = useWorkspaceID();
  const { 
    senders, 
    currentSender,
    isLoading,
    error,
    verificationState,
    fetchSenders,
    addSender,
    updateSender,
    deleteSender, 
    sendVerificationCode,
    verifySender,
    checkDNSRecords,
    setCurrentSender,
    clearError 
  } = useEmailSenderStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSender, setNewSender] = useState({ email: '', name: '' });
  const [otpModal, setOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifyingSender, setVerifyingSender] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchSenders(workspaceId);
    }
  }, [workspaceId, fetchSenders]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAddSender = async () => {
    if (!newSender.email || !newSender.name) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const sender = await addSender(workspaceId, newSender);
      setShowAddForm(false);
      setNewSender({ email: '', name: '' });
      toast.success('Email sender added successfully');
      
      // Start verification
      initiateVerification(sender);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const initiateVerification = (sender: any) => {
    setVerifyingSender({ id: sender.id, email: sender.email });
    setOtpModal(true);
    setOtpValue('');
  };

  const handleSendOTP = async () => {
    if (!verifyingSender) return;

    try {
      await sendVerificationCode(workspaceId, verifyingSender.email);
      toast.success('Verification code sent');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6 || !verifyingSender) return;

    try {
      await verifySender(workspaceId, {
        email: verifyingSender.email,
        code: otpValue,
        senderId: verifyingSender.id,
      });
      
      setOtpModal(false);
      setOtpValue('');
      setVerifyingSender(null);
      toast.success('Email verified successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDNSCheck = async (senderId: string) => {
    try {
      const result = await checkDNSRecords(senderId);
      toast.success(`SPF: ${result.spf ? '✓' : '✗'}, DKIM: ${result.dkim ? '✓' : '✗'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading && !senders.length) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Email Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Manage email senders and verification for your workspace
        </p>
      </motion.div>

      {/* Email Senders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Mail size={20} style={{ color: '#DC143C' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Email Senders
            </h2>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            style={{ backgroundColor: '#DC143C' }}
          >
            <Plus size={16} className="mr-2" />
            Add Sender
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Sender Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3" style={{ color: '#1A1A1A' }}>
                Add New Email Sender
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Sender Name (e.g., Support Team)"
                  value={newSender.name}
                  onChange={(e) => setNewSender({ ...newSender, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newSender.email}
                  onChange={(e) => setNewSender({ ...newSender, email: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSender}
                    disabled={isLoading}
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {isLoading ? 'Adding...' : 'Add Sender'}
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Senders List */}
          {senders.length === 0 ? (
            <div className="text-center py-8">
              <Mail size={48} className="mx-auto mb-4" style={{ color: '#CCCCCC' }} />
              <p style={{ color: '#999999' }}>No email senders configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {senders.map((sender) => (
                <div
                  key={sender.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" style={{ color: '#1A1A1A' }}>
                          {sender.name}
                        </span>
                        {sender.verified && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        {sender.email}
                      </p>
                      
                      {/* DNS Status */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs flex items-center gap-1">
                          SPF: {sender.spfVerified ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">○</span>
                          )}
                        </span>
                        <span className="text-xs flex items-center gap-1">
                          DKIM: {sender.dkimVerified ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">○</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleDNSCheck(sender.id)}
                          className="text-xs text-red-600 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={12} />
                          Check DNS
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!sender.verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateVerification(sender)}
                          style={{ borderColor: '#DC143C', color: '#DC143C' }}
                        >
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSender(sender.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-red-50 rounded-lg border border-red-200 p-6"
      >
        <div className="flex gap-3">
          <Shield size={20} className="text-red-600 shrink-0" />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#DC143C' }}>
              Email Authentication
            </h3>
            <p className="text-sm mb-3" style={{ color: '#666666' }}>
              To improve deliverability and prevent spoofing, verify your email senders and configure DNS records:
            </p>
            <ul className="text-sm space-y-2" style={{ color: '#666666' }}>
              <li className="flex items-start gap-2">
                <span className="font-medium text-red-600">1.</span>
                Add and verify your sender email (we'll send a code)
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-red-600">2.</span>
                Add SPF record to authorize our servers
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-red-600">3.</span>
                Add DKIM signature for email signing
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* OTP Modal */}
      {otpModal && verifyingSender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Verify Email Sender
              </h3>
              <button
                onClick={() => {
                  setOtpModal(false);
                  setOtpValue('');
                  setVerifyingSender(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {verificationState.isSending && verificationState.countdown > 0 ? (
              <div>
                <p className="text-sm mb-4" style={{ color: '#666666' }}>
                  Enter the 6-digit code sent to {verifyingSender.email}
                </p>
                <Input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-xl font-mono tracking-widest mb-4"
                />
                
                <div className="text-center mb-4 text-sm" style={{ color: '#999999' }}>
                  <Clock size={16} className="inline mr-2" />
                  Resend in {verificationState.countdown}s
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otpValue.length !== 6}
                    className="flex-1"
                    style={{ 
                      backgroundColor: otpValue.length === 6 ? '#DC143C' : '#CCCCCC',
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    onClick={() => {
                      setOtpValue('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-6" style={{ color: '#666666' }}>
                  We'll send a verification code to {verifyingSender.email}
                </p>
                <Button
                  onClick={handleSendOTP}
                  className="w-full"
                  style={{ backgroundColor: '#DC143C' }}
                  disabled={verificationState.isSending}
                >
                  {verificationState.isSending ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}









// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Mail, CheckCircle2, Clock, X, Shield, AlertCircle } from 'lucide-react';

// interface EmailVerification {
//   fromName: { verified: boolean; timestamp: Date | null };
//   replyTo: { verified: boolean; timestamp: Date | null };
// }

// export default function EmailSettingsPage() {
//   const [emailSettings, setEmailSettings] = useState({
//     fromName: 'Drop API Team',
//     replyTo: 'reply@dropapi.com',
//   });

//   const [emailVerification, setEmailVerification] = useState<EmailVerification>({
//     fromName: { verified: true, timestamp: new Date() },
//     replyTo: { verified: false, timestamp: null },
//   });

//   const [verifyingEmail, setVerifyingEmail] = useState<'fromName' | 'replyTo' | null>(null);
//   const [otpModal, setOtpModal] = useState(false);
//   const [otpValue, setOtpValue] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpCountdown, setOtpCountdown] = useState(0);

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setEmailSettings((prev) => ({ ...prev, [name]: value }));
//   };

//   const initiateEmailVerification = (field: 'fromName' | 'replyTo') => {
//     setVerifyingEmail(field);
//     setOtpModal(true);
//     setOtpSent(true);
//     setOtpCountdown(60);
    
//     const interval = setInterval(() => {
//       setOtpCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const verifyOTP = () => {
//     if (!otpValue || otpValue.length !== 6) return;
    
//     if (verifyingEmail) {
//       setEmailVerification((prev) => ({
//         ...prev,
//         [verifyingEmail]: { verified: true, timestamp: new Date() },
//       }));
//       setOtpModal(false);
//       setOtpValue('');
//       setOtpSent(false);
//     }
//   };

//   const unverifyEmail = (field: 'fromName' | 'replyTo') => {
//     setEmailVerification((prev) => ({
//       ...prev,
//       [field]: { verified: false, timestamp: null },
//     }));
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//           Email Settings
//         </h1>
//         <p style={{ color: '#666666' }}>
//           Configure your email sender details and verification
//         </p>
//       </motion.div>

//       {/* Email Configuration */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         className="bg-white rounded-lg border border-gray-200 overflow-hidden"
//       >
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <Mail size={20} style={{ color: '#DC143C' }} />
//             <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
//               Email Sender Configuration
//             </h2>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* From Name */}
//           <div>
//             <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//               From Name
//             </label>
//             <div className="flex gap-3">
//               <Input
//                 name="fromName"
//                 value={emailSettings.fromName}
//                 onChange={handleEmailChange}
//                 placeholder="e.g., Drop API Team"
//                 disabled={emailVerification.fromName.verified}
//                 className="flex-1"
//               />
//               {emailVerification.fromName.verified ? (
//                 <Button variant="outline" disabled className="bg-green-50 text-green-700 border-green-200">
//                   <CheckCircle2 size={18} className="mr-2" />
//                   Verified
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={() => initiateEmailVerification('fromName')}
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   Verify
//                 </Button>
//               )}
//             </div>
//             {emailVerification.fromName.verified && (
//               <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
//                 <span className="text-xs text-green-700">
//                   ✓ Verified on {emailVerification.fromName.timestamp?.toLocaleDateString()}
//                 </span>
//                 <button
//                   onClick={() => unverifyEmail('fromName')}
//                   className="text-xs text-red-600 hover:underline"
//                 >
//                   Unverify
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Reply To */}
//           <div>
//             <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//               Reply-To Email
//             </label>
//             <div className="flex gap-3">
//               <Input
//                 name="replyTo"
//                 type="email"
//                 value={emailSettings.replyTo}
//                 onChange={handleEmailChange}
//                 placeholder="e.g., reply@example.com"
//                 disabled={emailVerification.replyTo.verified}
//                 className="flex-1"
//               />
//               {emailVerification.replyTo.verified ? (
//                 <Button variant="outline" disabled className="bg-green-50 text-green-700 border-green-200">
//                   <CheckCircle2 size={18} className="mr-2" />
//                   Verified
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={() => initiateEmailVerification('replyTo')}
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   Verify
//                 </Button>
//               )}
//             </div>
//             {emailVerification.replyTo.verified && (
//               <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded">
//                 <span className="text-xs text-green-700">
//                   ✓ Verified on {emailVerification.replyTo.timestamp?.toLocaleDateString()}
//                 </span>
//                 <button
//                   onClick={() => unverifyEmail('replyTo')}
//                   className="text-xs text-red-600 hover:underline"
//                 >
//                   Unverify
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Info Box */}
//           <div className="p-4 bg-red-50 rounded-lg">
//             <div className="flex gap-2">
//               <Shield size={18} className="text-red-600 shrink-0" />
//               <div>
//                 <p className="text-sm font-medium text-red-800 mb-1">
//                   Why verify your email addresses?
//                 </p>
//                 <p className="text-xs red-blue-600">
//                   Verified email addresses improve deliverability and prevent spoofing. 
//                   We'll send a verification code to confirm ownership.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Email Templates */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2 }}
//         className="bg-white rounded-lg border border-gray-200 p-6"
//       >
//         <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
//           Email Templates
//         </h2>
        
//         <div className="space-y-3">
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <p className="font-medium" style={{ color: '#1A1A1A' }}>
//                 Welcome Email
//               </p>
//               <p className="text-sm" style={{ color: '#666666' }}>
//                 Sent to new users after signup
//               </p>
//             </div>
//             <Button variant="outline" size="sm">Edit</Button>
//           </div>

//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <p className="font-medium" style={{ color: '#1A1A1A' }}>
//                 Password Reset
//               </p>
//               <p className="text-sm" style={{ color: '#666666' }}>
//                 Sent when users request password reset
//               </p>
//             </div>
//             <Button variant="outline" size="sm">Edit</Button>
//           </div>

//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <p className="font-medium" style={{ color: '#1A1A1A' }}>
//                 Email Verification
//               </p>
//               <p className="text-sm" style={{ color: '#666666' }}>
//                 OTP verification emails
//               </p>
//             </div>
//             <Button variant="outline" size="sm">Edit</Button>
//           </div>
//         </div>
//       </motion.div>

//       {/* OTP Modal */}
//       {otpModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
//                 Verify {verifyingEmail === 'fromName' ? 'From Name' : 'Reply-To Email'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setOtpModal(false);
//                   setOtpValue('');
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {!otpSent ? (
//               <div>
//                 <p className="text-sm mb-6" style={{ color: '#666666' }}>
//                   We'll send an OTP to {verifyingEmail === 'fromName' ? emailSettings.fromName : emailSettings.replyTo}
//                 </p>
//                 <Button
//                   onClick={() => {
//                     setOtpSent(true);
//                     setOtpCountdown(60);
//                   }}
//                   className="w-full"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   Send OTP
//                 </Button>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-sm mb-4" style={{ color: '#666666' }}>
//                   Enter the 6-digit code sent to your email
//                 </p>
//                 <Input
//                   type="text"
//                   value={otpValue}
//                   onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   placeholder="000000"
//                   maxLength={6}
//                   className="text-center text-xl font-mono tracking-widest mb-4"
//                 />
                
//                 {otpCountdown > 0 && (
//                   <div className="text-center mb-4 text-sm" style={{ color: '#999999' }}>
//                     <Clock size={16} className="inline mr-2" />
//                     Resend in {otpCountdown}s
//                   </div>
//                 )}

//                 <div className="flex gap-3">
//                   <Button
//                     onClick={verifyOTP}
//                     disabled={otpValue.length !== 6}
//                     className="flex-1"
//                     style={{ 
//                       backgroundColor: otpValue.length === 6 ? '#DC143C' : '#CCCCCC',
//                     }}
//                   >
//                     Verify
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       setOtpSent(false);
//                       setOtpValue('');
//                     }}
//                     variant="outline"
//                     className="flex-1"
//                   >
//                     Back
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }