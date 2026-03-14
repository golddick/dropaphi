
// app/admin/promos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Gift,
  Calendar,
  Percent,
  Coins,
  Edit2,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Tag,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/stores/admin/store/admin.transaction';
import { CreatePromoModal } from './_component/CreatePromoModal';
import { EditPromoModal } from './_component/EditPromoModal';

export default function AdminPromosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  const {
    promoCodes,
    isLoading,
    error,
    fetchPromoCodes,
    deletePromoCode,
    clearError,
  } = useAdminStore();

  // Fetch promos on mount
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  console.log('📊 Promo codes in store:', promoCodes);

  const handleDeletePromo = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;
    
    try {
      await deletePromoCode(id);
      toast.success('Promo code deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredPromos = promoCodes.filter((promo) => 
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (promo: any) => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);
    return validFrom <= now && validUntil >= now;
  };

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
            Promo Codes
          </h1>
          <p style={{ color: '#666666' }}>
            Create and manage discount codes
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePromo(true)}
          style={{ backgroundColor: '#DC143C' }}
        >
          <Gift size={18} className="mr-2" />
          Create Promo Code
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Promos</p>
            <Tag size={20} style={{ color: '#DC143C' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {promoCodes.length}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Active Promos</p>
            <Gift size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {promoCodes.filter(isActive).length}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Expired Promos</p>
            <Calendar size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {promoCodes.filter(p => isExpired(p.validUntil)).length}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Redemptions</p>
            <Users size={20} style={{ color: '#DC143C' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0)}
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4"
      >
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3" style={{ color: '#999999' }} />
          <Input
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => fetchPromoCodes()}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Promo Codes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredPromos.length > 0 ? (
          filteredPromos.map((promo) => {
            const expired = isExpired(promo.validUntil);
            const active = isActive(promo);
            
            return (
              <motion.div
                key={promo.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border rounded-lg relative ${
                  expired ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {expired ? (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Expired
                    </span>
                  ) : active ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Scheduled
                    </span>
                  )}
                </div>

                {/* Promo Code */}
                <div className="mb-3">
                  <span className="font-mono font-bold text-xl" style={{ color: '#DC143C' }}>
                    {promo.code}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                </div>

                {/* Discount Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    {promo.discountType === 'PERCENTAGE' ? (
                      <Percent size={14} className="text-blue-600" />
                    ) : (
                      <Coins size={14} className="text-green-600" />
                    )}
                    <span className="text-sm font-medium">
                      {promo.discountType === 'PERCENTAGE' 
                        ? `${promo.discountValue}% OFF`
                        : `${formatCurrency(promo.discountValue)} OFF`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Usage</span>
                    <span className="text-xs font-medium">
                      {promo.usedCount || 0} / {promo.maxUses || '∞'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[#DC143C] h-1.5 rounded-full"
                      style={{ 
                        width: promo.maxUses 
                          ? `${((promo.usedCount || 0) / promo.maxUses) * 100}%` 
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Features & Actions */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-1">
                    {promo.firstTimeOnly && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        First time only
                      </span>
                    )}
                    {promo.minPlanTier && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {promo.minPlanTier}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingPromo(promo)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id, promo.code)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12">
            <Gift size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {isLoading ? 'Loading promo codes...' : 'No promo codes found'}
            </p>
            {!isLoading && (
              <Button
                onClick={() => setShowCreatePromo(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus size={16} className="mr-2" />
                Create your first promo code
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Create Promo Modal */}
      <CreatePromoModal
        isOpen={showCreatePromo}
        onClose={() => setShowCreatePromo(false)}
        onSuccess={() => {
          setShowCreatePromo(false);
          fetchPromoCodes();
        }}
      />

      {/* Edit Promo Modal */}
      <EditPromoModal
        promo={editingPromo}
        isOpen={!!editingPromo}
        onClose={() => setEditingPromo(null)}
        onSuccess={() => {
          setEditingPromo(null);
          fetchPromoCodes();
        }}
      />
    </div>
  );
}