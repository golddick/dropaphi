// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Search, Shield, Trash2, Eye, MoreVertical, Mail, MessageSquare, X } from 'lucide-react';

// export default function AdminUsersPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [selectedUser, setSelectedUser] = useState<any | null>(null);
//   const [emailModal, setEmailModal] = useState(false);
//   const [smsModal, setSmsModal] = useState(false);
//   const [emailSubject, setEmailSubject] = useState('');
//   const [emailBody, setEmailBody] = useState('');
//   const [smsMessage, setSmsMessage] = useState('');
//   const [users, setUsers] = useState([
//     {
//       id: 'user_001',
//       name: 'John Doe',
//       email: 'john@example.com',
//       phone: '+234-810-123-4567',
//       status: 'active', 
//       joinedAt: '2024-02-16',
//       totalSpent: 4250.50,
//       apiCalls: 125000,
//       role: 'user',
//       currentPlan: 'Professional',
//     },
//     {
//       id: 'user_002',
//       name: 'Jane Smith',
//       email: 'jane@example.com',
//       phone: '+234-911-234-5678',
//       status: 'active',
//       joinedAt: '2024-02-15',
//       totalSpent: 2150.00,
//       apiCalls: 45000,
//       role: 'user',
//       currentPlan: 'Basic',
//     },
//     {
//       id: 'user_003',
//       name: 'Bob Johnson',
//       email: 'bob@example.com',
//       phone: '+234-909-876-5432',
//       status: 'suspended',
//       joinedAt: '2024-02-14',
//       totalSpent: 500.00,
//       apiCalls: 5000,
//       role: 'user',
//       currentPlan: 'Basic',
//     },
//     {
//       id: 'user_004',
//       name: 'Alice Williams',
//       email: 'alice@example.com',
//       phone: '+234-815-567-8901',
//       status: 'active',
//       joinedAt: '2024-02-13',
//       totalSpent: 1800.75,
//       apiCalls: 85000,
//       role: 'user',
//       currentPlan: 'Professional',
//     },
//     {
//       id: 'user_005',
//       name: 'Charlie Brown',
//       email: 'charlie@example.com',
//       phone: '+234-801-345-6789',
//       status: 'inactive',
//       joinedAt: '2024-02-12',
//       totalSpent: 250.00,
//       apiCalls: 2000,
//       role: 'user',
//       currentPlan: 'Basic',
//     },
//     {
//       id: 'user_006',
//       name: 'Diana Prince',
//       email: 'diana@example.com',
//       phone: '+234-807-654-3210',
//       status: 'active',
//       joinedAt: '2024-02-11',
//       totalSpent: 3500.25,
//       apiCalls: 200000,
//       role: 'premium',
//       currentPlan: 'Enterprise',
//     },
//   ]);

//   const deleteUser = (userId: string) => {
//     if (confirm('Are you sure you want to delete this user?')) {
//       setUsers((prev) => prev.filter((u) => u.id !== userId));
//       setSelectedUser(null);
//     }
//   };

//   const toggleUserStatus = (userId: string) => {
//     setUsers((prev) =>
//       prev.map((u) =>
//         u.id === userId
//           ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
//           : u
//       )
//     );
//   };

//   const sendEmail = () => {
//     if (!emailSubject.trim() || !emailBody.trim()) return;
//     alert(`Email sent to ${selectedUser.email}:\n\nSubject: ${emailSubject}\n\n${emailBody}`);
//     setEmailModal(false);
//     setEmailSubject('');
//     setEmailBody('');
//   };

//   const sendSMS = () => {
//     if (!smsMessage.trim()) return;
//     alert(`SMS sent to ${selectedUser.phone}:\n\n${smsMessage}`);
//     setSmsModal(false);
//     setSmsMessage('');
//   };

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          user.phone.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//           User Management
//         </h1>
//         <p style={{ color: '#666666' }}>
//           Manage all platform users and their accounts
//         </p>
//       </motion.div>

//       {/* Filters */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.1, duration: 0.5 }}
//         className="flex flex-col sm:flex-row gap-4"
//       >
//         <div className="flex-1">
//           <Input
//             type="text"
//             placeholder="Search users by name or email..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full"
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 border rounded"
//           style={{ borderColor: '#E5E5E5' }}
//         >
//           <option value="all">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//           <option value="suspended">Suspended</option>
//         </select>
//       </motion.div>

