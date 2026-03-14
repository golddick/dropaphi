'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Clock, BarChart3, Eye, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SMSPage() {
  const [formData, setFormData] = useState({
    recipients: '',
    message: '',
    senderId: 'DROP',
  });
  const [messageCount, setMessageCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // Demo SMS messages
  const [messages] = useState([
    {
      id: 'msg_001',
      recipients: '+234701234567',
      recipientName: 'John Doe',
      message: 'Your OTP is 123456. Valid for 10 minutes. Do not share.',
      status: 'delivered',
      cost: 0.5,
      timestamp: '2024-02-16 10:30:00',
      deliveredAt: '2024-02-16 10:30:05',
      type: 'OTP'
    },
    {
      id: 'msg_002',
      recipients: '+234702345678',
      recipientName: 'Jane Smith',
      message: 'Your order #12345 has been confirmed. Expected delivery: 3-5 days.',
      status: 'delivered',
      cost: 0.5,
      timestamp: '2024-02-16 09:15:00',
      deliveredAt: '2024-02-16 09:15:03',
      type: 'Transactional'
    },
    {
      id: 'msg_003',
      recipients: '+234703456789',
      recipientName: 'Bob Johnson',
      message: 'Welcome to Drop API! You have 50 free SMS credits. Start building today.',
      status: 'delivered',
      cost: 0.5,
      timestamp: '2024-02-16 08:00:00',
      deliveredAt: '2024-02-16 08:00:02',
      type: 'Marketing'
    },
    {
      id: 'msg_004',
      recipients: '+234704567890',
      recipientName: 'Alice Williams',
      message: 'Your account password was changed on 2024-02-16. If this wasnt you, contact support immediately.',
      status: 'failed',
      cost: 0,
      timestamp: '2024-02-15 14:45:00',
      failureReason: 'Invalid phone number format',
      type: 'Security'
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'message') {
      setMessageCount(value.length);
    }
  };

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipients || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    alert('SMS sent successfully!');
    setFormData({ ...formData, recipients: '', message: '' });
    setMessageCount(0);
  };

  const stats = {
    totalSent: messages.length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
    totalCost: messages.filter(m => m.status === 'delivered').reduce((sum, m) => sum + m.cost, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          SMS API
        </h1>
        <p style={{ color: '#666666' }}>
          Send bulk and transactional SMS messages
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Sent', value: stats.totalSent, icon: '📤' },
          { label: 'Delivered', value: stats.delivered, icon: '✓' },
          { label: 'Failed', value: stats.failed, icon: '✗' },
          { label: 'Total Cost', value: `$${stats.totalCost.toFixed(2)}`, icon: '💰' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p style={{ color: '#666666' }} className="text-xs font-bold">
              {stat.label.toUpperCase()}
            </p>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Send Tab */}
        <TabsContent value="send" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSendSMS} className="space-y-6">
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                  }}
                >
                  {/* Recipients */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Recipients (comma-separated)
                    </label>
                    <Input
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      placeholder="+234701234567, +234702345678"
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="w-full p-3 border rounded resize-none"
                      style={{ borderColor: '#E5E5E5' }}
                      rows={4}
                    />
                    <p
                      className="text-xs mt-2"
                      style={{ color: '#999999' }}
                    >
                      {messageCount} characters
                      {Math.ceil(messageCount / 160) > 1 && ` (${Math.ceil(messageCount / 160)} SMS)`}
                    </p>
                  </div>

                  {/* Sender ID */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Sender ID
                    </label>
                    <Input
                      name="senderId"
                      value={formData.senderId}
                      onChange={handleInputChange}
                      placeholder="Your Sender ID"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    <Send size={18} />
                    Send SMS
                  </Button>
                </div>
              </form>
            </div>

            {/* Cost Breakdown */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5E5',
              }}
            >
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Pricing Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p style={{ color: '#666666' }} className="text-xs">
                    Cost per SMS
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                    $0.05
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666666' }} className="text-xs">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                    $250.00
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-sm"
                >
                  Top Up Credits
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Message</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: '#666666' }}>Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold" style={{ color: '#666666' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg, index) => (
                    <tr
                      key={msg.id}
                      style={{
                        borderBottom: index < messages.length - 1 ? '1px solid #E5E5E5' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold" style={{ color: '#1A1A1A' }}>
                          {msg.recipientName}
                        </p>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          {msg.recipients}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm truncate" style={{ color: '#666666' }}>
                          {msg.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#F5F5F5', color: '#666666' }}>
                          {msg.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{
                            backgroundColor: msg.status === 'delivered' ? '#FFF5F5' : '#FFE5E5',
                            color: msg.status === 'delivered' ? '#DC143C' : '#B81C1C'
                          }}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#999999' }}>
                        {msg.timestamp}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="flex justify-end"
                        >
                          <Eye size={18} style={{ color: '#DC143C', cursor: 'pointer' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div
              className="p-6 border rounded-lg"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
            >
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Delivery Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#666666' }}>Delivered</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded" style={{ backgroundColor: '#E5E5E5' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(stats.delivered / stats.totalSent) * 100}%`,
                          backgroundColor: '#DC143C'
                        }}
                      />
                    </div>
                    <span className="font-bold" style={{ color: '#1A1A1A' }}>
                      {stats.delivered}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#666666' }}>Failed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded" style={{ backgroundColor: '#E5E5E5' }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(stats.failed / stats.totalSent) * 100}%`,
                          backgroundColor: '#B81C1C'
                        }}
                      />
                    </div>
                    <span className="font-bold" style={{ color: '#1A1A1A' }}>
                      {stats.failed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-6 border rounded-lg"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}
            >
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                This Month
              </h3>
              <div className="space-y-3">
                <div>
                  <p style={{ color: '#666666' }} className="text-xs font-bold mb-1">
                    TOTAL SMS SENT
                  </p>
                  <p className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                    {stats.totalSent}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666666' }} className="text-xs font-bold mb-1">
                    TOTAL SPENT
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                    ${stats.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Message Details
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-2xl"
                style={{ color: '#999999' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold" style={{ color: '#666666' }}>RECIPIENT</p>
                <p className="font-bold" style={{ color: '#1A1A1A' }}>{selectedMessage.recipientName}</p>
                <p className="text-sm" style={{ color: '#999999' }}>{selectedMessage.recipients}</p>
              </div>

              <div>
                <p className="text-xs font-bold" style={{ color: '#666666' }}>MESSAGE</p>
                <p style={{ color: '#1A1A1A' }} className="break-words">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>STATUS</p>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded inline-block"
                    style={{
                      backgroundColor: selectedMessage.status === 'delivered' ? '#FFF5F5' : '#FFE5E5',
                      color: selectedMessage.status === 'delivered' ? '#DC143C' : '#B81C1C'
                    }}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>COST</p>
                  <p className="font-bold" style={{ color: '#1A1A1A' }}>
                    ${selectedMessage.cost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold" style={{ color: '#666666' }}>SENT AT</p>
                <p style={{ color: '#1A1A1A' }}>{selectedMessage.timestamp}</p>
              </div>

              {selectedMessage.deliveredAt && (
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>DELIVERED AT</p>
                  <p style={{ color: '#1A1A1A' }}>{selectedMessage.deliveredAt}</p>
                </div>
              )}

              {selectedMessage.failureReason && (
                <div>
                  <p className="text-xs font-bold" style={{ color: '#666666' }}>REASON</p>
                  <p style={{ color: '#B81C1C' }}>{selectedMessage.failureReason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setSelectedMessage(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#DC143C' }}
              >
                <Copy size={16} />
                Copy Details
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
