'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OTPPage() {
  const [formData, setFormData] = useState({
    recipient: '',
    channel: 'sms',
    otpLength: '6',
    validity: '5',
    message: 'Your OTP is: {OTP}',
  });
  const [otps, setOtps] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient) {
      return;
    }

    const otp = Math.random().toString().slice(2, 2 + parseInt(formData.otpLength));
    const newOtp = {
      id: Date.now(),
      recipient: formData.recipient,
      otp,
      channel: formData.channel,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setOtps([newOtp, ...otps]);
    setFormData({ ...formData, recipient: '' });
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
          OTP Service
        </h1>
        <p style={{ color: '#666666' }}>
          Multi-channel OTP verification for your applications
        </p>
      </motion.div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send OTP</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
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
              <form onSubmit={handleGenerateOTP} className="space-y-6">
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                  }}
                >
                  {/* Recipient */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Recipient
                    </label>
                    <Input
                      type="text"
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      placeholder="+234812345678 or user@example.com"
                      className="w-full"
                    />
                    <p className="text-xs mt-2" style={{ color: '#999999' }}>
                      Phone number or email address
                    </p>
                  </div>

                  {/* Channel */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Channel
                    </label>
                    <select
                      name="channel"
                      value={formData.channel}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                      style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="both">Both SMS & Email</option>
                    </select>
                  </div>

                  {/* OTP Length */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#1A1A1A' }}
                      >
                        OTP Length
                      </label>
                      <select
                        name="otpLength"
                        value={formData.otpLength}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg"
                        style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                      >
                        <option value="4">4 digits</option>
                        <option value="6">6 digits</option>
                        <option value="8">8 digits</option>
                      </select>
                    </div>

                    {/* Validity */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: '#1A1A1A' }}
                      >
                        Validity (minutes)
                      </label>
                      <Input
                        type="number"
                        name="validity"
                        value={formData.validity}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Message Template */}
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: '#1A1A1A' }}
                    >
                      Message Template
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your OTP is: {OTP}"
                      className="w-full p-3 border rounded-lg min-h-20 font-mono text-sm"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <p className="text-xs mt-2" style={{ color: '#999999' }}>
                      Use {'{'}OTP{'}'} as placeholder for the OTP code
                    </p>
                  </div>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={!formData.recipient}
                    className="w-full text-base font-semibold py-2"
                    style={{
                      backgroundColor: '#DC143C',
                      opacity: !formData.recipient ? 0.5 : 1,
                    }}
                  >
                    <Send size={18} className="mr-2" />
                    Generate & Send OTP
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Info */}
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5E5',
                }}
              >
                <p className="text-xs font-bold mb-3 uppercase" style={{ color: '#999999' }}>
                  Active OTPs
                </p>
                <p className="text-3xl font-bold" style={{ color: '#DC143C' }}>
                  {otps.filter((o) => o.status === 'pending').length}
                </p>
                <p className="text-xs mt-2" style={{ color: '#666666' }}>
                  Valid OTP codes
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgba(220, 20, 60, 0.05)',
                  borderLeft: '4px solid #DC143C',
                }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: '#1A1A1A' }}>
                  Security Tips:
                </p>
                <ul className="text-xs space-y-1" style={{ color: '#666666' }}>
                  <li>• Use 6-digit codes for standard security</li>
                  <li>• Set 5-10 minute validity windows</li>
                  <li>• Limit attempts to prevent brute force</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {otps.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5E5',
                }}
              >
                <Lock size={48} style={{ color: '#999999' }} className="mx-auto mb-4" />
                <p style={{ color: '#999999' }}>No OTPs generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {otps.map((otp) => (
                  <div
                    key={otp.id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                          {otp.recipient}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span style={{ color: '#666666' }}>
                            OTP: <span className="font-mono font-bold">{otp.otp}</span>
                          </span>
                          <span style={{ color: '#666666' }}>•</span>
                          <span style={{ color: '#666666' }}>Channel: {otp.channel}</span>
                        </div>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'rgba(220, 20, 60, 0.1)',
                          color: '#DC143C',
                        }}
                      >
                        {otp.status}
                      </span>
                    </div>
                    <p className="text-xs mt-3" style={{ color: '#999999' }}>
                      {new Date(otp.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Sent', value: '0' },
              { label: 'Verified', value: '0' },
              { label: 'Expired', value: '0' },
              { label: 'Success Rate', value: '0%' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5E5',
                }}
              >
                <p className="text-xs mb-2" style={{ color: '#999999' }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>

          <div
            className="p-6 rounded-lg border text-center"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E5E5',
            }}
          >
            <BarChart3 size={48} style={{ color: '#999999' }} className="mx-auto mb-4" />
            <p style={{ color: '#666666' }}>No data available yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
