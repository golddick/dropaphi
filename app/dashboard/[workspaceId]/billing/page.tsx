// app/dashboard/settings/billing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Loader2, 
  Calendar, 
  CheckCircle, 
  Tag,
  Gift,
  ArrowRight,
  Building2,
  AlertCircle,
  Zap,
  Crown
} from 'lucide-react';
import { useSubscriptionStore } from '@/lib/stores/subscription';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { toast } from 'sonner';
import { PLANS, getPlanByTier } from '@/lib/billing/plan';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const {
    subscription,
    invoices,
    promoCodes,
    appliedPromo,
    isLoading,
    error,
    fetchSubscription,
    fetchInvoices,
    fetchPromoCodes,
    validatePromoCode,
    applyPromoCode,
    removePromoCode,
    initializeSubscription,
    cancelSubscription,
    clearError,
  } = useSubscriptionStore();

  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log('📊 Loading billing data for workspace:', currentWorkspace.id);
      loadData();
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchSubscription(),
        fetchInvoices(),
        fetchPromoCodes(),
      ]);
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoInput.trim() || !selectedPlan) return;
    
    setValidatingPromo(true);
    try {
      const promo = await validatePromoCode(promoInput, selectedPlan);
      applyPromoCode(promo);
      toast.success(`✅ Promo code applied! ${promo.description}`);
      setPromoInput('');
      setShowPromoInput(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSelectPlan = (tier: string) => {
    if (tier === 'FREE') {
      toast.info('You are already on the Free plan');
      return;
    }

    if (tier === 'ENTERPRISE') {
      window.location.href = 'mailto:sales@dropapi.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setSelectedPlan(tier);
    setShowPromoInput(true);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !currentWorkspace?.id) return;
    
    setProcessing(true);
    try {
      const result = await initializeSubscription(
        selectedPlan, 
        appliedPromo?.code
      );
      
      if (appliedPromo) {
        const plan = getPlanByTier(selectedPlan as any);
        const discount = appliedPromo.discountType === 'PERCENTAGE'
          ? Math.round((plan?.price || 0) * (appliedPromo.discountValue / 100))
          : appliedPromo.discountValue;
        if (discount > 0) {
          toast.success(`💰 You saved ${formatCurrency(discount)}!`);
        }
      }
      
      // Redirect to Paystack payment page
      window.location.href = result.authorization_url;
    } catch (error: any) {
      toast.error(error.message);
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) return;
    
    setProcessing(true);
    try {
      await cancelSubscription();
      toast.success('✅ Subscription cancelled');
      await fetchSubscription();
      setSelectedPlan(null);
      setShowPromoInput(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanPrice = (tier: string) => {
    const plan = getPlanByTier(tier as any);
    if (!plan) return 0;
    
    if (appliedPromo && selectedPlan === tier) {
      const discount = appliedPromo.discountType === 'PERCENTAGE'
        ? Math.round(plan.price * (appliedPromo.discountValue / 100))
        : appliedPromo.discountValue;
      return plan.price - Math.min(discount, plan.price);
    }
    return plan.price;
  };

  // Get usage data from subscription or workspace
  const usage = subscription?.usage || {
    sms: currentWorkspace?.currentSmsSent || 0,
    email: currentWorkspace?.currentEmailsSent || 0,
    otp: currentWorkspace?.currentOtpSent || 0,
    storage: currentWorkspace?.currentFilesUsed || 0,
    subscribers: currentWorkspace?.currentSubscribers || 0,
  };

  const limits = subscription?.limits || {
    sms: currentWorkspace?.smsLimit || 0,
    email: currentWorkspace?.emailLimit || 0,
    otp: currentWorkspace?.otpLimit || 0,
    storage: currentWorkspace?.fileLimit || 0,
    subscribers: currentWorkspace?.subscriberLimit || 0,
  };

  if (isLoading && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspace Selected</h3>
          <p className="text-gray-500">Please select or create a workspace to manage billing.</p>
        </div>
      </div>
    );
  }

  const isFreePlan = subscription?.tier === 'FREE';

  return (
    <div className="space-y-6 p-6">
      {/* Workspace Context */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Current Workspace</p>
            <p className="font-medium">{currentWorkspace.name}</p>
          </div>
          {subscription && (
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                subscription.tier === 'FREE' 
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {subscription.tier} Plan
              </span>
              {subscription.status === 'ACTIVE' ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Active
                </span>
              ) : (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  {subscription.status}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Subscription & Billing
        </h1>
        <p style={{ color: '#666666' }}>
          {isFreePlan 
            ? 'You are currently on the Free plan. Upgrade to access more features.'
            : 'Manage your workspace subscription and billing'}
        </p>
      </motion.div>

      {/* Promo Codes Banner */}
      {promoCodes.length > 0 && !appliedPromo && !isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Gift size={24} />
              <div>
                <h3 className="font-semibold">Special Offers Available!</h3>
                <p className="text-sm opacity-90">
                  {promoCodes.length} active promo codes - Apply at checkout
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {promoCodes.slice(0, 3).map((promo) => (
                <span
                  key={promo.code}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                >
                  {promo.code}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Plan */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Current Plan
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {subscription.tier === 'FREE' ? (
                    <Zap size={24} className="text-gray-400" />
                  ) : (
                    <Crown size={24} className="text-yellow-500" />
                  )}
                  <span className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                    {subscription.tier} Plan
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#666666' }}>
                  <Calendar size={16} />
                  <span>
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {isFreePlan && (
                  <p className="text-sm text-gray-500 mt-2">
                    Free plan includes {limits.sms.toLocaleString()} SMS, {limits.email.toLocaleString()} Emails, and {limits.storage}MB Storage per month
                  </p>
                )}
              </div>

              {!isFreePlan && (
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={processing}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>

            {/* Usage Meters */}
            <div className="mt-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: '#1A1A1A' }}>
                Usage this period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'SMS', used: usage.sms, limit: limits.sms, unit: 'messages' },
                  { label: 'Email', used: usage.email, limit: limits.email, unit: 'emails' },
                  { label: 'OTP', used: usage.otp, limit: limits.otp, unit: 'verifications' },
                  { label: 'Storage', used: usage.storage, limit: limits.storage, unit: 'MB' },
                  { label: 'Subscribers', used: usage.subscribers, limit: limits.subscribers, unit: 'contacts' },
                ].map((item) => {
                  const percentage = item.limit > 0 ? Math.min(Math.round((item.used / item.limit) * 100), 100) : 0;
                  
                  if (item.limit === 0) return null; // Skip if no limit
                  
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#666666' }}>{item.label}</span>
                        <span className="font-medium" style={{ color: '#1A1A1A' }}>
                          {item.used.toLocaleString()} / {item.limit.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: percentage > 80 ? '#DC143C' : '#10B981',
                          }}
                        />
                      </div>
                      {percentage > 80 && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={12} />
                          {percentage >= 100 ? 'Limit reached' : `${Math.round(100 - percentage)}% remaining`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Plans - Hide FREE plan if user is on FREE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
            {isFreePlan ? 'Upgrade Your Plan' : 'Available Plans'}
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANS
              .filter(p => p.tier !== 'FREE' || !isFreePlan) // Hide FREE if already on FREE
              .map((plan) => {
                const isSelected = selectedPlan === plan.tier;
                const finalPrice = getPlanPrice(plan.tier);
                const hasDiscount = appliedPromo && isSelected && finalPrice < plan.price;
                const isCurrentPlan = subscription?.tier === plan.tier;
                
                // Don't show current plan if it's FREE (since we're showing upgrade options)
                if (isCurrentPlan && plan.tier === 'FREE') return null;
                
                return (
                  <motion.div
                    key={plan.tier}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-red-500 bg-red-50' : 
                      isCurrentPlan ? 'border-green-500 bg-green-50' :
                      'border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {plan.tier === 'PROFESSIONAL' && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          CURRENT PLAN
                        </span>
                      </div>
                    )}

                    <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      {hasDiscount ? (
                        <div>
                          <span className="text-3xl font-bold" style={{ color: '#DC143C' }}>
                            {formatCurrency(finalPrice)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">/month</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm line-through text-gray-400">
                              {formatCurrency(plan.price)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Save {formatCurrency(plan.price - finalPrice)}
                            </span>
                          </div>
                        </div>
                      ) : plan.price > 0 ? (
                        <div>
                          <span className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                            {formatCurrency(plan.price)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">/month</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-500">Free</span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-gray-600">
                          <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={processing || isCurrentPlan}
                      className="w-full"
                      style={{
                        backgroundColor: isSelected ? '#DC143C' : isCurrentPlan ? '#10B981' : '#FFFFFF',
                        color: isSelected || isCurrentPlan ? '#FFFFFF' : '#1A1A1A',
                        border: isSelected || isCurrentPlan ? 'none' : '1px solid #E5E5E5',
                      }}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </motion.div>
                );
              })}
          </div>

          {/* Promo Code Input */}
          <AnimatePresence>
            {showPromoInput && selectedPlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 p-6 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      Have a promo code?
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code (e.g., LAUNCH20)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="max-w-xs"
                        disabled={validatingPromo || !!appliedPromo}
                      />
                      {!appliedPromo ? (
                        <Button
                          onClick={handleValidatePromo}
                          disabled={!promoInput.trim() || validatingPromo}
                          style={{ backgroundColor: '#DC143C' }}
                        >
                          {validatingPromo ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={removePromoCode}
                          variant="outline"
                          className="border-red-200 text-red-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {appliedPromo && (
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-700">
                        ✓ {appliedPromo.description} applied!
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleProceedToPayment}
                    disabled={processing || !selectedPlan}
                    className="md:min-w-[200px]"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {processing ? (
                      <Loader2 size={18} className="animate-spin mr-2" />
                    ) : (
                      <CreditCard size={18} className="mr-2" />
                    )}
                    Proceed to Payment
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              Invoice History
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium" style={{ color: '#1A1A1A' }}>
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </p>
                  {invoice.promoCode && (
                    <p className="text-xs text-green-600 mt-1">
                      Promo: {invoice.promoCode}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {invoice.discount > 0 && (
                    <p className="text-sm line-through text-gray-400">
                      {formatCurrency(invoice.amount)}
                    </p>
                  )}
                  <p className="font-bold" style={{ color: '#1A1A1A' }}>
                    {formatCurrency(invoice.finalAmount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    invoice.status === 'PAID' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}