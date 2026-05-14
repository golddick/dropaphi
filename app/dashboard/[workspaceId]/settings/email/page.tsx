// // app/dashboard/settings/email/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { 
//   Mail, 
//   CheckCircle2, 
//   Clock, 
//   X, 
//   Shield, 
//   AlertCircle,
//   Loader2,
//   Plus,
//   Trash2,
//   RefreshCw,
//   Globe,
//   Copy,
//   Info
// } from 'lucide-react';
// import { useWorkspaceID } from '@/lib/id/workspace';
// import { toast } from 'sonner';
// import { useEmailSenderStore, EmailSender } from '@/lib/stores/email-sender-store';

// /**
//  * Generates the expected DNS records for a user to add.
//  * This is a client-side copy of the generation logic to avoid importing Node.js 'dns' module.
//  */
// function generateDNSRecords(domain: string) {
//   const dkimSelector = 'dropaphi';
//   const dkimPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...'; // Match lib/auth/dns-utils.ts

//   return [
//     {
//       type: 'TXT',
//       host: '@',
//       value: 'v=spf1 include:_spf.dropaphi.xyz ~all',
//       description: 'SPF Record',
//       status_key: 'spf'
//     },
//     {
//       type: 'CNAME',
//       host: `dropaphi._domainkey`,
//       value: `dkim.dropaphi.xyz`,
//       description: 'DKIM Record (CNAME)',
//       status_key: 'dkim'
//     },
//     {
//       type: 'TXT',
//       host: '_dmarc',
//       value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}`,
//       description: 'DMARC Record',
//       status_key: 'dmarc'
//     }
//   ];
// }

// export default function EmailSettingsPage() {
//   const workspaceId = useWorkspaceID();
//   const { 
//     senders, 
//     currentSender,
//     isLoading,
//     error,
//     verificationState,
//     fetchSenders,
//     addSender,
//     updateSender,
//     deleteSender, 
//     sendVerificationCode,
//     verifySender,
//     checkDNSRecords,
//     setCurrentSender,
//     clearError 
//   } = useEmailSenderStore();

//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newSender, setNewSender] = useState({ email: '', name: '', isDomain: false });
//   const [otpModal, setOtpModal] = useState(false);
//   const [dnsModal, setDnsModal] = useState(false);
//   const [otpValue, setOtpValue] = useState('');
//   const [verifyingSender, setVerifyingSender] = useState<EmailSender | null>(null);

//   useEffect(() => {
//     if (workspaceId) {
//       fetchSenders(workspaceId);
//     }
//   }, [workspaceId, fetchSenders]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       clearError();
//     }
//   }, [error, clearError]);

//   const handleAddSender = async () => {
//     if (!newSender.email || !newSender.name) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     try {
//       const sender = await addSender(workspaceId, newSender);
//       setShowAddForm(false);
//       setNewSender({ email: '', name: '', isDomain: false });
//       toast.success('Email sender added successfully');
      
//       // Start verification based on type
//       if (sender.isDomain) {
//         setVerifyingSender(sender); 
//         setDnsModal(true);
//       } else {
//         initiateVerification(sender);
//       }
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };

//   const initiateVerification = (sender: EmailSender) => {
//     setVerifyingSender(sender);
//     setOtpModal(true);
//     setOtpValue('');
//   };

//   const handleCopy = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard');
//   };

//   const handleSendOTP = async () => {
//     if (!verifyingSender) return;

//     try {
//       await sendVerificationCode(workspaceId, verifyingSender.email);
//       toast.success('Verification code sent');
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!otpValue || otpValue.length !== 6 || !verifyingSender) return;

//     try {
//       await verifySender(workspaceId, {
//         email: verifyingSender.email,
//         code: otpValue,
//         senderId: verifyingSender.id,
//       });
      
//       setOtpModal(false);
//       setOtpValue('');
//       setVerifyingSender(null);
//       toast.success('Email verified successfully');
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };

//   const handleDNSCheck = async (senderId: string) => {
//     try {
//       const result = await checkDNSRecords(senderId, workspaceId);
//       if (result.spf && result.dkim) {
//         toast.success('All DNS records verified!');
//         if (dnsModal) setDnsModal(false);
//       } else {
//         toast.info(`SPF: ${result.spf ? '✓' : '✗'}, DKIM: ${result.dkim ? '✓' : '✗'}`);
//       }
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };

//   if (isLoading && !senders.length) {
//     return (
//       <div className="flex items-center justify-center min-h-100">
//         <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//           Email Settings
//         </h1>
//         <p style={{ color: '#666666' }}>
//           Manage email senders and verification for your workspace
//         </p>
//       </motion.div>

