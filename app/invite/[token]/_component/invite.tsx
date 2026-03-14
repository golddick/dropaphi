// // app/invite/[code]/client.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Check, Eye, EyeOff, Shield, Mail, Building2, Clock, AlertCircle } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/lib/stores/auth';
// import { useWorkspaceStore } from '@/lib/stores/workspace';
// import { toast } from 'sonner';
// import { useInvitationStore } from '@/lib/stores/workspace/invitation-store';

// interface InviteAcceptClientProps {
//   code: string;
//   initialInviteData: any;
// }

// export default function InviteAcceptClient({ code, initialInviteData }: InviteAcceptClientProps) {
//   const router = useRouter();
  
//   const { user, login, signup, clearMessages } = useAuthStore();
//   const { fetchWorkspaces } = useWorkspaceStore();
//   const { acceptInvitation, isLoading: inviteLoading } = useInvitationStore();
  
//   const [step, setStep] = useState<'review' | 'accept' | 'login' | 'success'>('review');
//   const [inviteData] = useState<any>(initialInviteData);
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [email, setEmail] = useState(inviteData?.invitedEmail || '');
//   const [fullName, setFullName] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     clearMessages();
//   }, [clearMessages]);

//   const calculatePasswordStrength = (password: string) => {
//     let strength = 0;
//     if (password.length >= 8) strength++;
//     if (/[A-Z]/.test(password)) strength++;
//     if (/[0-9]/.test(password)) strength++;
//     if (/[^A-Za-z0-9]/.test(password)) strength++;
//     setPasswordStrength(strength);
//   };

//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPassword(e.target.value);
//     calculatePasswordStrength(e.target.value);
//   };

//   const handleAcceptInvitation = async () => {
//     setIsSubmitting(true);
    
//     try {
//       const result = await acceptInvitation(code);
      
//       if (result?.requiresAuth) {
//         // Store invitation and redirect to login
//         router.push(`/auth/login?redirect=/invite/${code}`);
//         return;
//       }
      
//       if (result?.success) {
//         setStep('success');
//         await fetchWorkspaces();
        
//         setTimeout(() => {
//           router.push(`/dashboard/${result.workspaceSlug}/overview`);
//         }, 2000);
//       }
//     } catch (error) {
//       console.error('Accept failed:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAcceptWithLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       await login(email, password);
//       await handleAcceptInvitation();
//     } catch (error: any) {
//       toast.error(error.message || 'Login failed');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAcceptWithSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (password.length < 8) {
//       toast.error('Password must be at least 8 characters');
//       return;
//     }

//     if (!fullName.trim()) {
//       toast.error('Full name is required');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await signup(fullName, email, password);
//       await handleAcceptInvitation();
//     } catch (error: any) {
//       if (error.message.includes('already exists')) {
//         toast.error('An account with this email already exists. Please sign in instead.');
//         setStep('login');
//       } else {
//         toast.error(error.message || 'Failed to create account');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
//   const strengthColors = ['#DC143C', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];

//   const getRoleBadgeColor = () => {
//     switch(inviteData?.role) {
//       case 'ADMIN': return 'bg-blue-100 text-blue-700';
//       case 'WRITER': return 'bg-green-100 text-green-700';
//       case 'DEVELOPER': return 'bg-orange-100 text-orange-700';
//       case 'VIEWER': return 'bg-gray-100 text-gray-700';
//       default: return 'bg-purple-100 text-purple-700';
//     }
//   };

//   const getRoleIcon = () => {
//     switch(inviteData?.role) {
//       case 'ADMIN': return <Shield size={16} />;
//       case 'WRITER': return <Mail size={16} />;
//       case 'DEVELOPER': return <Building2 size={16} />;
//       default: return <Shield size={16} />;
//     }
//   };

//   if (!inviteData) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p style={{ color: '#666666' }}>Loading invitation...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
//       {/* Navigation */}
//       <nav className="border-b" style={{ borderColor: '#E5E5E5' }}>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//           <Link href="/" className="flex items-center gap-2">
//             <div
//               className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
//               style={{ backgroundColor: '#DC143C' }}
//             >
//               D
//             </div>
//             <span className="hidden sm:inline font-bold text-lg" style={{ color: '#1A1A1A' }}>
//               Drop API
//             </span>
//           </Link>
//         </div>
//       </nav>

