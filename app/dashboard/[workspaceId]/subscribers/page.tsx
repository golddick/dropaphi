// app/dashboard/[workspaceId]/subscribers/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Mail, Trash2, ChevronRight, Send, X, Copy, Loader2, Users, UserCheck, UserX, AlertCircle, RefreshCw } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSubscriberStore } from '@/lib/stores/subscriber/subscriber-store';

// Define the stats type
interface StatsData {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

export default function SubscribersPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'all' | 'email'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedChannel] = useState<'email'>('email');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED'>('ALL');
  
  const { currentWorkspace } = useWorkspaceStore();
  const { 
    subscribers,
    stats,
    isLoading,
    error,
    fetchSubscribers,
    fetchStats,
    deleteSubscriber,
    bulkDeleteSubscribers,
    clearError
  } = useSubscriberStore();
  
  const workspaceId = currentWorkspace?.id;
  const subscribersList = Array.isArray(subscribers) ? subscribers : [];

  // Helper function to extract stats data safely
  const getStatsData = (): StatsData => {
    if (!stats) {
      return { total: 0, active: 0, unsubscribed: 0, bounced: 0 };
    }
    
    // Check if stats has a nested 'stats' property
    if ('stats' in stats && stats.stats && typeof stats.stats === 'object') {
      const nestedStats = stats.stats as any;
      return {
        total: nestedStats.total ?? 0,
        active: nestedStats.active ?? 0,
        unsubscribed: nestedStats.unsubscribed ?? 0,
        bounced: nestedStats.bounced ?? 0,
      };
    }
    
    // Otherwise, treat stats as the data object
    const statsObj = stats as any;
    return {
      total: statsObj.total ?? 0,
      active: statsObj.active ?? 0,
      unsubscribed: statsObj.unsubscribed ?? 0,
      bounced: statsObj.bounced ?? 0,
    };
  };

  const statsData = getStatsData();

  // Load data on mount
  useEffect(() => {
    if (workspaceId) {
      fetchSubscribers({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
      fetchStats();
    }
  }, [workspaceId, fetchSubscribers, fetchStats, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      await deleteSubscriber(id);
      toast.success('Subscriber deleted successfully');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) {
      await bulkDeleteSubscribers(selectedSubscribers);
      setSelectedSubscribers([]);
      toast.success(`${selectedSubscribers.length} subscribers deleted`);
    }
  };

  const toggleSubscriberSelection = (id: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredSubscribers = subscribersList.filter((sub) => {
    if (!sub) return false;
    
    const matchesSearch = 
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (filterType === 'email') return true;
    
    return true;
  });

  const selectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    }
  };

  const sendBulkMessage = () => {
    if (selectedSubscribers.length === 0) {
      toast.error('No subscribers selected');
      return;
    }
    
    const selectedEmails = subscribersList
      .filter(s => selectedSubscribers.includes(s.id) && s.status === 'ACTIVE')
      .map(s => s.email)
      .filter(email => email);
    
    if (selectedEmails.length === 0) {
      toast.error('No active subscribers selected');
      return;
    }
    
    localStorage.setItem('bulkMessageRecipients', JSON.stringify(selectedEmails));
    localStorage.setItem('bulkMessageContent', bulkMessage);
    localStorage.setItem('bulkMessageSubject', 'Message from Newsletter');
    
    toast.success(`Ready to send to ${selectedEmails.length} active subscribers`);
    setShowBulkModal(false);
    setBulkMessage('');
    setSelectedSubscribers([]);
    
    router.push(`/dashboard/${workspaceId}/email?bulk=true&count=${selectedEmails.length}`);
  };

  const copySubscriptionUrl = () => {
    const url = `${window.location.origin}/subscribe/${workspaceId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Subscription URL copied to clipboard');
  };

  // Stats display - use statsData which now has guaranteed values
  const statCards = [
    { label: 'Total Subscribers', value: statsData.total, icon: Users, color: '#3B82F6', bgColor: '#EFF6FF' },
    { label: 'Active', value: statsData.active, icon: UserCheck, color: '#10B981', bgColor: '#E6F7E6' },
    { label: 'Unsubscribed', value: statsData.unsubscribed, icon: UserX, color: '#6B7280', bgColor: '#F5F5F5' },
    { label: 'Bounced', value: statsData.bounced, icon: AlertCircle, color: '#DC143C', bgColor: '#FFE6E6' },
  ];

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Subscribers</h1>
            <p style={{ color: '#666666' }}>Manage all your email subscribers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copySubscriptionUrl} className="gap-2">
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Sub URL
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => fetchStats()} className="gap-2">
              <RefreshCw size={16} />
              Refresh Stats
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                {stat.value}
              </span>
            </div>
            <p style={{ color: '#666666' }} className="text-sm font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filter and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#999999' }} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              style={{ borderColor: '#E5E5E5' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
              <option value="BOUNCED">Bounced</option>
            </select>

            {/* Channel Filter */}
            {(['all', 'email'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded border capitalize font-medium text-sm transition-colors`}
                style={{
                  borderColor: filterType === type ? '#DC143C' : '#E5E5E5',
                  backgroundColor: filterType === type ? '#FFF5F5' : '#FFFFFF',
                  color: filterType === type ? '#DC143C' : '#666666',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {selectedSubscribers.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBulkModal(true)}
                style={{ backgroundColor: '#DC143C' }}
                className="whitespace-nowrap"
              >
                <Send size={18} className="mr-2" />
                Send to {selectedSubscribers.length}
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                className="whitespace-nowrap text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} className="mr-2" />
                Delete {selectedSubscribers.length}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Subscribers List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border rounded-lg overflow-hidden"
        style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-bold" style={{ color: '#666666' }}>
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>
                    Joined
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id}
                    style={{
                      borderBottom: index < filteredSubscribers.length - 1 ? '1px solid #E5E5E5' : 'none',
                      backgroundColor: selectedSubscribers.includes(subscriber.id) ? '#FFF5F5' : 'transparent',
                    }}
                  >
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={() => toggleSubscriberSelection(subscriber.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Link href={`/dashboard/${workspaceId}/subscribers/${subscriber.id}`}>
                        <p
                          className="font-medium hover:text-red-600 capitalize transition-colors"
                          style={{ color: '#1A1A1A' }}
                        >
                          {subscriber.name || '—'}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm" style={{ color: '#666666' }}>
                      {subscriber.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor:
                            subscriber.status === 'ACTIVE'
                              ? '#E6F7E6'
                              : subscriber.status === 'UNSUBSCRIBED'
                              ? '#F5F5F5'
                              : '#FFE6E6',
                          color:
                            subscriber.status === 'ACTIVE'
                              ? '#10B981'
                              : subscriber.status === 'UNSUBSCRIBED'
                              ? '#6B7280'
                              : '#DC143C',
                        }}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm" style={{ color: '#666666' }}>
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/${workspaceId}/subscribers/${subscriber.id}`}>
                          <Button size="sm" variant="outline" className="hover:border-red-600 hover:text-red-600">
                            <ChevronRight size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                          className="hover:border-red-600 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubscribers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  No subscribers found
                </p>
                <p style={{ color: '#666666' }}>
                  {searchQuery ? 'Try a different search term' : 'Start by sharing your subscription page'}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Bulk Send Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Send to {selectedSubscribers.length} Subscribers
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Channel
                </label>
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 rounded border capitalize font-medium text-sm"
                    style={{
                      borderColor: '#DC143C',
                      backgroundColor: '#FFF5F5',
                      color: '#DC143C',
                    }}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Message
                </label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                  rows={5}
                  style={{ borderColor: '#E5E5E5' }}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Only active subscribers will receive emails. Unsubscribed and bounced subscribers
                  are automatically excluded.
                </p>
              </div>

              <p className="text-sm" style={{ color: '#666666' }}>
                Will send to {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? 's' : ''}
              </p>

              <div className="flex gap-3">
                <Button onClick={() => setShowBulkModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={sendBulkMessage}
                  disabled={!bulkMessage.trim()}
                  className="flex-1"
                  style={{ backgroundColor: bulkMessage.trim() ? '#DC143C' : '#CCCCCC' }}
                >
                  <Send size={18} className="mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}