//       {/* Email Senders */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         className="bg-white rounded-lg border border-gray-200 overflow-hidden"
//       >
//         <div className="p-6 border-b border-gray-200 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <Mail size={20} style={{ color: '#DC143C' }} />
//             <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
//               Email Senders
//             </h2>
//           </div>
//           <Button
//             onClick={() => setShowAddForm(!showAddForm)}
//             size="sm"
//             style={{ backgroundColor: '#DC143C' }}
//           >
//             <Plus size={16} className="mr-2" />
//             Add Sender
//           </Button>
//         </div>

//         <div className="p-6 space-y-4">
//           {/* Add Sender Form */}
//           {showAddForm && (
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//               <h3 className="font-medium mb-3" style={{ color: '#1A1A1A' }}>
//                 Add New Email Identity
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-4 p-2 bg-white rounded border border-gray-200">
//                   <button
//                     onClick={() => setNewSender({ ...newSender, isDomain: false })}
//                     className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${!newSender.isDomain ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
//                   >
//                     Individual Email
//                   </button>
//                   <button
//                     onClick={() => setNewSender({ ...newSender, isDomain: true })}
//                     className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${newSender.isDomain ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
//                   >
//                     Full Domain
//                   </button>
//                 </div>

//                 <Input
//                   placeholder="Identity Name (e.g., Support Team)"
//                   value={newSender.name}
//                   onChange={(e) => setNewSender({ ...newSender, name: e.target.value })}
//                 />
//                 <Input
//                   type={newSender.isDomain ? "text" : "email"}
//                   placeholder={newSender.isDomain ? "domain.com (e.g. acme.com)" : "email@domain.com"}
//                   value={newSender.email}
//                   onChange={(e) => setNewSender({ ...newSender, email: e.target.value })}
//                 />
                
//                 {newSender.isDomain && (
//                   <p className="text-xs text-gray-500 flex items-center gap-1">
//                     <Info size={12} />
//                     Verifying a domain allows you to send from any email under that domain.
//                   </p>
//                 )}

//                 <div className="flex gap-2 pt-2">
//                   <Button
//                     onClick={handleAddSender}
//                     disabled={isLoading}
//                     style={{ backgroundColor: '#DC143C' }}
//                   >
//                     {isLoading ? 'Adding...' : 'Add Identity'}
//                   </Button>
//                   <Button
//                     onClick={() => setShowAddForm(false)}
//                     variant="outline"
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Senders List */}
//           {senders.length === 0 ? (
//             <div className="text-center py-8">
//               <Mail size={48} className="mx-auto mb-4" style={{ color: '#CCCCCC' }} />
//               <p style={{ color: '#999999' }}>No email senders configured yet</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {senders.map((sender) => (
//                 <div
//                   key={sender.id}
//                   className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-1">
//                         {sender.isDomain ? (
//                           <Globe size={16} className="text-gray-400" />
//                         ) : (
//                           <Mail size={16} className="text-gray-400" />
//                         )}
//                         <span className="font-medium" style={{ color: '#1A1A1A' }}>
//                           {sender.name}
//                         </span>
//                         {(sender.verified || sender.domainVerified) && (
//                           <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
//                             <CheckCircle2 size={12} />
//                             Verified
//                           </span>
//                         )}
//                         {sender.isDomain && (
//                           <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-bold">
//                             Domain
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-sm" style={{ color: '#666666' }}>
//                         {sender.email}
//                       </p>
                      
