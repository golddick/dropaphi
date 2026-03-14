'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';

interface SenderId {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'rejected';
  createdAt: Date;
  verifiedAt?: Date;
}

export default function SMSSettingsPage() {
  const [senderIds, setSenderIds] = useState<SenderId[]>([
    {
      id: '1',
      name: 'DROP',
      status: 'verified',
      createdAt: new Date('2024-01-15'),
      verifiedAt: new Date('2024-01-16'),
    },
    {
      id: '2',
      name: 'ALERT',
      status: 'pending',
      createdAt: new Date('2024-02-01'),
    },
  ]);

  const [newSenderId, setNewSenderId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [defaultSender, setDefaultSender] = useState('DROP');

  const validateSenderId = (name: string) => {
    // Sender ID rules: 3-11 characters, alphanumeric only
    const regex = /^[A-Za-z0-9]{3,11}$/;
    return regex.test(name);
  };

  const handleAddSenderId = () => {
    setError('');
    
    if (!validateSenderId(newSenderId)) {
      setError('Sender ID must be 3-11 alphanumeric characters');
      return;
    }

    if (senderIds.some(s => s.name === newSenderId)) {
      setError('This sender ID already exists');
      return;
    }

    const newId: SenderId = {
      id: Date.now().toString(),
      name: newSenderId.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
    };

    setSenderIds([...senderIds, newId]);
    setNewSenderId('');
    setShowAddForm(false);
  };

  const getStatusBadge = (status: SenderId['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
            <CheckCircle2 size={12} />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
            <X size={12} />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          SMS Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Manage your SMS sender IDs and preferences
        </p>
      </motion.div>

      {/* Sender IDs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} style={{ color: '#DC143C' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Sender IDs
            </h2>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            style={{ backgroundColor: '#DC143C' }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Sender ID
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  New Sender ID
                </label>
                <Input
                  value={newSenderId}
                  onChange={(e) => setNewSenderId(e.target.value.toUpperCase())}
                  placeholder="e.g., MYAPP"
                  className="w-full"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">
                  3-11 characters, letters and numbers only
                </p>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 rounded flex items-center gap-2">
                  <AlertCircle size={16} style={{ color: '#DC143C' }} />
                  <span className="text-sm" style={{ color: '#DC143C' }}>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddSenderId}
                  style={{ backgroundColor: '#DC143C' }}
                >
                  Submit for Approval
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSenderId('');
                    setError('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="divide-y divide-gray-200">
          {senderIds.map((senderId) => (
            <div key={senderId.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MessageSquare size={20} style={{ color: '#666666' }} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold" style={{ color: '#1A1A1A' }}>
                      {senderId.name}
                    </p>
                    {getStatusBadge(senderId.status)}
                  </div>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    Created: {senderId.createdAt.toLocaleDateString()}
                    {senderId.verifiedAt && ` · Verified: ${senderId.verifiedAt.toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              {senderId.status === 'verified' && (
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="defaultSender"
                    checked={defaultSender === senderId.name}
                    onChange={() => setDefaultSender(senderId.name)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: '#666666' }}>
                    Default
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-6 bg-blue-50 border-t border-blue-200">
          <h3 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
            About Sender IDs
          </h3>
          <ul className="text-sm space-y-1" style={{ color: '#666666' }}>
            <li>• Sender IDs must be approved before use (usually 24-48 hours)</li>
            <li>• Use 3-11 alphanumeric characters</li>
            <li>• Choose a name that represents your brand</li>
            <li>• You can have multiple sender IDs for different purposes</li>
          </ul>
        </div>
      </motion.div>

      {/* SMS Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          SMS Preferences
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>
                Delivery Receipts
              </p>
              <p className="text-sm" style={{ color: '#666666' }}>
                Get notified when your SMS is delivered
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>
                Auto-retry Failed Messages
              </p>
              <p className="text-sm" style={{ color: '#666666' }}>
                Automatically retry failed SMS up to 3 times
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}