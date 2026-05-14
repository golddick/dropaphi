// app/dashboard/settings/billing/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
    Crown, MessageSquare, Mail, FileText, Lock
} from 'lucide-react';
import { useSubscriptionStore } from '@/lib/stores/subscription';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { toast } from 'sonner';
import { UsageProgress } from '../overview/_component/usage-progress';
import { TopUpModal } from '../overview/_component/top-up-modal';
import { formatStorageLimit } from '@/lib/utils';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [topUpService, setTopUpService] = useState<{ title: string; type: string; unit?: string } | null>(null);
  const [serviceCosts, setServiceCosts] = useState<any[]>([]);

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

  const { overview, fetchOverview } = useDashboardStore();

console.log( overview , 'usage')

  const { currentWorkspace } = useWorkspaceStore();

  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log('📊 Loading billing data for workspace:', currentWorkspace.id);
      loadData();
      fetchAvailablePlans();
      fetchServiceCosts();
    }
  }, [currentWorkspace?.id]);

  const fetchServiceCosts = async () => {
    try {
      const response = await fetch('/api/service-costs');
      const result = await response.json();
      if (result.success) {
        setServiceCosts(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch service costs:', error);
    }
  };



  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const result = await response.json();
      if (result.success && result.data?.plans) {
        setAvailablePlans(result.data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  console.log( availablePlans, 'billing plan ')

  const loadData = async () => {
    try {
      await Promise.all([
        fetchSubscription(),
        fetchInvoices(),
        fetchPromoCodes(),
        fetchOverview(currentWorkspace?.id || ''),
      ]);
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
    }
  };

  const handleTopUp = (service: any) => {
    setTopUpService({
      title: service.title,
      type: service.statKey || service.type,
      unit: service.unit
    });
  };

  const serviceConfig = [
    {
      statKey: 'sms',
      title: 'SMS ',
      icon: MessageSquare,
      color: '#DC143C'
    },
    {
      statKey: 'email',
      title: 'Email',
      icon: Mail,
      color: '#4CAF50'
    },
    {
      statKey: 'otp',
      title: 'OTP Service',
      icon: Lock,
      color: '#FF9800'
    },
    {
      statKey: 'storage',
      title: 'File Storage',
      icon: FileText,
      unit: 'MB',
      color: '#2196F3'
    },
    {
      statKey: 'blog',
      title: 'Blog Service',
      icon: FileText,
      color: '#9C27B0'
    },
    {
      statKey: 'push',
      title: 'Push Notifications',
      icon: MessageSquare,
      color: '#E91E63'
    },
    {
      statKey: 'ai',
      title: 'AI Calls',
      icon: Zap,
      color: '#607D8B'
    },
    {
      statKey: 'subscribers',
      title: 'Newsletter Subscribers',
      icon: Zap,
      color: '#607D8B'
    },
  ];

  const services = useMemo(() => {
    if (!serviceCosts.length) return [];
    
    return serviceCosts
      .filter(cost => cost.isActive)
      .map(cost => {
        const config = serviceConfig.find(c => c.statKey.toUpperCase() === cost.service.toUpperCase());
        if (!config) return null;
        return {
          ...config,
          ...cost,
          title: config.title, // Keep UI title
        };
      })
      .filter(Boolean);
  }, [serviceCosts]);

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
      window.location.href = 'mailto:sales@dropaphi.com?subject=Enterprise Plan Inquiry';
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
        const dbPlan = availablePlans.find(p => p.tier === selectedPlan);
        const planPrice = dbPlan ? Number(dbPlan.price) : 0;
        
        const discount = appliedPromo.discountType === 'PERCENTAGE'
          ? Math.round(planPrice * (appliedPromo.discountValue / 100))
          : (appliedPromo.flatDiscount || appliedPromo.discountValue);
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
    // Check availablePlans from DB first
    const dbPlan = availablePlans.find(p => p.tier === tier);
    if (!dbPlan) return 0;
    const planPrice = Number(dbPlan.price);
    
    if (appliedPromo && selectedPlan === tier) {
      const discount = appliedPromo.discountType === 'PERCENTAGE'
        ? Math.round(planPrice * (appliedPromo.discountValue / 100))
        : (appliedPromo.flatDiscount || appliedPromo.discountValue);
      return planPrice - Math.min(discount, planPrice);
    }
    return planPrice;
  };

  // Get usage data from dashboard overview (sync with overview page)
  const usage = overview?.usage || {
    sms: { used: 0, limit: 0, percentage: 0 },
    email: { used: 0, limit: 0, percentage: 0 },
    otp: { used: 0, limit: 0, percentage: 0 },
    storage: { used: 0, limit: 0, percentage: 0 },
    blog: { used: 0, limit: 0, percentage: 0 },
    push: { used: 0, limit: 0, percentage: 0 },
    ai: { used: 0, limit: 0, percentage: 0 },
  };

  // console.log(subscription.)

  const walletData = overview?.wallet || {
    balance: 0,
    smsCredits: 0,
    emailCredits: 0,
    otpCredits: 0,
    storageCredits: 0,
    blogCredits: 0,
    pushCredits: 0,
    aiCredits: 0,
  };

  const walletBalance = walletData.balance || 0;

  if (isLoading && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 size={40} className="animate-spin" style={{ color: '#DC143C' }} />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-100">
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-2 bg-card rounded-lg border border-border p-4 flex items-center gap-3">
          <Building2 size={20} className="text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Current Workspace</p>
            <p className="font-medium text-foreground">{currentWorkspace.name}</p>
          </div>
          {subscription && (
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                subscription.tier === 'FREE' 
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {subscription.tier} Plan
              </span>
              {subscription.status === 'ACTIVE' ? (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
                  Active
                </span>
              ) : (
                <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded">
                  {subscription.status}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Wallet Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(walletBalance)}</p>
              </div>
           </div>
           <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10" onClick={() => handleTopUp({title: 'Wallet', statKey: 'balance', unit: 'funds'})}>
              Top Up
           </Button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground">
          {isFreePlan 
            ? 'You are currently on the Free plan. Upgrade to access more features.'
            : 'Manage your workspace subscription and billing'}
        </p>
      </motion.div>

      {/* Promo Codes Banner */}
      {/* {promoCodes.length > 0 && !appliedPromo && !isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-red-500 to-red-600 rounded-lg p-4 text-white"
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
      )} */}

      {/* Resource Usage Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Resource Usage</h2>
          <p className="text-sm text-muted-foreground">Monitor and top up your workspace resources</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service: any) => {
            const key = service.statKey as keyof typeof usage;
            const item = usage[key] || { used: 0, limit: 0, percentage: 0 };
            const creditsKey = `${key}Credits` as keyof typeof walletData;
            const credits = (walletData[creditsKey] as number) || 0;

            return (
              <UsageProgress
                key={service.statKey}
                title={service.title}
                used={item.used}
                limit={item.limit}
                percentage={item.percentage}
                walletCredits={credits}
                color={service.color}
                icon={service.icon}
                unit={service.unit}
                onTopUp={() => handleTopUp(service)}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={!!topUpService}
        onClose={() => setTopUpService(null)}
        serviceTitle={topUpService?.title || ''}
        serviceType={topUpService?.type || ''}
        unit={topUpService?.unit}
        workspaceId={currentWorkspace?.id || ''}
        onSuccess={() => {
          loadData();
          fetchOverview(currentWorkspace?.id || '');
        }}
      />

      {/* Current Plan */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
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
                  <span className="text-2xl font-bold text-foreground">
                    {subscription.tier} Plan
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {isFreePlan && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Free plan includes basic limits for all services. Top up or upgrade for more.
                  </p>
                )}
              </div>

              {!isFreePlan && (
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                  disabled={processing}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>

            {/* Detailed usage is shown in the Resource Usage grid above */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Plan Status</h4>
                  <p className="text-sm text-muted-foreground">Your subscription is currently {subscription.status.toLowerCase()}.</p>
                </div>
                <Button variant="outline" onClick={() => setShowPromoInput(!showPromoInput)}>
                  Have a promo code?
                </Button>
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
        className="bg-card rounded-lg border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {isFreePlan ? 'Upgrade Your Plan' : 'Available Plans'}
          </h2>
        </div>

        <div className="p-6">
          {availablePlans.length === 0 && !isLoading && (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                  <AlertCircle className="mx-auto text-muted-foreground mb-3" size={40} />
                  <h3 className="text-lg font-medium text-foreground">No plans available</h3>
                  <p className="text-muted-foreground">Please check back later or contact support.</p>
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans
              .filter((p: any) => p.tier !== 'FREE' || !isFreePlan) // Hide FREE if already on FREE
              .map((plan: any) => {
                const isSelected = selectedPlan === plan.tier;
                const finalPrice = getPlanPrice(plan.tier);
                const hasDiscount = appliedPromo && isSelected && finalPrice < plan.price;
                const isCurrentPlan = subscription?.tier === plan.tier;
                
                const featuresList = (plan: any) => {
                  const list: string[] = [];
                  
                  // Plan Name and Core Limits
                  if (plan.subscriberLimit) list.push(`${plan.subscriberLimit.toLocaleString()} Subscribers`);
                  if (plan.emailLimit) list.push(`${plan.emailLimit.toLocaleString()} Emails/mo`);
                  if (plan.smsLimit) list.push(`${plan.smsLimit.toLocaleString()} SMS/mo`);
                  if (plan.otpLimit) list.push(`${plan.otpLimit.toLocaleString()} OTPs/mo`);
                  if (plan.aiLimit) list.push(`${plan.aiLimit.toLocaleString()} AI Calls/mo`);
                  if (plan.blogLimit) list.push(`${plan.blogLimit.toLocaleString()} Blog Posts/mo`);
                  if (plan.pushLimit) list.push(`${plan.pushLimit.toLocaleString()} Push Notifications/mo`);
                  if (plan.devApiAccess === true) list.push(`API Access`);
                  if (plan.feature ) list.push(`${plan.feature.toLocaleString()}  `);
                  if (plan.storageLimit) list.push(`${formatStorageLimit(plan.storageLimit)} Storage` );
                  
                  if (plan.feature ) {
                    list.push(plan.feature);
                  }

                  if (plan.features && typeof plan.features === 'object') {
                    Object.entries(plan.features).forEach(([key, value]) => {
                      // If value is truthy (including non-empty strings)
                      if (value && value !== '') {
                        // Convert camelCase or kebab-case to Title Case
                        let featureName = key
                          .replace(/([A-Z])/g, ' $1')  // Add space before capitals
                          .replace(/([a-z])([A-Z])/g, '$1 $2')  // Handle camelCase
                          .replace(/[-_]/g, ' ')  // Replace hyphens/underscores with spaces
                          .replace(/^./, (str) => str.toUpperCase());  // Capitalize first letter
                        
                        // Remove duplicate spaces and trim
                        featureName = featureName.replace(/\s+/g, ' ').trim();
                        
                        // Add custom suffix for specific features if needed
                        if (key.toLowerCase().includes('support')) {
                          featureName = `${featureName} Support`;
                        }
                        
                        if (!list.some(item => item.toLowerCase().includes(featureName.toLowerCase()))) {
                          list.push(featureName);
                        }
                      }
                    });
                  }


                  
                  // Fallback to static features if no numeric limits found
                  if (list.length <= 1 && Array.isArray(plan.features)) {
                    return plan.features;
                  }

                  return list;
                };

                // Don't show current plan if it's FREE (since we're showing upgrade options)
                if (isCurrentPlan && plan.tier === 'FREE') return null;
                
                return (
                  <motion.div
                    key={plan.tier}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5' 
                        : isCurrentPlan
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                        : 'border-border hover:border-muted-foreground'
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

                    <h3 className="text-lg font-bold mb-2 capitalize" style={{ color: '#1A1A1A' }}>
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
                      {featuresList(plan).map((feature: string, i: number) => (
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
                        backgroundColor: isSelected ? 'hsl(var(--primary))' : isCurrentPlan ? 'hsl(var(--success, 142 76% 36%))' : 'hsl(var(--card))',
                        color: isSelected || isCurrentPlan ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                        border: isSelected || isCurrentPlan ? 'none' : '1px solid hsl(var(--border))',
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
                className="mt-8 p-6 bg-muted rounded-lg"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-foreground">
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
                          className="bg-primary hover:bg-primary/90"
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
                    className="md:min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground"
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
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Invoice History
            </h2>
          </div>

          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </p>
                  {invoice.promoCode && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Promo: {invoice.promoCode}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {invoice.discount > 0 && (
                    <p className="text-sm line-through text-muted-foreground">
                      {formatCurrency(invoice.amount)}
                    </p>
                  )}
                  <p className="font-bold text-foreground">
                    {formatCurrency(invoice.finalAmount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    invoice.status === 'PAID'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
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