//                       {/* DNS Status */}
//                       <div className="flex items-center gap-3 mt-2">
//                         <span className={`text-xs flex items-center gap-1 ${sender.spfVerified ? 'text-green-600' : 'text-gray-400'}`}>
//                           {sender.spfVerified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
//                           SPF
//                         </span>
//                         <span className={`text-xs flex items-center gap-1 ${sender.dkimVerified ? 'text-green-600' : 'text-gray-400'}`}>
//                           {sender.dkimVerified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
//                           DKIM
//                         </span>
//                         <button
//                           onClick={() => handleDNSCheck(sender.id)}
//                           className="text-xs text-red-600 hover:underline flex items-center gap-1"
//                         >
//                           <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
//                           Verify DNS
//                         </button>
//                         {sender.isDomain && (
//                           <button
//                             onClick={() => {
//                               setVerifyingSender(sender);
//                               setDnsModal(true);
//                             }}
//                             className="text-xs text-gray-500 hover:underline flex items-center gap-1"
//                           >
//                             <Info size={12} />
//                             Setup Guide
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex gap-2">
//                       {!sender.verified && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => initiateVerification(sender)}
//                           style={{ borderColor: '#DC143C', color: '#DC143C' }}
//                         >
//                           Verify
//                         </Button>
//                       )}
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => deleteSender(sender.id, workspaceId)}
//                         className="text-red-600 border-red-200 hover:bg-red-50"
//                       >
//                         <Trash2 size={16} />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {/* Info Box */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2 }}
//         className="bg-red-50 rounded-lg border border-red-200 p-6"
//       >
//         <div className="flex gap-3">
//           <Shield size={20} className="text-red-600 shrink-0" />
//           <div>
//             <h3 className="font-semibold mb-2" style={{ color: '#DC143C' }}>
//               Email Authentication & Fallback
//             </h3>
//             <p className="text-sm mb-3" style={{ color: '#666666' }}>
//               To ensure high deliverability, verify your domain identities. If a domain is unverified, emails will automatically fall back to <strong>no-reply@dropaphi.xyz</strong>.
//             </p>
//             <ul className="text-sm space-y-2" style={{ color: '#666666' }}>
//               <li className="flex items-start gap-2">
//                 <span className="font-medium text-red-600">Individual:</span>
//                 Quick verification via OTP code. Best for personal emails.
//               </li>
//               <li className="flex items-start gap-2">
//                 <span className="font-medium text-red-600">Domain:</span>
//                 Verify your whole domain via DNS. Best for organizations (e.g., any @company.com).
//               </li>
//               <li className="flex items-start gap-2 text-xs italic bg-white p-2 rounded mt-2 border border-red-100">
//                 <Info size={14} className="shrink-0" />
//                 Fallback emails preserve your name and set "Reply-To" to your original email.
//               </li>
//             </ul>
//           </div>
//         </div>
//       </motion.div>