//       {/* Users Table */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2, duration: 0.5 }}
//         className="border rounded-lg overflow-hidden"
//         style={{
//           backgroundColor: '#FFFFFF',
//           borderColor: '#E5E5E5',
//         }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
//                 <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>User</th>
//                 <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Status</th>
//                 <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Total Spent</th>
//                 <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>API Calls</th>
//                 <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Joined</th>
//                 <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.map((user, idx) => (
//                 <tr
//                   key={user.id}
//                   style={{
//                     borderBottom: idx < filteredUsers.length - 1 ? '1px solid #E5E5E5' : 'none'
//                   }}
//                 >
//                   <td className="px-6 py-4">
//                     <div>
//                       <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
//                         {user.name}
//                       </p>
//                       <p className="text-xs" style={{ color: '#999999' }}>
//                         {user.email}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className="text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1"
//                       style={{
//                         backgroundColor:
//                           user.status === 'active'
//                             ? '#E8F5E9'
//                             : user.status === 'suspended'
//                             ? '#FFE5E5'
//                             : '#F5F5F5',
//                         color:
//                           user.status === 'active'
//                             ? '#2E7D32'
//                             : user.status === 'suspended'
//                             ? '#B81C1C'
//                             : '#666666',
//                       }}
//                     >
//                       {user.role === 'premium' && <Shield size={12} />}
//                       {user.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <p className="font-bold" style={{ color: '#1A1A1A' }}>
//                       ₦{user.totalSpent.toLocaleString('en-NG', {minimumFractionDigits: 2})}
//                     </p>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <p className="text-sm" style={{ color: '#666666' }}>
//                       {(user.apiCalls / 1000).toFixed(0)}K
//                     </p>
//                   </td>
//                   <td className="px-6 py-4">
//                     <p className="text-sm" style={{ color: '#999999' }}>
//                       {user.joinedAt}
//                     </p>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => setSelectedUser(user)}
//                         style={{ color: '#DC143C' }}
//                         className="hover:opacity-70 transition-opacity"
//                       >
//                         <Eye size={18} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>

//       {/* Pagination */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.3, duration: 0.5 }}
//         className="flex items-center justify-between"
//       >
//         <p style={{ color: '#666666' }} className="text-sm">
//           Showing {filteredUsers.length} of {users.length} users
//         </p>
//         <div className="flex gap-2">
//           <Button variant="outline" disabled>
//             Previous
//           </Button>
//           <Button variant="outline" disabled>
//             Next
//           </Button>
//         </div>
//       </motion.div>

//       {/* User Detail Modal */}
//       {selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-lg max-h-screen overflow-y-auto"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
//                 User Profile
//               </h2>
//               <button
//                 onClick={() => setSelectedUser(null)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="space-y-6 mb-8">
//               {/* User Info Grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Name
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {selectedUser.name}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Email
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {selectedUser.email}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Phone
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {selectedUser.phone}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Status
//                   </p>
//                   <p
//                     className="text-lg font-bold capitalize"
//                     style={{
//                       color:
//                         selectedUser.status === 'active'
//                           ? '#2E7D32'
//                           : selectedUser.status === 'suspended'
//                           ? '#B81C1C'
//                           : '#666666',
//                     }}
//                   >
//                     {selectedUser.status}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Current Plan
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {selectedUser.currentPlan}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Joined
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {selectedUser.joinedAt}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     Total Spent
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#DC143C' }}>
//                     ₦{selectedUser.totalSpent.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
//                   </p>
//                 </div>

