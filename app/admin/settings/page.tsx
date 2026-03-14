'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    smsCost: '1.00',
    emailCost: '0.50',
    otpCost: '0.75',
    storageCost: '50.00',
    apiRateLimit: '10000',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings((prev) => ({ ...prev, [name]: newValue }));
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          System Settings
        </h1>
        <p style={{ color: '#666666' }}>
          Configure platform-wide settings and pricing
        </p>
      </motion.div>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg flex items-center gap-3"
          style={{ backgroundColor: '#E8F5E9', borderLeft: '4px solid #2E7D32' }}
        >
          <CheckCircle2 size={20} style={{ color: '#2E7D32' }} />
          <p style={{ color: '#2E7D32' }} className="font-medium">
            Settings saved successfully!
          </p>
        </motion.div>
      )}

      {/* Pricing Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E5E5',
        }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
          Pricing Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              SMS Cost Per Unit (₦)
            </label>
            <Input
              type="number"
              name="smsCost"
              value={settings.smsCost}
              onChange={handleChange}
              step="0.01"
              placeholder="1.00"
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Cost per SMS message sent
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Email Cost Per Unit (₦)
            </label>
            <Input
              type="number"
              name="emailCost"
              value={settings.emailCost}
              onChange={handleChange}
              step="0.01"
              placeholder="0.50"
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Cost per email sent
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              OTP Cost Per Verification (₦)
            </label>
            <Input
              type="number"
              name="otpCost"
              value={settings.otpCost}
              onChange={handleChange}
              step="0.01"
              placeholder="0.75"
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Cost per OTP verification
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Storage Cost Per GB (₦)
            </label>
            <Input
              type="number"
              name="storageCost"
              value={settings.storageCost}
              onChange={handleChange}
              step="0.01"
              placeholder="50.00"
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Cost per gigabyte of storage
            </p>
          </div>
        </div>
      </motion.div>

      {/* API Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E5E5',
        }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
          API Rate Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Default Rate Limit (Requests/Month)
            </label>
            <Input
              type="number"
              name="apiRateLimit"
              value={settings.apiRateLimit}
              onChange={handleChange}
              placeholder="10000"
              className="w-full"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Default API requests per month for new users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Premium Rate Limit (Requests/Month)
            </label>
            <Input
              type="number"
              name="premiumRateLimit"
              value="1000000"
              disabled
              className="w-full bg-gray-50"
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              Fixed limit for premium users
            </p>
          </div>
        </div>
      </motion.div>

      {/* System Configuration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E5E5',
        }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
          System Configuration
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>
                Maintenance Mode
              </p>
              <p className="text-xs" style={{ color: '#999999' }}>
                Disable API access for all users during maintenance
              </p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 accent-red-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>
                Email Notifications
              </p>
              <p className="text-xs" style={{ color: '#999999' }}>
                Send system alerts via email to users
              </p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-5 h-5 accent-red-600"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <div>
              <p className="font-medium" style={{ color: '#1A1A1A' }}>
                SMS Notifications
              </p>
              <p className="text-xs" style={{ color: '#999999' }}>
                Send system alerts via SMS to users
              </p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleChange}
                className="w-5 h-5 accent-red-600"
              />
            </label>
          </div>
        </div>
      </motion.div>

      {/* Feature Toggles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E5E5',
        }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
          Service Toggles
        </h2>
        <div className="space-y-3">
          {[
            { name: 'SMS Service', enabled: true },
            { name: 'Email Service', enabled: true },
            { name: 'OTP Service', enabled: true },
            { name: 'File Storage', enabled: true },
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
              <div>
                <p className="font-medium" style={{ color: '#1A1A1A' }}>
                  {service.name}
                </p>
              </div>
              <div
                className="w-12 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer"
                style={{ backgroundColor: service.enabled ? '#2E7D32' : '#CCCCCC' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: service.enabled ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Warning Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: '#FFF5F5',
          borderColor: '#FFD1D1',
        }}
      >
        <div className="flex gap-3">
          <AlertCircle size={24} style={{ color: '#DC143C', flexShrink: 0 }} />
          <div>
            <h3 className="font-bold mb-2" style={{ color: '#DC143C' }}>
              Danger Zone
            </h3>
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              These settings affect all users on the platform. Changes are applied immediately. Use with caution.
            </p>
            <Button
              variant="outline"
              className="hover:bg-red-50"
              style={{ borderColor: '#DC143C', color: '#DC143C' }}
            >
              Clear All Cache
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex gap-3"
      >
        <Button
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={saveSettings}
          className="flex-1"
          style={{ backgroundColor: '#DC143C' }}
        >
          <Save size={18} className="mr-2" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}