//       <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md p-8 rounded-lg border"
//           style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
//         >
//           {step === 'review' && (
//             <div>
//               <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                 You're Invited!
//               </h1>
//               <p className="mb-6" style={{ color: '#666666' }}>
//                 Join {inviteData.workspaceName}
//               </p>

//               <div className="space-y-4 mb-8 p-4 rounded" style={{ backgroundColor: '#F5F5F5' }}>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: '#666666' }}>INVITED BY</p>
//                   <p style={{ color: '#1A1A1A' }}>{inviteData.inviterName}</p>
//                   {inviteData.inviterEmail && (
//                     <p className="text-xs" style={{ color: '#999999' }}>{inviteData.inviterEmail}</p>
//                   )}
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: '#666666' }}>YOUR ROLE</p>
//                   <span
//                     className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded mt-1 ${getRoleBadgeColor()}`}
//                   >
//                     {getRoleIcon()}
//                     {inviteData.role}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: '#666666' }}>WORKSPACE</p>
//                   <p style={{ color: '#1A1A1A' }}>{inviteData.workspaceName}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: '#666666' }}>INVITED EMAIL</p>
//                   <p style={{ color: '#1A1A1A' }}>{inviteData.invitedEmail}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: '#666666' }}>EXPIRES</p>
//                   <p style={{ color: '#1A1A1A' }}>
//                     {new Date(inviteData.expiresAt).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>

//               {user ? (
//                 <Button
//                   onClick={handleAcceptInvitation}
//                   disabled={isSubmitting || inviteLoading}
//                   className="w-full mb-3"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   {isSubmitting || inviteLoading ? 'Accepting...' : 'Accept Invite'}
//                 </Button>
//               ) : (
//                 <>
//                   <Button
//                     onClick={() => setStep('login')}
//                     className="w-full mb-3"
//                     style={{ backgroundColor: '#DC143C' }}
//                   >
//                     I have an account
//                   </Button>
//                   <Button
//                     onClick={() => setStep('accept')}
//                     variant="outline"
//                     className="w-full mb-3"
//                   >
//                     Create new account
//                   </Button>
//                 </>
//               )}
              
//               <Link href="/" className="block">
//                 <Button variant="outline" className="w-full">
//                   Decline
//                 </Button>
//               </Link>
//             </div>
//           )}

//           {step === 'login' && (
//             <div>
//               <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                 Sign in to Accept
//               </h1>
//               <p className="mb-6" style={{ color: '#666666' }}>
//                 Use your existing account to join {inviteData?.workspaceName}
//               </p>

//               <form onSubmit={handleAcceptWithLogin} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Email
//                   </label>
//                   <Input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@example.com"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="••••••••"
//                       required
//                       disabled={isSubmitting}
//                       className="pr-10"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </div>

//                 <Button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   {isSubmitting ? 'Signing in...' : 'Sign In & Accept'}
//                 </Button>

//                 <button
//                   type="button"
//                   onClick={() => setStep('review')}
//                   className="text-sm w-full text-center hover:underline"
//                   style={{ color: '#666666' }}
//                 >
//                   Back to review
//                 </button>
//               </form>
//             </div>
//           )}

//           {step === 'accept' && (
//             <div>
//               <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                 Create Your Account
//               </h1>
//               <p className="mb-6" style={{ color: '#666666' }}>
//                 Join {inviteData?.workspaceName} by creating an account
//               </p>

//               <form onSubmit={handleAcceptWithSignup} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Full Name
//                   </label>
//                   <Input
//                     type="text"
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     placeholder="John Doe"
//                     required
//                     disabled={isSubmitting}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Email
//                   </label>
//                   <Input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@example.com"
//                     required
//                     disabled={isSubmitting}
//                   />
//                   <p className="text-xs mt-1" style={{ color: '#666666' }}>
//                     Must match: {inviteData?.invitedEmail}
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={handlePasswordChange}
//                       placeholder="At least 8 characters"
//                       required
//                       disabled={isSubmitting}
//                       className="pr-10"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
                  
