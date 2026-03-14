// app/dashboard/settings/api-keys/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
  Globe,
  Lock,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useApiKeyStore } from '@/lib/stores/api-keys.store';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useSubscriptionStore } from '@/lib/stores/subscription';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useWorkspaceID } from '@/lib/id/workspace';

// Expiration options based on environment
const EXPIRATION_OPTIONS = {
  test: [
    { value: '1', label: '1 day' },
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days (maximum)' }
  ],
  live: [
    { value: '90', label: '90 days (minimum)' },
    { value: '180', label: '6 months' },
    { value: '365', label: '1 year' },
    { value: '730', label: '2 years' }
  ]
};

export default function ApiKeysPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState<{ key: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    environment: 'test' as 'live' | 'test',
    expiresIn: '30',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    apiKeys,
    stats,
    isLoading,
    isCreating,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    deleteApiKey,
    fetchStats,
    clearError,
  } = useApiKeyStore();

  const { currentWorkspace } = useWorkspaceStore();
  const { subscription } = useSubscriptionStore();
  const spaceid = useWorkspaceID()

  console.log(spaceid, 'workspace ID from hook')
  // Get workspace ID from currentWorkspace
  const workspaceId =  spaceid;


  useEffect(() => {
    if (workspaceId) {
      console.log('Loading API keys for workspace:', workspaceId);
      loadData();
    } else {
      console.log('No workspace ID available yet');
    }
  }, [workspaceId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchApiKeys(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  // Update expiration when environment changes
  useEffect(() => {
    if (formData.environment === 'live') {
      setFormData(prev => ({ ...prev, expiresIn: '90' })); // Minimum 90 days for live
    } else {
      setFormData(prev => ({ ...prev, expiresIn: '30' })); // Default 30 days for test
    }
  }, [formData.environment]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    if (!workspaceId) {
      toast.error('No workspace selected');
      return;
    }

    // Validate expiration based on environment
    const expiresIn = parseInt(formData.expiresIn);
    
    // Test keys: max 90 days
    if (formData.environment === 'test' && expiresIn > 90) {
      toast.error('Test keys cannot exceed 90 days expiration');
      return;
    }

    // Live keys: min 90 days
    if (formData.environment === 'live' && expiresIn < 90) {
      toast.error('Live keys must expire in at least 90 days');
      return;
    }

    try {
      console.log('Creating API key with:', {
        workspaceId,
        name: formData.name,
        environment: formData.environment,
        expiresIn
      });

      const newKey = await createApiKey(
        {
          name: formData.name,
          environment: formData.environment,
          expiresIn,
        },
        workspaceId
      ) as any;

      if (newKey?.key) {
        setShowKeyModal({
          key: newKey.key,
          name: newKey.name,
        });
        setFormData({ name: '', environment: 'test', expiresIn: '30' });
        setShowCreateForm(false);
      }
    } catch (error: any) {
      console.error('Error creating key:', error);
      toast.error(error.message || 'Failed to create API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('API key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!workspaceId) return;
    
    try {
      await revokeApiKey(keyId);
      toast.success('API key revoked successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!workspaceId) return;
    
    if (!confirm('Are you sure you want to permanently delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteApiKey(keyId);
      toast.success('API key deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete key');
    }
  };

  const isFreePlan = subscription?.tier === 'FREE';

  // Get current expiration options based on selected environment
  const currentExpirationOptions = EXPIRATION_OPTIONS[formData.environment];

  if (isLoading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <RefreshCw size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            API Keys
          </h1>
          <p style={{ color: '#666666' }}>
            Manage API keys for authenticating requests to the Drop API
          </p>
          {workspaceId && (
            <p className="text-xs mt-1 text-gray-500">
              Workspace ID: {workspaceId}
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={isCreating || !workspaceId}
          style={{ backgroundColor: '#DC143C' }}
        >
          <Plus size={18} className="mr-2" />
          Create New Key
        </Button>
      </motion.div>

      {/* Plan Warning for Free Users */}
      {isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Free Plan Limitations</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The Free plan only allows test API keys. Upgrade to create live production keys with higher rate limits.
              </p>
              <Button
                size="sm"
                className="mt-2"
                style={{ backgroundColor: '#DC143C' }}
                onClick={() => window.location.href = '/dashboard/settings/billing'}
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="p-6 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Keys</p>
              <Key size={20} style={{ color: '#DC143C' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {stats.totalKeys}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeKeys} active
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Live Keys</p>
              <Globe size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.liveKeys}
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>Test Keys</p>
              <Lock size={20} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.testKeys}
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: '#666666' }}>API Calls</p>
              <Activity size={20} style={{ color: '#DC143C' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {stats.totalCalls.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ~{stats.averageCallsPerDay}/day avg
            </p>
          </div>
        </motion.div>
      )}

      {/* Create Key Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                Create New API Key
              </h2>
              
              <form onSubmit={handleCreateKey} className="space-y-4">
                {/* Key Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                    Key Name
                  </label>
                  <Input
                    placeholder="e.g., Production App, Development"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="max-w-md"
                    disabled={!workspaceId}
                  />
                </div>

                {/* Environment and Expiration in same row */}
                <div className="flex gap-4 items-end">
                  {/* Environment */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      Environment
                    </label>
                    <div className="flex gap-4 border rounded-lg p-3 bg-gray-50">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="environment"
                          value="test"
                          checked={formData.environment === 'test'}
                          onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'test' })}
                          className="w-4 h-4 text-red-600"
                          disabled={!workspaceId}
                        />
                        <div className="flex items-center gap-2">
                          <Lock size={16} className="text-yellow-600" />
                          <span className="text-sm font-medium">Test</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="environment"
                          value="live"
                          checked={formData.environment === 'live'}
                          onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'live' })}
                          disabled={isFreePlan || !workspaceId}
                          className="w-4 h-4 text-red-600"
                        />
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-green-600" />
                          <span className={`text-sm font-medium ${isFreePlan ? 'text-gray-400' : ''}`}>
                            Live {isFreePlan && '(Upgrade Required)'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Expires In</span>
                      </div>
                    </label>
                    <select
                      value={formData.expiresIn}
                      onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ borderColor: '#E5E5E5' }}
                      disabled={!workspaceId}
                    >
                      {currentExpirationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formData.environment === 'test' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Test keys maximum 90 days expiration
                      </p>
                    )}
                    {formData.environment === 'live' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Live keys require minimum 90 days expiration
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating || !workspaceId}
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Key'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
            Your API Keys
          </h2>
          {apiKeys.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Showing keys for workspace: {workspaceId}
            </p>
          )}
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <Key size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No API keys created yet</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              disabled={!workspaceId}
            >
              <Plus size={16} className="mr-2" />
              Create your first API key
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((key) => {
              const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
              const isCopied = copiedKey === key.id;
              
              return (
                <div key={key.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg" style={{ color: '#1A1A1A' }}>
                          {key.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          key.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {key.status}
                        </span>
                        {key.keyPrefix === 'da_live_' ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                            <Globe size={12} />
                            Live
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center gap-1">
                            <Lock size={12} />
                            Test
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="text-gray-500">
                          Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                        </span>
                        {key.lastUsedAt ? (
                          <span className="text-gray-500">
                            Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-gray-500">Never used</span>
                        )}
                        {key.expiresAt && (
                          <span className={`flex items-center gap-1 ${
                            isExpired ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            <Clock size={14} />
                            {isExpired ? 'Expired' : `Expires ${formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })}`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          Rate limit: {key.rateLimitPerMin} requests/min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {key.status === 'ACTIVE' && !isExpired && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                          title="Revoke key"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded"
                        title="Delete key"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Always show full key */}
                  <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">API Key:</p>
                        <code className="text-sm font-mono break-all bg-white p-2 rounded border block">
                          {key.maskedKey}
                        </code>
                      </div>
                       {key.key && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(key.key!);
                            toast.success('API key copied to clipboard!');
                          }}
                          className="ml-3 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 shrink-0"
                          title="Copy raw key"
                        >
                          <Copy size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Key Creation Success Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowKeyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                  API Key Created
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your new API key is shown below. You can always view it in the list.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-xs text-gray-500 mb-2">Your API Key:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono overflow-auto text-sm bg-white p-2 rounded border">
                    {showKeyModal.key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(showKeyModal.key)}
                    className="p-2 bg-white rounded border hover:bg-gray-50"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => setShowKeyModal(null)}
                className="w-full"
                style={{ backgroundColor: '#DC143C' }}
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
