// components/email/email-history.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Eye, ExternalLink, Loader2, Calendar, ChevronUp, Clock, MousePointer, Check, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmailStore } from '@/lib/stores/email';
import { formatDistanceToNow } from 'date-fns';
import { SendEmailModal } from './send-email-modal';

interface EmailHistoryProps {
  subscriberId: string;
  subscriberEmail: string;
}

interface ViewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: any;
  onReply: () => void;
}

function ViewEmailModal({ isOpen, onClose, email, onReply }: ViewEmailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
            Email Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
            <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{email.subject}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">From</p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>{email.fromName || email.fromEmail || 'Unknown'}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">To</p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>{email.toEmails?.join(', ') || 'Unknown'}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              {email.createdAt ? new Date(email.createdAt).toLocaleString() : 'Unknown'}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Content</p>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              {email.bodyHtml ? (
                <div 
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#1A1A1A' }}>
                  {email.bodyText || 'No content'}
                </p>
              )}
            </div>
          </div>

          {email.bounceReason && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs font-medium text-red-600 mb-1">Bounce Reason</p>
              <p className="text-sm text-red-700">{email.bounceReason}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 p-4 border-t">
          <Button
            onClick={() => {
              onClose();
              onReply();
            }}
            className="flex-1 gap-2"
            style={{ backgroundColor: '#DC143C' }}
          >
            <Mail size={16} />
            Reply
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function EmailHistory({ subscriberId, subscriberEmail }: EmailHistoryProps) {
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { recentEmailsForSubscriber, fetchEmailsForSubscriber, fetchEmailById } = useEmailStore();
  const emails = recentEmailsForSubscriber || [];

  useEffect(() => {
    loadEmails();
  }, [subscriberId]);

  const loadEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchEmailsForSubscriber(subscriberId);
    } catch (err) {
      console.error('Failed to load emails:', err);
      setError('Failed to load email history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmail = async (email: any) => {
    setSelectedEmail(email);
    setShowViewModal(true);
  };

  const handleReply = () => {
    setShowViewModal(false);
    setShowReplyModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return 'text-green-600 bg-green-50';
      case 'OPENED':
        return 'text-purple-600 bg-purple-50';
      case 'CLICKED':
        return 'text-indigo-600 bg-indigo-50';
      case 'BOUNCED':
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'SCHEDULED':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return <Check size={12} />;
      case 'OPENED':
        return <Eye size={12} />;
      case 'CLICKED':
        return <MousePointer size={12} />;
      case 'BOUNCED':
      case 'FAILED':
        return <X size={12} />;
      case 'SCHEDULED':
        return <Clock size={12} />;
      default:
        return <Mail size={12} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={loadEmails}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No emails sent to {subscriberEmail} yet</p>
        <p className="text-xs text-gray-400 mt-1">Send an email to see the history here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {emails.map((email, index) => (
          <motion.div
            key={email.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
            style={{ borderColor: '#E5E5E5' }}
            onClick={() => handleViewEmail(email)}
          >
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Mail size={16} style={{ color: '#DC143C' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: '#1A1A1A' }}>
                        {email.subject || '(No subject)'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(email.status)}`}>
                        {getStatusIcon(email.status)}
                        <span className="capitalize">{email.status?.toLowerCase() || 'pending'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: '#666666' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {email.createdAt ? formatDistanceToNow(new Date(email.createdAt), { addSuffix: true }) : 'Unknown date'}
                      </span>
                      {email.openCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          Opened {email.openCount} time{email.openCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {email.clickCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MousePointer size={12} />
                          Clicked {email.clickCount} time{email.clickCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewEmail(email);
                  }}
                >
                  <Eye size={14} />
                  View
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Email Modal */}
      {selectedEmail && (
        <ViewEmailModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          email={selectedEmail}
          onReply={handleReply}
        />
      )}

      {/* Reply Email Modal */}
      {showReplyModal && selectedEmail && (
        <SendEmailModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          subscriberName={subscriberEmail.split('@')[0]}
          subscriberEmail={subscriberEmail}
          subscriberId={subscriberId}
        //   initialSubject={`Re: ${selectedEmail.subject}`}
        //   initialContent={`\n\n--- Original Message ---\nFrom: ${selectedEmail.fromName || selectedEmail.fromEmail}\nSubject: ${selectedEmail.subject}\nDate: ${selectedEmail.createdAt ? new Date(selectedEmail.createdAt).toLocaleString() : 'Unknown'}\n\n${selectedEmail.bodyText || 'No content'}`}
        />
      )}
    </>
  );
}