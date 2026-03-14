// app/dashboard/subscribers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, MessageSquare, Calendar, Phone, Trash2, Send, Loader2, Edit2, Check, X } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { toast } from 'sonner';
import { useSubscriberStore } from '@/lib/stores/subscriber/subscriber-store';

export default function SubscriberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriberId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'email'>('overview');
  const [showSendModal, setShowSendModal] = useState(false);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('email');
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSegments, setEditSegments] = useState<string[]>([]);
  const [segmentInput, setSegmentInput] = useState('');
  
  const { currentWorkspace } = useWorkspaceStore();
  const { 
    currentSubscriber,
    isLoading,
    error,
    fetchSubscriber,
    updateSubscriber,
    deleteSubscriber,
    clearError
  } = useSubscriberStore();
  
  const workspaceId = currentWorkspace?.id;
  const subscriber = currentSubscriber;


  // Load subscriber data
  useEffect(() => {
    if (workspaceId && subscriberId) {
      fetchSubscriber(subscriberId);
    }
  }, [workspaceId, subscriberId, fetchSubscriber]);

  // Initialize edit form
  useEffect(() => {
    if (subscriber) {
      setEditName(subscriber.name || '');
      setEditSegments(subscriber.segments || []);
    }
  }, [subscriber]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      await deleteSubscriber(subscriberId);
      toast.success('Subscriber deleted successfully');
      router.push(`/dashboard/subscribers`);
    }
  };

  const handleUpdate = async () => {
    await updateSubscriber(subscriberId, {
      name: editName || undefined,
      segments: editSegments,
    });
    setIsEditing(false);
    toast.success('Subscriber updated successfully');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriber) return;
    
    if (messageType === 'email') {
      // Store in localStorage for email composer
      localStorage.setItem('composerEmail', subscriber.email);
      localStorage.setItem('composerSubject', subject);
      localStorage.setItem('composerContent', messageContent);
      
      // Navigate to email composer
      router.push(`/dashboard/${workspaceId}/email/composer?to=${encodeURIComponent(subscriber.email)}`);
    } else {
      // Handle SMS sending (to be implemented)
      console.log('sms')
      // toast.success(`SMS would be sent to ${subscriber.phone || subscriber.email}`);
    }
    
    setShowSendModal(false);
    setMessageContent('');
    setSubject('');
  };

  const addSegment = () => {
    if (segmentInput.trim() && !editSegments.includes(segmentInput.trim())) {
      setEditSegments([...editSegments, segmentInput.trim()]);
      setSegmentInput('');
    }
  };

  const removeSegment = (segment: string) => {
    setEditSegments(editSegments.filter(s => s !== segment));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Subscriber not found</p>
        <Button asChild className="mt-4">
          <Link  href={`/dashboard/${workspaceId}/subscribers`}>Back to Subscribers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href={`/dashboard/${workspaceId}/subscribers`} className="inline-flex items-center gap-2 mb-4 text-sm font-bold hover:text-red-700 transition-colors" style={{ color: '#DC143C' }}>
          <ArrowLeft size={16} />
          Back to Subscribers
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold capitalize mb-2" style={{ color: '#1A1A1A' }}>
              {subscriber.name || 'Unnamed Subscriber'}
            </h1>
            <p style={{ color: '#666666' }}>
              Subscriber since {new Date(subscriber.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setMessageType('email');
                setShowSendModal(true);
              }}
              size="sm"
              className="flex gap-2 items-center"
              style={{ backgroundColor: '#DC143C' }}
            >
              <Mail size={16} />
              Send Email
            </Button>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="outline"
              className="flex gap-2 items-center text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          { icon: Mail, label: 'Email', value: subscriber.email },
          { icon: Calendar, label: 'Subscribed', value: new Date(subscriber.createdAt).toLocaleDateString() },
          // { icon: Calendar, label: 'Confirmed', value: subscriber.confirmedAt ? new Date(subscriber.confirmedAt).toLocaleDateString() : 'Pending' },
          // { icon: Calendar, label: 'Last Updated', value: new Date(subscriber.updatedAt).toLocaleDateString() },
        ].map((item, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg flex items-start gap-3"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
          >
            <item.icon size={18} style={{ color: '#DC143C', marginTop: '4px' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: '#666666' }}>
                {item.label.toUpperCase()}
              </p>
              <p className="font-bold" style={{ color: '#1A1A1A' }}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Status and Segments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
          <p className="text-xs font-bold mb-3" style={{ color: '#666666' }}>STATUS</p>
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: 
                  subscriber.status === 'ACTIVE' ? '#00A86B' :
                  subscriber.status === 'UNSUBSCRIBED' ? '#666666' : '#DC143C'
              }}
            />
            <span className="font-bold" style={{ color: '#1A1A1A' }}>
              {subscriber.status}
            </span>
          </div>
        </div>

        <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold" style={{ color: '#666666' }}>SEGMENTS</p>
            {!isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2"
              >
                <Edit2 size={14} />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUpdate}
                  className="h-6 px-2 text-green-600"
                >
                  <Check size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="h-6 px-2 text-red-600"
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={segmentInput}
                  onChange={(e) => setSegmentInput(e.target.value)}
                  placeholder="Add segment..."
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addSegment()}
                />
                <Button size="sm" onClick={addSegment}>Add</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {editSegments.map((segment) => (
                  <span
                    key={segment}
                    className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                    style={{ backgroundColor: '#FFF5F5', color: '#DC143C' }}
                  >
                    {segment}
                    <button
                      onClick={() => removeSegment(segment)}
                      className="hover:text-red-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {subscriber.segments && subscriber.segments.length > 0 ? (
                subscriber.segments.map((segment) => (
                  <span
                    key={segment}
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: '#FFF5F5', color: '#DC143C' }}
                  >
                    {segment}
                  </span>
                ))
              ) : (
                <p className="text-sm" style={{ color: '#999999' }}>No segments</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom Fields */}
      {subscriber.customFields && Object.keys(subscriber.customFields).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="p-4 border rounded-lg"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: '#666666' }}>CUSTOM FIELDS</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(subscriber.customFields).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-bold" style={{ color: '#666666' }}>{key}</p>
                <p className="text-sm" style={{ color: '#1A1A1A' }}>{String(value)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="border rounded-lg" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex border-b" style={{ borderColor: '#E5E5E5' }}>
          {(['overview', 'email'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 sm:px-6 py-4 font-bold text-sm capitalize border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === tab ? '#DC143C' : 'transparent',
                color: activeTab === tab ? '#DC143C' : '#666666'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: '#666666' }}>SOURCE</p>
                <p className=' capitalize' style={{ color: '#1A1A1A' }}>{subscriber.source || 'Unknown'}</p>
              </div>
              {subscriber.unsubscribedAt && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: '#666666' }}>UNSUBSCRIBED AT</p>
                  <p style={{ color: '#1A1A1A' }}>{new Date(subscriber.unsubscribedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <p style={{ color: '#666666' }}>Email history will appear here</p>
              {/* You can implement email history fetching here */}
            </div>
          )}
        </div>
      </motion.div>

      {/* Send Message Modal */}
      {showSendModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Send {messageType.toUpperCase()} to {subscriber.name || subscriber.email}
            </h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              {messageType === 'email' && (
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Subject
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
                  {messageType === 'email' ? 'Content' : 'Message'}
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={messageType === 'email' ? 'Email content...' : 'SMS message...'}
                  className="w-full p-3 border rounded resize-none focus:ring-2 focus:ring-red-200"
                  style={{ borderColor: '#E5E5E5' }}
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  Continue to Send
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSendModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