//                 <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
//                   <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
//                     API Calls
//                   </p>
//                   <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
//                     {(selectedUser.apiCalls / 1000).toFixed(0)}K
//                   </p>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <Button
//                   onClick={() => {
//                     setEmailModal(true);
//                     setSelectedUser(null);
//                   }}
//                   className="flex-1"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   <Mail size={18} className="mr-2" />
//                   Send Email
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     setSmsModal(true);
//                     setSelectedUser(null);
//                   }}
//                   className="flex-1"
//                   style={{ backgroundColor: '#DC143C' }}
//                 >
//                   <MessageSquare size={18} className="mr-2" />
//                   Send SMS
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     toggleUserStatus(selectedUser.id);
//                     setSelectedUser(null);
//                   }}
//                   variant="outline"
//                   className="flex-1"
//                 >
//                   {selectedUser.status === 'active' ? 'Suspend' : 'Activate'} User
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     deleteUser(selectedUser.id);
//                   }}
//                   variant="outline"
//                   className="flex-1 hover:bg-red-50"
//                 >
//                   <Trash2 size={18} className="mr-2" style={{ color: '#DC143C' }} />
//                   Delete
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Email Modal */}
//       {emailModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
//                 Send Email
//               </h3>
//               <button
//                 onClick={() => {
//                   setEmailModal(false);
//                   setEmailSubject('');
//                   setEmailBody('');
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="space-y-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//                   To
//                 </label>
//                 <input
//                   type="text"
//                   disabled
//                   value={selectedUser?.email || ''}
//                   className="w-full p-2 border rounded-lg bg-gray-50"
//                   style={{ borderColor: '#E5E5E5' }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//                   Subject
//                 </label>
//                 <Input
//                   type="text"
//                   value={emailSubject}
//                   onChange={(e) => setEmailSubject(e.target.value)}
//                   placeholder="Email subject..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//                   Message
//                 </label>
//                 <textarea
//                   value={emailBody}
//                   onChange={(e) => setEmailBody(e.target.value)}
//                   placeholder="Email message..."
//                   rows={5}
//                   className="w-full p-3 border rounded-lg focus:outline-none"
//                   style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
//                 />
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 onClick={() => {
//                   setEmailModal(false);
//                   setEmailSubject('');
//                   setEmailBody('');
//                 }}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={sendEmail}
//                 disabled={!emailSubject.trim() || !emailBody.trim()}
//                 className="flex-1"
//                 style={{
//                   backgroundColor: emailSubject.trim() && emailBody.trim() ? '#DC143C' : '#CCCCCC',
//                   color: '#FFFFFF',
//                 }}
//               >
//                 <Mail size={18} className="mr-2" />
//                 Send
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* SMS Modal */}
//       {smsModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
//                 Send SMS
//               </h3>
//               <button
//                 onClick={() => {
//                   setSmsModal(false);
//                   setSmsMessage('');
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="space-y-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//                   To
//                 </label>
//                 <input
//                   type="text"
//                   disabled
//                   value={selectedUser?.phone || ''}
//                   className="w-full p-2 border rounded-lg bg-gray-50"
//                   style={{ borderColor: '#E5E5E5' }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
//                   Message
//                 </label>
//                 <textarea
//                   value={smsMessage}
//                   onChange={(e) => setSmsMessage(e.target.value)}
//                   placeholder="SMS message (max 160 characters)..."
//                   rows={4}
//                   maxLength={160}
//                   className="w-full p-3 border rounded-lg focus:outline-none"
//                   style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
//                 />
//                 <p className="text-xs mt-1" style={{ color: '#999999' }}>
//                   {smsMessage.length}/160
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 onClick={() => {
//                   setSmsModal(false);
//                   setSmsMessage('');
//                 }}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={sendSMS}
//                 disabled={!smsMessage.trim()}
//                 className="flex-1"
//                 style={{
//                   backgroundColor: smsMessage.trim() ? '#DC143C' : '#CCCCCC',
//                   color: '#FFFFFF',
//                 }}
//               >
//                 <MessageSquare size={18} className="mr-2" />
//                 Send
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }








'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Shield, Trash2, Eye, Mail, MessageSquare, X, 
  ChevronLeft, ChevronRight, Building2, CheckCircle, XCircle,
  Globe, Users, Key, Calendar
} from 'lucide-react';
import { useUsersStore } from '@/lib/stores/admin/store/users';

export default function AdminUsersPage() {
  const [emailModal, setEmailModal] = useState(false);
  const [smsModal, setSmsModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [showWorkspaces, setShowWorkspaces] = useState<string | null>(null);
  
  const { 
    users, 
    selectedUser, 
    isLoading, 
    error,
    pagination,
    filters,
    fetchUsers, 
    setSelectedUser, 
    setFilters,
    updateUserStatus,
    deleteUser,
    sendEmail,
    sendSMS
  } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject.trim() || !emailBody.trim()) return;
    await sendEmail(selectedUser.id, emailSubject, emailBody);
    setEmailModal(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendSMS = async () => {
    if (!selectedUser || !smsMessage.trim()) return;
    await sendSMS(selectedUser.id, smsMessage);
    setSmsModal(false);
    setSmsMessage('');
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'suspended':
        return { bg: '#FFE5E5', text: '#B81C1C' };
      case 'pending_verification':
        return { bg: '#FFF3E0', text: '#F57C00' };
      default:
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'premium' || role === 'admin') {
      return <Shield size={14} className="mr-1" />;
    }
    return null;
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#DC143C' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          User Management
        </h1>
        <p style={{ color: '#666666' }}>
          Manage all platform users and their workspace memberships
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: '#FFE5E5', color: '#B81C1C' }}
        >
          {error}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: '#999999' }} />
          <Input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full pl-10"
          />
        </div>
        <select
          value={filters.status}
          onChange={handleStatusFilter}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: '#E5E5E5' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending_verification">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="border rounded-lg overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E5E5',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
                <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>User</th>
                <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Role</th>
                <th className="px-6 py-3 text-center text-xs font-bold" style={{ color: '#666666' }}>Workspaces</th>
                <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Joined</th>
                <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const statusColors = getStatusColor(user.status);
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx < users.length - 1 ? '1px solid #E5E5E5' : 'none'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: '#DC143C' }}
                        >
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                            {user.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: '#999999' }}>
                            <span>{user.email}</span>
                            {user.emailVerified && (
                              <CheckCircle size={12} style={{ color: '#2E7D32' }} />
                            )}
                          </div>
                          {user.phone && (
                            <p className="text-xs" style={{ color: '#999999' }}>
                              {user.phone}
                              {user.phoneVerified && (
                                <CheckCircle size={12} className="inline ml-1" style={{ color: '#2E7D32' }} />
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded inline-flex items-center"
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                        }}
                      >
                        {user.status === 'active' ? 'Active' : 
                         user.status === 'pending_verification' ? 'Pending' :
                         user.status === 'suspended' ? 'Suspended' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center capitalize">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setShowWorkspaces(showWorkspaces === user.id ? null : user.id)}
                        className="inline-flex items-center gap-1 text-sm hover:underline"
                        style={{ color: '#DC143C' }}
                      >
                        <Building2 size={14} />
                        {user.workspaceCount}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm" style={{ color: '#999999' }}>
                        <Calendar size={14} />
                        {user.joinedAt}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: '#999999' }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:opacity-70 transition-opacity rounded-full hover:bg-gray-100"
                          style={{ color: '#666666' }}
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Workspace details expandable section */}
        {showWorkspaces && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#F9F9F9' }}
          >
            <div className="p-6">
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Workspaces for {users.find(u => u.id === showWorkspaces)?.fullName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.find(u => u.id === showWorkspaces)?.workspaces.map(workspace => (
                  <div
                    key={workspace.id}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold" style={{ color: '#1A1A1A' }}>
                          {workspace.name}
                        </p>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          {workspace.slug}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: workspace.plan === 'ENTERPRISE' ? '#FFE5E5' : '#F5F5F5',
                          color: workspace.plan === 'ENTERPRISE' ? '#B81C1C' : '#666666',
                        }}
                      >
                        {workspace.plan}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                        <Users size={14} />
                        <span>{workspace.memberCount} members</span>
                      </div>
                      {/* <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                        <Key size={14} />
                        <span>{workspace.apiKeyCount} API keys</span>
                      </div> */}
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#666666' }}>
                        <Globe size={14} />
                        <span>Role: {workspace.role}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs mt-3" style={{ color: '#999999' }}>
                      Joined: {workspace.joinedAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <p style={{ color: '#666666' }} className="text-sm">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.total}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-lg max-h-screen overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                User Profile
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {/* User Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Full Name
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                    {selectedUser.fullName}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Email
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                      {selectedUser.email}
                    </p>
                    {selectedUser.emailVerified ? (
                      <CheckCircle size={16} style={{ color: '#2E7D32' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#B81C1C' }} />
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Phone
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                      {selectedUser.phone || 'Not provided'}
                    </p>
                    {selectedUser.phone && selectedUser.phoneVerified && (
                      <CheckCircle size={16} style={{ color: '#2E7D32' }} />
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Status
                  </p>
                  <p
                    className="text-lg font-bold capitalize"
                    style={{ color: getStatusColor(selectedUser.status).text }}
                  >
                    {selectedUser.status}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Role
                  </p>
                  <p className="text-lg font-bold capitalize" style={{ color: '#1A1A1A' }}>
                    {selectedUser.role}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Two-Factor Auth
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                    {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Joined
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                    {selectedUser.joinedAt}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#999999' }}>
                    Last Login
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                    {selectedUser.lastLoginAt 
                      ? new Date(selectedUser.lastLoginAt).toLocaleDateString() 
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Workspaces Section */}
              <div className="mt-6">
                <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  Workspaces ({selectedUser.workspaceCount})
                </h3>
                <div className="space-y-3">
                  {selectedUser.workspaces.map(workspace => (
                    <div
                      key={workspace.id}
                      className="p-3 rounded-lg border"
                      style={{ borderColor: '#E5E5E5' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold" style={{ color: '#1A1A1A' }}>
                            {workspace.name}
                          </p>
                          <p className="text-xs" style={{ color: '#999999' }}>
                            Role: {workspace.role} • Plan: {workspace.plan}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: workspace.status === 'ACTIVE' ? '#E8F5E9' : '#FFE5E5',
                            color: workspace.status === 'ACTIVE' ? '#2E7D32' : '#B81C1C',
                          }}
                        >
                          {workspace.status}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs" style={{ color: '#666666' }}>
                        <span>{workspace.memberCount} members</span>
                        {/* <span>{workspace.apiKeyCount} API keys</span> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  onClick={() => {
                    setEmailModal(true);
                  }}
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <Mail size={18} className="mr-2" />
                  Send Email
                </Button>
                <Button
                  onClick={() => {
                    setSmsModal(true);
                  }}
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Send SMS
                </Button>
                <Button
                  onClick={() => {
                    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
                    updateUserStatus(selectedUser.id, newStatus);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {selectedUser.status === 'active' ? 'Suspend' : 'Activate'} User
                </Button>
                <Button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  variant="outline"
                  className="flex-1 hover:bg-red-50"
                >
                  <Trash2 size={18} className="mr-2" style={{ color: '#DC143C' }} />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Send Email
              </h3>
              <button
                onClick={() => {
                  setEmailModal(false);
                  setEmailSubject('');
                  setEmailBody('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  To
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.email}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                  style={{ borderColor: '#E5E5E5' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Subject
                </label>
                <Input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Message
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email message..."
                  rows={5}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setEmailModal(false);
                  setEmailSubject('');
                  setEmailBody('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!emailSubject.trim() || !emailBody.trim()}
                className="flex-1"
                style={{
                  backgroundColor: emailSubject.trim() && emailBody.trim() ? '#DC143C' : '#CCCCCC',
                  color: '#FFFFFF',
                }}
              >
                <Mail size={18} className="mr-2" />
                Send
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SMS Modal */}
      {smsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Send SMS
              </h3>
              <button
                onClick={() => {
                  setSmsModal(false);
                  setSmsMessage('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  To
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.phone || 'No phone number'}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                  style={{ borderColor: '#E5E5E5' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Message
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="SMS message (max 160 characters)..."
                  rows={4}
                  maxLength={160}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                />
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  {smsMessage.length}/160
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSmsModal(false);
                  setSmsMessage('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendSMS}
                disabled={!smsMessage.trim() || !selectedUser.phone}
                className="flex-1"
                style={{
                  backgroundColor: smsMessage.trim() && selectedUser.phone ? '#DC143C' : '#CCCCCC',
                  color: '#FFFFFF',
                }}
              >
                <MessageSquare size={18} className="mr-2" />
                Send
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}