//       {/* DNS Configuration Modal */}
//       {dnsModal && verifyingSender && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
//                   DNS Configuration: {verifyingSender.email}
//                 </h3>
//                 <p className="text-sm text-gray-500">Add these records to your DNS provider (Cloudflare, GoDaddy, etc.)</p>
//               </div>
//               <button
//                 onClick={() => {
//                   setDnsModal(false);
//                   setVerifyingSender(null);
//                 }}
//                 className="text-gray-500 hover:text-gray-700 p-2"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto space-y-6 pr-2">
//               <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
//                 <Info size={20} className="text-blue-600 shrink-0" />
//                 <p className="text-sm text-blue-800">
//                   Verification can take up to 48 hours to propagate, but usually happens within minutes.
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 {generateDNSRecords(verifyingSender.email).map((record, i) => (
//                   <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="font-bold text-sm text-gray-700 uppercase">{record.description}</span>
//                       <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">{record.type}</span>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-[10px] text-gray-400 uppercase font-bold">Host / Name</label>
//                         <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 group">
//                           <code className="text-xs break-all flex-1">{record.host}</code>
//                           <button onClick={() => handleCopy(record.host)} className="text-gray-400 hover:text-red-600 transition-colors">
//                             <Copy size={14} />
//                           </button>
//                         </div>
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-[10px] text-gray-400 uppercase font-bold">Value / Points To</label>
//                         <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
//                           <code className="text-xs break-all flex-1">{record.value}</code>
//                           <button onClick={() => handleCopy(record.value)} className="text-gray-400 hover:text-red-600 transition-colors">
//                             <Copy size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-8 flex gap-3">
//               <Button
//                 className="flex-1"
//                 onClick={() => handleDNSCheck(verifyingSender.id)}
//                 disabled={isLoading}
//                 style={{ backgroundColor: '#DC143C' }}
//               >
//                 {isLoading ? <RefreshCw className="animate-spin mr-2" size={16} /> : null}
//                 Verify Records
//               </Button>
//               <Button
//                 variant="outline"
//                 className="flex-1"
//                 onClick={() => setDnsModal(false)}
//               >
//                 Close
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* OTP Modal */}
//       {otpModal && verifyingSender && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
//                 Verify Email Sender
//               </h3>
//               <button
//                 onClick={() => {
//                   setOtpModal(false);
//                   setOtpValue('');
//                   setVerifyingSender(null);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {verificationState.isSending && verificationState.countdown > 0 ? (
//               <div>
//                 <p className="text-sm mb-4" style={{ color: '#666666' }}>
//                   Enter the 6-digit code sent to {verifyingSender.email}
//                 </p>
//                 <Input
//                   type="text"
//                   value={otpValue}
//                   onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   placeholder="000000"
//                   maxLength={6}
//                   className="text-center text-xl font-mono tracking-widest mb-4"
//                 />
                
//                 <div className="text-center mb-4 text-sm" style={{ color: '#999999' }}>
//                   <Clock size={16} className="inline mr-2" />
//                   Resend in {verificationState.countdown}s
//                 </div>

//                 <div className="flex gap-3">
//                   <Button
//                     onClick={handleVerifyOTP}
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
//                       setOtpValue('');
//                     }}
//                     variant="outline"
//                     className="flex-1"
//                   >
//                     Clear
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-sm mb-6" style={{ color: '#666666' }}>
//                   We'll send a verification code to {verifyingSender.email}
//                 </p>
//                 <Button
//                   onClick={handleSendOTP}
//                   className="w-full"
//                   style={{ backgroundColor: '#DC143C' }}
//                   disabled={verificationState.isSending}
//                 >
//                   {verificationState.isSending ? 'Sending...' : 'Send OTP'}
//                 </Button>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }









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
  RefreshCw,
  Globe,
  Copy,
  Info
} from 'lucide-react';
import { useWorkspaceID } from '@/lib/id/workspace';
import { toast } from 'sonner';
import { useEmailSenderStore, EmailSender } from '@/lib/stores/email-sender-store';

/**
 * Generates the expected DNS records for a user to add.
 * This is a client-side copy of the generation logic to avoid importing Node.js 'dns' module.
 */
function generateDNSRecords(domain: string) {
  const dkimSelector = 'dropaphi';
  const dkimPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...'; // Match lib/auth/dns-utils.ts

  return [
    {
      type: 'TXT',
      host: '@',
      value: 'v=spf1 include:_spf.dropaphi.xyz ~all',
      description: 'SPF Record',
      status_key: 'spf'
    },
    {
      type: 'CNAME',
      host: `dropaphi._domainkey`,
      value: `dkim.dropaphi.xyz`,
      description: 'DKIM Record (CNAME)',
      status_key: 'dkim'
    },
    {
      type: 'TXT',
      host: '_dmarc',
      value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}`,
      description: 'DMARC Record',
      status_key: 'dmarc'
    }
  ];
}

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
  const [newSender, setNewSender] = useState({ email: '', name: '', isDomain: false });
  const [otpModal, setOtpModal] = useState(false);
  const [dnsModal, setDnsModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifyingSender, setVerifyingSender] = useState<EmailSender | null>(null);
  
  // Local loading states for individual actions
  const [addingSender, setAddingSender] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [checkingDnsId, setCheckingDnsId] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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

    setAddingSender(true);
    try {
      const sender = await addSender(workspaceId, newSender);
      setShowAddForm(false);
      setNewSender({ email: '', name: '', isDomain: false });
      toast.success('Email sender added successfully');
      
      // Start verification based on type
      if (sender.isDomain) {
        setVerifyingSender(sender);
        setDnsModal(true);
      } else {
        initiateVerification(sender);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingSender(false);
    }
  };

  const initiateVerification = (sender: EmailSender) => {
    setVerifyingSender(sender);
    setOtpModal(true);
    setOtpValue('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSendOTP = async () => {
    if (!verifyingSender) return;

    setSendingOtp(true);
    try {
      await sendVerificationCode(workspaceId, verifyingSender.email);
      toast.success('Verification code sent');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6 || !verifyingSender) return;

    setVerifyingOtp(true);
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
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleDNSCheck = async (senderId: string) => {
    setCheckingDnsId(senderId);
    try {
      const result = await checkDNSRecords(senderId, workspaceId);
      if (result.spf && result.dkim) {
        toast.success('All DNS records verified!');
        if (dnsModal) setDnsModal(false);
      } else {
        toast.info(`SPF: ${result.spf ? '✓' : '✗'}, DKIM: ${result.dkim ? '✓' : '✗'}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingDnsId(null);
    }
  };

  const handleDeleteSender = async (senderId: string) => {
    setDeletingId(senderId);
    try {
      await deleteSender(senderId, workspaceId);
      toast.success('Sender deleted successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
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
                Add New Email Identity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-2 bg-white rounded border border-gray-200">
                  <button
                    onClick={() => setNewSender({ ...newSender, isDomain: false })}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${!newSender.isDomain ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Individual Email
                  </button>
                  <button
                    onClick={() => setNewSender({ ...newSender, isDomain: true })}
                    className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${newSender.isDomain ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Full Domain
                  </button>
                </div>

                <Input
                  placeholder="Identity Name (e.g., Support Team)"
                  value={newSender.name}
                  onChange={(e) => setNewSender({ ...newSender, name: e.target.value })}
                />
                <Input
                  type={newSender.isDomain ? "text" : "email"}
                  placeholder={newSender.isDomain ? "domain.com (e.g. acme.com)" : "email@domain.com"}
                  value={newSender.email}
                  onChange={(e) => setNewSender({ ...newSender, email: e.target.value })}
                />
                
                {newSender.isDomain && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info size={12} />
                    Verifying a domain allows you to send from any email under that domain.
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddSender}
                    disabled={addingSender}
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {addingSender ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Identity'
                    )}
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
                        {sender.isDomain ? (
                          <Globe size={16} className="text-gray-400" />
                        ) : (
                          <Mail size={16} className="text-gray-400" />
                        )}
                        <span className="font-medium" style={{ color: '#1A1A1A' }}>
                          {sender.name}
                        </span>
                        {(sender.verified || sender.domainVerified) && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        )}
                        {sender.isDomain && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-bold">
                            Domain
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: '#666666' }}>
                        {sender.email}
                      </p>
                      
                      {/* DNS Status */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs flex items-center gap-1 ${sender.spfVerified ? 'text-green-600' : 'text-gray-400'}`}>
                          {sender.spfVerified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          SPF
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${sender.dkimVerified ? 'text-green-600' : 'text-gray-400'}`}>
                          {sender.dkimVerified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          DKIM
                        </span>
                        <button
                          onClick={() => handleDNSCheck(sender.id)}
                          disabled={checkingDnsId === sender.id}
                          className="text-xs text-red-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {checkingDnsId === sender.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          Verify DNS
                        </button>
                        {sender.isDomain && (
                          <button
                            onClick={() => {
                              setVerifyingSender(sender);
                              setDnsModal(true);
                            }}
                            className="text-xs text-gray-500 hover:underline flex items-center gap-1"
                          >
                            <Info size={12} />
                            Setup Guide
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!sender.verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateVerification(sender)}
                          disabled={verifyingId === sender.id}
                          style={{ borderColor: '#DC143C', color: '#DC143C' }}
                        >
                          {verifyingId === sender.id ? (
                            <Loader2 size={14} className="mr-1 animate-spin" />
                          ) : null}
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSender(sender.id)}
                        disabled={deletingId === sender.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {deletingId === sender.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
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
              Email Authentication & Fallback
            </h3>
            <p className="text-sm mb-3" style={{ color: '#666666' }}>
              To ensure high deliverability, verify your domain identities. If a domain is unverified, emails will automatically fall back to <strong>no-reply@dropaphi.xyz</strong>.
            </p>
            <ul className="text-sm space-y-2" style={{ color: '#666666' }}>
              <li className="flex items-start gap-2">
                <span className="font-medium text-red-600">Individual:</span>
                Quick verification via OTP code. Best for personal emails.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-red-600">Domain:</span>
                Verify your whole domain via DNS. Best for organizations (e.g., any @company.com).
              </li>
              <li className="flex items-start gap-2 text-xs italic bg-white p-2 rounded mt-2 border border-red-100">
                <Info size={14} className="shrink-0" />
                Fallback emails preserve your name and set "Reply-To" to your original email.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* DNS Configuration Modal */}
      {dnsModal && verifyingSender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                  DNS Configuration: {verifyingSender.email}
                </h3>
                <p className="text-sm text-gray-500">Add these records to your DNS provider (Cloudflare, GoDaddy, etc.)</p>
              </div>
              <button
                onClick={() => {
                  setDnsModal(false);
                  setVerifyingSender(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
                <Info size={20} className="text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  Verification can take up to 48 hours to propagate, but usually happens within minutes.
                </p>
              </div>

              <div className="space-y-4">
                {generateDNSRecords(verifyingSender.email).map((record, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-700 uppercase">{record.description}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono">{record.type}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Host / Name</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 group">
                          <code className="text-xs break-all flex-1">{record.host}</code>
                          <button onClick={() => handleCopy(record.host)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Value / Points To</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                          <code className="text-xs break-all flex-1">{record.value}</code>
                          <button onClick={() => handleCopy(record.value)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                className="flex-1"
                onClick={() => handleDNSCheck(verifyingSender.id)}
                disabled={checkingDnsId === verifyingSender.id}
                style={{ backgroundColor: '#DC143C' }}
              >
                {checkingDnsId === verifyingSender.id ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Records'
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDnsModal(false)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

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
                    disabled={otpValue.length !== 6 || verifyingOtp}
                    className="flex-1"
                    style={{ 
                      backgroundColor: otpValue.length === 6 && !verifyingOtp ? '#DC143C' : '#CCCCCC',
                    }}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
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
                  disabled={sendingOtp}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}