'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '@/lib/stores/workspace';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { useSubscriptionStore } from '@/lib/stores/subscription';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceType: string;
  unit?: string;
  workspaceId: string;
  onSuccess?: () => void;
}



interface PricingInfo {
    amount: number;
    price: number;
    usageRate: number;
    minPurchase: number;
    isActive: boolean;
}

export function TopUpModal({
  isOpen,
  onClose,
  serviceTitle,
  serviceType,
  unit = '',
  workspaceId,
  onSuccess,
}: TopUpModalProps) {
  const [unitsToBuy, setUnitsToBuy] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState<Record<string, PricingInfo>>({});
  const { currentWorkspace } = useWorkspaceStore();

  const priceInfo = dynamicPricing[serviceType.toLowerCase()];
  
  // Total Price in Naira = (Units requested / amount_unit) * price_per_unit
  // Our new model: amount is always 1, price is the unit cost.
  const totalPrice = priceInfo ? (unitsToBuy * priceInfo.price) : 0;

  useEffect(() => {
    if (isOpen) {
      const fetchPricing = async () => {
        try {
          const res = await fetch('/api/pricing');
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
                setDynamicPricing(result.data);

                console.log(dynamicPricing)
                console.log(serviceType)

                // The serviceType from props might be camelCase (e.g. 'sms')
                // But let's be extra safe and check lowercase
                const info = result.data[serviceType.toLowerCase()];
                if (info) {
                    setUnitsToBuy(info.minPurchase || 100);
                }
            }
          }
        } catch (err) {
          console.error('Failed to fetch dynamic pricing:', err);
        }
      };
      fetchPricing();
    }
  }, [isOpen, serviceType]);

  const handlePurchase = async () => {
    if (!workspaceId || !priceInfo) return;
    
    if (unitsToBuy < priceInfo.minPurchase) {
        toast.error(`Minimum purchase for ${serviceTitle} is ${priceInfo.minPurchase} units`);
        return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/wallet/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          quantity: unitsToBuy,
          price: totalPrice,
          promoCode: promoCode || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Payment initialization failed');

      if (result.data?.authorization_url) {
          // Redirect to Paystack
          window.location.href = result.data.authorization_url;
          return;
      }

      setIsSuccess(true);
      toast.success(`Request processed successfully.`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process top-up. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl">Top Up {serviceTitle}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add extra {serviceType === 'balance' ? 'funds' : 'credits'} to your wallet. 
                {serviceType !== 'balance' && " These credits never expire and will be used when your plan limit is reached."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {!priceInfo && serviceType !== 'balance' ? (
                <div className="text-center py-6 bg-muted rounded-lg border border-dashed border-border">
                  <p className="text-muted-foreground">plan isn't created yet</p>
                </div>
              ) : priceInfo?.isActive === false && serviceType !== 'balance' ? (
                <div className="text-center py-8 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30 px-6">
                  <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                  </div>
                  <h3 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-1">Service Temporarily Unavailable</h3>
                  <p className="text-amber-700/70 dark:text-amber-400/60 text-xs">
                    The {serviceTitle} service is currently disabled by the administrator for maintenance. Please check back later.
                  </p>
                </div>
              ) : (
                <>
                  {serviceType !== 'balance' && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="units" className="text-foreground">Units to Purchase</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="units"
                          type="number"
                          min={priceInfo?.minPurchase || 1}
                          value={unitsToBuy}
                          onChange={(e) => setUnitsToBuy(Math.max(0, parseInt(e.target.value) || 0))}
                          className="flex-1 bg-background border-border text-foreground text-lg font-bold"
                        />
                        <span className="text-sm text-muted-foreground font-medium uppercase">
                          {unit}s
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 italic flex justify-between">
                        <span>Min. purchase: {priceInfo?.minPurchase || 1} units @ ₦{priceInfo?.price || 0}/unit</span>
                        {priceInfo?.usageRate && priceInfo.usageRate > 1 && (
                          <span>Usage: {priceInfo.usageRate} units/item</span>
                        )}
                      </p>
                    </div>
                  )}

                      {serviceType === 'balance' && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="amount" className="text-foreground">Amount (NGN)</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="500"
                                step="100"
                                value={totalPrice || ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setUnitsToBuy(val / (priceInfo?.price || 1));
                                }}
                                className="bg-background border-border text-foreground"
                                placeholder="Enter amount to top up"
                            />
                            <p className="text-[10px] text-muted-foreground">Minimum top-up is ₦500</p>
                        </div>
                      )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="promo" className="text-foreground">Promo Code (Optional)</Label>
                    <Input
                      id="promo"
                      placeholder="ENTER CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-background border-border text-foreground uppercase"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    {serviceType !== 'balance' && (
                        <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Units to add:</span>
                        <span className="font-bold text-foreground">{unitsToBuy.toLocaleString()} {unit}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm font-medium text-foreground">Total Price:</span>
                      <span className="text-lg font-bold text-primary">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing} className="bg-background border-border text-foreground">
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={isProcessing || (!priceInfo && serviceType !== 'balance')} 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay with Paystack
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">
                You are being redirected to Paystack...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