//                   {password && (
//                     <div className="mt-2">
//                       <div className="flex items-center gap-2 mb-1">
//                         <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full transition-all duration-300"
//                             style={{
//                               width: `${(passwordStrength / 4) * 100}%`,
//                               backgroundColor: strengthColors[Math.min(passwordStrength, 4)],
//                             }}
//                           />
//                         </div>
//                         <span
//                           className="text-xs font-medium"
//                           style={{
//                             color: strengthColors[Math.min(passwordStrength, 4)],
//                           }}
//                         >
//                           {strengthLabels[Math.min(passwordStrength, 4)]}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     Confirm Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       placeholder="Confirm your password"
//                       required
//                       disabled={isSubmitting}
//                       className="pr-10"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2"
//                     >
//                       {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </div>

//                 <Button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   {isSubmitting ? 'Creating Account...' : 'Create Account & Accept'}
//                 </Button>

//                 <button
//                   type="button"
//                   onClick={() => setStep('review')}
//                   className="text-sm w-full text-center hover:underline"
//                   style={{ color: '#666666' }}
//                 >
//                   Back to review
//                 </button>
//               </form>
//             </div>
//           )}

//           {step === 'success' && (
//             <div className="text-center">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//                 className="flex justify-center mb-6"
//               >
//                 <div
//                   className="w-16 h-16 rounded-full flex items-center justify-center"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   <Check size={32} className="text-white" />
//                 </div>
//               </motion.div>

//               <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                 Invite Accepted!
//               </h1>
//               <p className="mb-6" style={{ color: '#666666' }}>
//                 You've successfully joined {inviteData?.workspaceName}. Redirecting to your dashboard...
//               </p>

//               <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </main>
//   );
// }








// app/invite/[code]/_component/invite.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Eye, EyeOff, Shield, Mail, Building2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { toast } from 'sonner';
import { useInvitationStore } from '@/lib/stores/workspace/invitation-store';

interface InviteAcceptClientProps {
  token: string;
}

