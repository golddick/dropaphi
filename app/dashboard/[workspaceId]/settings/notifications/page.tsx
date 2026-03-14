'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  BellRing,
  BellOff,
  Volume2,
  Zap,
  Users,
  CreditCard,
  Shield,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  channels: NotificationChannel;
  digest: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSchedule {
  enabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  daysOff: string[];
}

export default function NotificationSettingsPage() {
  // Categories State
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'alerts',
      name: 'System Alerts',
      description: 'Critical system notifications and alerts',
      icon: AlertCircle,
      channels: { email: true, sms: true, push: true, inApp: true },
      digest: false,
      priority: 'high',
    },
    {
      id: 'security',
      name: 'Security Updates',
      description: 'Login alerts, password changes, security settings',
      icon: Shield,
      channels: { email: true, sms: true, push: true, inApp: true },
      digest: false,
      priority: 'high',
    },
    {
      id: 'billing',
      name: 'Billing & Payments',
      description: 'Invoices, payment confirmations, subscription updates',
      icon: CreditCard,
      channels: { email: true, sms: false, push: false, inApp: true },
      digest: true,
      priority: 'medium',
    },
    {
      id: 'api',
      name: 'API Usage',
      description: 'Usage limits, API key changes, rate limits',
      icon: Zap,
      channels: { email: true, sms: false, push: true, inApp: true },
      digest: true,
      priority: 'medium',
    },
    {
      id: 'team',
      name: 'Team Activity',
      description: 'Team member actions, invitations, role changes',
      icon: Users,
      channels: { email: true, sms: false, push: true, inApp: true },
      digest: false,
      priority: 'low',
    },
    {
      id: 'updates',
      name: 'Product Updates',
      description: 'New features, maintenance, announcements',
      icon: Bell,
      channels: { email: true, sms: false, push: false, inApp: true },
      digest: true,
      priority: 'low',
    },
  ]);

  // Schedule State
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    enabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    daysOff: ['Saturday', 'Sunday'],
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    summaryFrequency: 'daily', // daily, weekly, never
    marketingEmails: false,
    productUpdates: true,
  });

  // Push Settings State
  const [pushSettings, setPushSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    showPreview: true,
    groupedByApp: true,
  });

  // Test Notification State
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Save Status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'sms' | 'push'>('all');

  const handleChannelToggle = (categoryId: string, channel: keyof NotificationChannel) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, channels: { ...cat.channels, [channel]: !cat.channels[channel] } }
          : cat
      )
    );
  };

  const handleDigestToggle = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, digest: !cat.digest }
          : cat
      )
    );
  };

  const handlePriorityChange = (categoryId: string, priority: 'high' | 'medium' | 'low') => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, priority }
          : cat
      )
    );
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSchedule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDayOffToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      daysOff: prev.daysOff.includes(day)
        ? prev.daysOff.filter(d => d !== day)
        : [...prev.daysOff, day],
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const sendTestNotification = async () => {
    setTestLoading(true);
    
    // Simulate sending test notification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestLoading(false);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const filteredCategories = categories.filter(cat => {
    if (activeTab === 'all') return true;
    if (activeTab === 'email') return cat.channels.email;
    if (activeTab === 'sms') return cat.channels.sms;
    if (activeTab === 'push') return cat.channels.push;
    return true;
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Notification Settings
          </h1>
          <p style={{ color: '#666666' }}>
            Control how and when you receive notifications
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          style={{ backgroundColor: '#DC143C' }}
          className="flex items-center gap-2"
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Saving...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle2 size={18} />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>

      {/* Test Notification Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-linear-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BellRing size={24} style={{ color: '#DC143C' }} />
            <div>
              <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>
                Test Your Notifications
              </h3>
              <p className="text-sm" style={{ color: '#666666' }}>
                Send a test notification to verify your settings
              </p>
            </div>
          </div>
          <Button
            onClick={sendTestNotification}
            disabled={testLoading}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            {testLoading ? (
              <>Sending...</>
            ) : testSuccess ? (
              <>
                <CheckCircle2 size={16} className="mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Bell size={16} className="mr-2" />
                Send Test
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2">
                {(['all', 'email', 'sms', 'push'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories List */}
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${
                        category.priority === 'high' 
                          ? 'bg-red-100' 
                          : category.priority === 'medium'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}>
                        <Icon size={20} style={{ 
                          color: category.priority === 'high' 
                            ? '#DC143C' 
                            : category.priority === 'medium'
                            ? '#B8860B'
                            : '#2563EB'
                        }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>
                            {category.name}
                          </h3>
                          <select
                            value={category.priority}
                            onChange={(e) => handlePriorityChange(category.id, e.target.value as any)}
                            className="text-xs border rounded px-2 py-1"
                            style={{ borderColor: '#E5E5E5' }}
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                        <p className="text-sm mb-3" style={{ color: '#666666' }}>
                          {category.description}
                        </p>

                        {/* Channel Toggles */}
                        <div className="flex flex-wrap gap-4">
                          {/* Email */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.channels.email}
                              onChange={() => handleChannelToggle(category.id, 'email')}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Mail size={16} style={{ color: '#666666' }} />
                            <span className="text-sm" style={{ color: '#666666' }}>Email</span>
                          </label>

                          {/* SMS */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.channels.sms}
                              onChange={() => handleChannelToggle(category.id, 'sms')}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <MessageSquare size={16} style={{ color: '#666666' }} />
                            <span className="text-sm" style={{ color: '#666666' }}>SMS</span>
                          </label>

                          {/* Push */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.channels.push}
                              onChange={() => handleChannelToggle(category.id, 'push')}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Smartphone size={16} style={{ color: '#666666' }} />
                            <span className="text-sm" style={{ color: '#666666' }}>Push</span>
                          </label>

                          {/* In-App */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.channels.inApp}
                              onChange={() => handleChannelToggle(category.id, 'inApp')}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              disabled
                            />
                            <Bell size={16} style={{ color: '#999999' }} />
                            <span className="text-sm" style={{ color: '#999999' }}>In-App</span>
                          </label>
                        </div>

                        {/* Digest Option */}
                        {(category.channels.email || category.channels.push) && (
                          <div className="mt-3 flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={category.digest}
                                onChange={() => handleDigestToggle(category.id)}
                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm" style={{ color: '#666666' }}>
                                Send as digest ({emailSettings.summaryFrequency} summary)
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Email Preferences */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} style={{ color: '#DC143C' }} />
              Email Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Email Summary Frequency
                </label>
                <select
                  value={emailSettings.summaryFrequency}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, summaryFrequency: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="never">No Digest (Instant Only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium" style={{ color: '#1A1A1A' }}>
                      Marketing Emails
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSettings.marketingEmails}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium" style={{ color: '#1A1A1A' }}>
                      Product Updates
                    </p>
                    <p className="text-sm" style={{ color: '#666666' }}>
                      Get notified about product changes and improvements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSettings.productUpdates}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, productUpdates: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Schedule & Push Settings */}
        <div className="space-y-6">
          {/* Quiet Hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={20} style={{ color: '#DC143C' }} />
                Quiet Hours
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={schedule.enabled}
                  onChange={handleScheduleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {schedule.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#666666' }}>
                      Start Time
                    </label>
                    <Input
                      type="time"
                      name="quietHoursStart"
                      value={schedule.quietHoursStart}
                      onChange={handleScheduleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#666666' }}>
                      End Time
                    </label>
                    <Input
                      type="time"
                      name="quietHoursEnd"
                      value={schedule.quietHoursEnd}
                      onChange={handleScheduleChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: '#666666' }}>
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={schedule.timezone}
                    onChange={handleScheduleChange}
                    className="w-full p-2 border rounded-lg text-sm"
                    style={{ borderColor: '#E5E5E5' }}
                  >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-2" style={{ color: '#666666' }}>
                    Days Off
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDayOffToggle(day)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          schedule.daysOff.includes(day)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs mt-2" style={{ color: '#999999' }}>
                  Notifications will be silenced during quiet hours and on selected days
                </p>
              </div>
            )}
          </motion.div>

          {/* Push Notification Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone size={20} style={{ color: '#DC143C' }} />
              Push Notifications
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: '#666666' }}>Sound</span>
                <input
                  type="checkbox"
                  checked={pushSettings.soundEnabled}
                  onChange={(e) => setPushSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: '#666666' }}>Vibration</span>
                <input
                  type="checkbox"
                  checked={pushSettings.vibrationEnabled}
                  onChange={(e) => setPushSettings(prev => ({ ...prev, vibrationEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: '#666666' }}>Show Message Preview</span>
                <input
                  type="checkbox"
                  checked={pushSettings.showPreview}
                  onChange={(e) => setPushSettings(prev => ({ ...prev, showPreview: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: '#666666' }}>Group by App</span>
                <input
                  type="checkbox"
                  checked={pushSettings.groupedByApp}
                  onChange={(e) => setPushSettings(prev => ({ ...prev, groupedByApp: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium mb-2" style={{ color: '#666666' }}>Preview:</p>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell size={16} style={{ color: '#DC143C' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Drop API</p>
                  <p className="text-xs" style={{ color: '#666666' }}>
                    {pushSettings.showPreview 
                      ? 'Your API usage has reached 80% of your monthly limit...' 
                      : 'New notification'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-linear-to-br from-red-50 to-orange-50 rounded-lg border border-red-200 p-6"
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
              This Week
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#666666' }}>Notifications Sent</span>
                <span className="font-bold" style={{ color: '#DC143C' }}>1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#666666' }}>Opened</span>
                <span className="font-bold" style={{ color: '#DC143C' }}>892 (71.5%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#666666' }}>Clicked</span>
                <span className="font-bold" style={{ color: '#DC143C' }}>445 (35.7%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: '#666666' }}>Quiet Hours Saved</span>
                <span className="font-bold" style={{ color: '#DC143C' }}>156</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reset to Default */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex justify-end"
      >
        <Button
          variant="outline"
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
          onClick={() => {
            // Reset to default logic here
          }}
        >
          <RefreshCw size={16} className="mr-2" />
          Reset to Default
        </Button>
      </motion.div>
    </div>
  );
}