// app/dashboard/subscribers/[id]/page.tsx (updated)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Calendar, Trash2, Edit2, Check, X, History } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { toast } from 'sonner';
import { useSubscriberStore } from '@/lib/stores/subscriber/subscriber-store';
import { EmailHistory } from '../_component/email-history';
import { SendEmailModal } from '../_component/send-email-modal';

export default function SubscriberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subscriberId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showSendModal, setShowSendModal] = useState(false);
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

  console.log(currentSubscriber, 'jj')

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Subscriber not found</p>
        <Button asChild className="mt-4">
          <Link href={`/dashboard/${workspaceId}/subscribers`}>Back to Subscribers</Link>
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
              onClick={() => setShowSendModal(true)}
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

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: '#E5E5E5' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'history'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={14} />
          Email History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#666666' }}>EMAIL</p>
              <p className="font-bold" style={{ color: '#1A1A1A' }}>{subscriber.email}</p>
            </div>
            <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#666666' }}>SUBSCRIBED</p>
              <p className="font-bold" style={{ color: '#1A1A1A' }}>{new Date(subscriber.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status and Segments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Custom Fields */}
          {subscriber.customFields && Object.keys(subscriber.customFields).length > 0 && (
            <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
              <p className="text-xs font-bold mb-3" style={{ color: '#666666' }}>CUSTOM FIELDS</p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(subscriber.customFields).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-bold" style={{ color: '#666666' }}>{key}</p>
                    <p className="text-sm" style={{ color: '#1A1A1A' }}>{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <EmailHistory subscriberId={subscriberId} subscriberEmail={subscriber.email} />
        </motion.div>
      )}

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        subscriberName={subscriber.name || ''}
        subscriberEmail={subscriber.email}
        subscriberId={subscriberId}
      />
    </div>
  );
}