export default function InviteAcceptClient({ token }: InviteAcceptClientProps) {
  const router = useRouter();
  
  const { user, login, signup, clearMessages } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  const { 
    currentInvitation, 
    isLoading: inviteLoading, 
    error: inviteError,
    fetchInvitation, 
    acceptInvitation,
    clearInvitation,
    clearError 
  } = useInvitationStore();
  
  const [step, setStep] = useState<'loading' | 'review' | 'accept' | 'login' | 'success'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch invitation on mount
  useEffect(() => {
    if (token) {
      loadInvitation();
    }
    
    return () => {
      clearInvitation();
      clearMessages();
    };
  }, [token]);

  // Handle errors
  useEffect(() => {
    if (inviteError) {
      toast.error(inviteError);
      clearError();
    }
  }, [inviteError, clearError]);

  // Check if user is already logged in and email matches
  useEffect(() => {
    if (currentInvitation && user) {
      if (user.email === currentInvitation.invitedEmail) {
        setStep('review');
        setEmail(currentInvitation.invitedEmail);
      } else {
        toast.error(
          `You're logged in as ${user.email}, but this invitation was sent to ${currentInvitation.invitedEmail}`
        );
        // Log out and redirect to login with the invite code
        useAuthStore.getState().logout();
        setTimeout(() => {
          router.push(`/auth/login?redirect=/invite/${token}`);
        }, 2000);
      }
    } else if (currentInvitation) {
      setStep('review');
      setEmail(currentInvitation.invitedEmail);
    }
  }, [currentInvitation, user, router, token]);

  const loadInvitation = async () => {
    const data = await fetchInvitation(token);
    if (!data) {
      // If no data, show expired or not found
      setStep('loading');
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    calculatePasswordStrength(e.target.value);
  };

  const handleAcceptInvitation = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await acceptInvitation(token);
      
      if (result?.requiresAuth) {
        // Store invitation and redirect to login
        router.push(`/auth/login?redirect=/invite/${token}`);
        return;
      }
      
      if (result?.success) {
        setStep('success');
        await fetchWorkspaces();
        
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 2000);
      }
    } catch (error) {
      console.error('Accept failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptWithLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      await handleAcceptInvitation();
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before accepting the invitation');
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptWithSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(fullName, email, password);
      await handleAcceptInvitation();
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.error('An account with this email already exists. Please sign in instead.');
        setStep('login');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#DC143C', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];

  // Show loading state
  if (inviteLoading || step === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#DC143C' }} />
          <p style={{ color: '#666666' }}>Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Show expired state
  if (currentInvitation?.isExpired) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Clock size={32} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please request a new invitation from your workspace admin.
          </p>
          <Link href="/" className="inline-block">
            <Button style={{ backgroundColor: '#DC143C' }} className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show not found if no invitation data
  if (!currentInvitation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-card flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">
            This invitation could not be found or has already been accepted.
          </p>
          <Link href="/" className="inline-block">
            <Button style={{ backgroundColor: '#DC143C' }} className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = () => {
    switch(currentInvitation.role) {
      case 'ADMIN': return 'bg-blue-100 text-blue-700';
      case 'WRITER': return 'bg-green-100 text-green-700';
      case 'DEVELOPER': return 'bg-orange-100 text-orange-700';
      case 'VIEWER': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const getRoleIcon = () => {
    switch(currentInvitation.role) {
      case 'ADMIN': return <Shield size={16} />;
      case 'WRITER': return <Mail size={16} />;
      case 'DEVELOPER': return <Building2 size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
              style={{ backgroundColor: '#DC143C' }}
            >
              D
            </div>
            <span className="hidden sm:inline font-bold text-lg" style={{ color: '#1A1A1A' }}>
              Drop API
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
        >
          {step === 'review' && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                You're Invited!
              </h1>
              <p className="mb-6" style={{ color: '#666666' }}>
                Join {currentInvitation.workspaceName}
              </p>

              <div className="space-y-4 mb-8 p-4 rounded" style={{ backgroundColor: '#F5F5F5' }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>INVITED BY</p>
                  <p className=' capitalize' style={{ color: '#1A1A1A' }}>{currentInvitation.inviterName}</p>
                  {currentInvitation.inviterEmail && (
                    <p className="text-xs" style={{ color: '#999999' }}>{currentInvitation.inviterEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>YOUR ROLE</p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded mt-1 ${getRoleBadgeColor()}`}
                  >
                    {getRoleIcon()}
                    {currentInvitation.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>WORKSPACE</p>
                  <p style={{ color: '#1A1A1A' }}>{currentInvitation.workspaceName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>INVITED EMAIL</p>
                  <p style={{ color: '#1A1A1A' }}>{currentInvitation.invitedEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>EXPIRES</p>
                  <p style={{ color: '#1A1A1A' }}>
                    {new Date(currentInvitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user ? (
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isSubmitting || inviteLoading}
                  className="w-full mb-3"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {isSubmitting || inviteLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Accepting...
                    </span>
                  ) : (
                    'Accept Invite'
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setStep('login')}
                    className="w-full mb-3"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    Accept & login 
                  </Button>
                  <Button
                    onClick={() => setStep('accept')}
                    variant="outline"
                    className="w-full mb-3"
                  >
                    Accept & Create account
                  </Button>
                </>
              )}
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Decline
                </Button>
              </Link>
            </div>
          )}

          {step === 'login' && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Sign in to Accept
              </h1>
              <p className="mb-6" style={{ color: '#666666' }}>
                Use your existing account to join {currentInvitation?.workspaceName}
              </p>

              <form onSubmit={handleAcceptWithLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In & Accept'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="text-sm w-full text-center hover:underline"
                  style={{ color: '#666666' }}
                >
                  Back to review
                </button>
              </form>
            </div>
          )}

          {step === 'accept' && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Create Your Account
              </h1>
              <p className="mb-6" style={{ color: '#666666' }}>
                Join {currentInvitation?.workspaceName} by creating an account
              </p>

              <form onSubmit={handleAcceptWithSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666666' }}>
                    Must match: {currentInvitation?.invitedEmail}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="At least 8 characters"
                      required
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${(passwordStrength / 4) * 100}%`,
                              backgroundColor: strengthColors[Math.min(passwordStrength, 4)],
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: strengthColors[Math.min(passwordStrength, 4)],
                          }}
                        >
                          {strengthLabels[Math.min(passwordStrength, 4)]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account & Accept'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="text-sm w-full text-center hover:underline"
                  style={{ color: '#666666' }}
                >
                  Back to review
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <Check size={32} className="text-white" />
                </div>
              </motion.div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Invite Accepted!
              </h1>
              <p className="mb-6" style={{ color: '#666666' }}>
                You've successfully joined {currentInvitation?.workspaceName}. Redirecting to your dashboard...
              </p>

              <Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#DC143C' }} />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}