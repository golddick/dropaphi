// components/email/send-email-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailStore } from '@/lib/stores/email';
import { EmailCampaign } from '@/lib/email/types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberName: string;
  subscriberEmail: string;
  subscriberId: string;
}

export function SendEmailModal({ isOpen, onClose, subscriberName, subscriberEmail, subscriberId }: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  
  const { 
    campaigns, 
    fetchCampaigns, 
    createCampaign, 
    sendToSubscriber,
    isLoading: emailLoading 
  } = useEmailStore();

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns();
    }
  }, [isOpen, fetchCampaigns]);

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    setCreatingCampaign(true);
    try {
      const campaign = await createCampaign({
        name: newCampaignName.trim(),
      } as EmailCampaign);
      
      if (campaign) {
        setSelectedCampaignId(campaign.id);
        setShowCreateCampaign(false);
        setNewCampaignName('');
        setNewCampaignDescription('');
        toast.success('Campaign created successfully');
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCampaignId) {
      toast.error('Please select a campaign');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter message content');
      return;
    }
    
    try {
      await sendToSubscriber(selectedCampaignId, content, subject, subscriberEmail);
      toast.success('Email sent successfully!');
      handleReset();
      onClose(); 
    } catch (errr) {
      console.error('Failed to send email:', errr);
      toast.error('Failed to send email');
    }
  };

  const handleReset = () => {
    setSubject('');
    setContent('');
    setSelectedCampaignId('');
    setShowCreateCampaign(false);
    setNewCampaignName('');
    setNewCampaignDescription('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
            Send Email to {subscriberName || subscriberEmail}
          </h2>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Campaign Selection */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Select Campaign
            </label>
            <div className="space-y-2">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-200"
                style={{ borderColor: '#E5E5E5' }}
                required
              >
                <option value="">Select a campaign...</option>
                {campaigns.map((campaign: EmailCampaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => setShowCreateCampaign(true)}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Plus size={14} />
                Create New Campaign
              </button>
            </div>
          </div>

          {/* Create New Campaign Form */}
          {showCreateCampaign && (
            <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: '#E5E5E5' }}>
              <h3 className="font-semibold text-sm">Create New Campaign</h3>
              <div>
                <label className="block text-xs font-medium mb-1">Campaign Name *</label>
                <Input
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Summer Newsletter"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description (Optional)</label>
                <Input
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                  placeholder="Campaign description..."
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCampaign}
                  disabled={creatingCampaign}
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {creatingCampaign ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateCampaign(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Subject */}
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

          {/* Content */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Email Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your email content here..."
              className="w-full p-3 border rounded resize-none focus:ring-2 focus:ring-red-200"
              style={{ borderColor: '#E5E5E5' }}
              rows={8}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              style={{ backgroundColor: '#DC143C' }}
              disabled={emailLoading || !selectedCampaignId || !subject || !content}
            >
              {emailLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Email
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}