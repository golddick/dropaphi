// components/admin/EditPromoModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/stores/admin/store/admin.transaction';

interface Props {
  promo: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPromoModal({ promo, isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    description: '',
    discountValue: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    firstTimeOnly: false,
  });

  const { updatePromoCode, isLoading } = useAdminStore();

  useEffect(() => {
    if (promo) {
      setFormData({
        description: promo.description || '',
        discountValue: promo.discountValue?.toString() || '',
        maxUses: promo.maxUses?.toString() || '',
        validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : '',
        validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : '',
        firstTimeOnly: promo.firstTimeOnly || false,
      });
    }
  }, [promo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo) return;

    try {
      await updatePromoCode(promo.id, {
        description: formData.description,
        discountValue: parseInt(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        firstTimeOnly: formData.firstTimeOnly,
      });

      toast.success('Promo code updated');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen || !promo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            Edit {promo.code}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount Value</label>
            <Input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Uses</label>
            <Input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valid From</label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editFirstTimeOnly"
              checked={formData.firstTimeOnly}
              onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="editFirstTimeOnly" className="text-sm">
              First time users only
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              style={{ backgroundColor: '#DC143C' }}
            >
              {isLoading ? 'Updating...' : 'Update Promo Code'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}