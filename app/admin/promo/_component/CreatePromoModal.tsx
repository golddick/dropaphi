// components/admin/CreatePromoModal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Percent, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/stores/admin/store/admin.transaction';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePromoModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    firstTimeOnly: false,
    appliesToPlans: [] as string[],
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const { createPromoCode, isLoading } = useAdminStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPromoCode({
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseInt(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        firstTimeOnly: formData.firstTimeOnly,
        appliesToPlans: selectedPlans.length > 0 ? selectedPlans : undefined,
      });

      toast.success('Promo code created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            Create Promo Code
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Promo Code *
            </label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SUMMER2024"
              className="uppercase"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 20% off summer sale"
              required
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="w-full p-2 border rounded-lg bg-white"
                style={{ borderColor: '#E5E5E5' }}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Value *
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '5000'}
                  min="1"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">
                  {formData.discountType === 'PERCENTAGE' ? '%' : '₦'}
                </span>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Valid From *
              </label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Valid Until *
              </label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Maximum Uses (Leave empty for unlimited)
            </label>
            <Input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="e.g., 100"
              min="1"
            />
          </div>

          {/* Apply to Plans */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Apply to Plans (Leave empty for all plans)
            </label>
            <div className="flex gap-2 flex-wrap">
              {['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'].map((plan) => (
                <label key={plan} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={plan}
                    checked={selectedPlans.includes(plan)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans([...selectedPlans, plan]);
                      } else {
                        setSelectedPlans(selectedPlans.filter(p => p !== plan));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{plan}</span>
                </label>
              ))}
            </div>
          </div>

          {/* First Time Only */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="firstTimeOnly"
              checked={formData.firstTimeOnly}
              onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="firstTimeOnly" className="text-sm">
              First time users only
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              style={{ backgroundColor: '#DC143C' }}
            >
              {isLoading ? 'Creating...' : 'Create Promo Code'}
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