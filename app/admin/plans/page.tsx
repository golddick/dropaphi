'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  tier: string;
  description?: string;
  price: number;
  interval: string;
  subscriberLimit: number;
  emailLimit: number;
  storageLimit: number;
  smsLimit: number;
  otpLimit: number;
  emailCredits: number;
  smsCredits: number;
  otpCredits: number;
  storageCredits: number;
  extraCreditRate: number;
  rollOverCredits: boolean;
  features?: any;
  isActive: boolean;
  devApiAccess: boolean;
  paystackPlanCode?: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [planFeatures, setPlanFeatures] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchPlans();
    fetchServiceStatuses();
  }, []);

  const fetchServiceStatuses = async () => {
    try {
      const res = await fetch('/api/pricing');
      const data = await res.json();
      if (data.success) {
        const statuses: Record<string, boolean> = {};
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          statuses[key] = value.isActive;
        });
        setServiceStatuses(statuses);
      }
    } catch (error) {
      console.error('Failed to load service statuses');
    }
  };

  useEffect(() => {
    if (editingPlan) {
      setPlanFeatures(editingPlan.features || {});
    } else {
      setPlanFeatures({});
    }
  }, [editingPlan]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();

      console.log(data , 'plan data');
      if (data.status === 'success') {
        setPlans(data.data.plans);
      } else if (data.success) {
        setPlans(data.data.plans);
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      tier: formData.get('tier'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      interval: formData.get('interval'),
      subscriberLimit: parseInt(formData.get('subscriberLimit') as string),
      emailLimit: parseInt(formData.get('emailLimit') as string),
      storageLimit: parseFloat(formData.get('storageLimit') as string),
      smsLimit: parseInt(formData.get('smsLimit') as string),
      otpLimit: parseInt(formData.get('otpLimit') as string),
      emailCredits: parseInt(formData.get('emailCredits') as string),
      smsCredits: parseInt(formData.get('smsCredits') as string),
      otpCredits: parseInt(formData.get('otpCredits') as string),
      storageCredits: parseFloat(formData.get('storageCredits') as string),
      extraCreditRate: parseFloat(formData.get('extraCreditRate') as string),
      rollOverCredits: formData.get('rollOverCredits') === 'true',
      devApiAccess: formData.get('devApiAccess') === 'true',
      paystackPlanCode: formData.get('paystackPlanCode'),
      features: planFeatures,
    };

    try {
      const method = editingPlan ? 'PATCH' : 'POST';
      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(editingPlan ? 'Plan updated' : 'Plan created');
        setIsModalOpen(false);
        setEditingPlan(null);
        fetchPlans();
      } else {
        toast.error('Failed to save plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 text-sm">Manage the pricing and limits for your platform</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading plans...</p>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                  {plan.tier}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">₦{Number(plan.price).toLocaleString()}</p>
                <p className="text-xs text-gray-500">per {plan.interval}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subscribers</span>
                <span className="font-medium">{plan.subscriberLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Emails / SMS / OTP</span>
                <span className="font-medium">{plan.emailLimit.toLocaleString()} / {plan.smsLimit.toLocaleString()} / {plan.otpLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="font-medium">{plan.storageLimit} MB</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-xs font-bold">Included Credits</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Email / SMS / OTP</span>
                <span className="font-medium">{plan.emailCredits} / {plan.smsCredits} / {plan.otpCredits}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Storage</span>
                <span className="font-medium">{plan.storageCredits} GB</span>
              </div>
              <div className="flex justify-between text-xs border-t pt-1">
                <span>Dev API Access</span>
                <span className="font-medium">{plan.devApiAccess ? 'Yes' : 'No'}</span>
              </div>
              {plan.features && Object.entries(plan.features).length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Custom Features</span>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {Object.entries(plan.features as Record<string, any>).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs">
                {plan.isActive ? (
                  <><CheckCircle size={14} className="text-green-500" /> Active</>
                ) : (
                  <><XCircle size={14} className="text-red-500" /> Inactive</>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingPlan(plan);
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Plan Name</label>
                  <input name="name" defaultValue={editingPlan?.name} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Tier</label>
                  <select name="tier" defaultValue={editingPlan?.tier || 'FREE'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="FREE">FREE</option>
                    <option value="STARTER">STARTER</option>
                    <option value="PROFESSIONAL">PROFESSIONAL</option>
                    <option value="BUSINESS">BUSINESS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Description</label>
                <textarea name="description" defaultValue={editingPlan?.description} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Price (₦)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingPlan?.price} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Interval</label>
                  <select name="interval" defaultValue={editingPlan?.interval || 'month'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Subscriber Limit</label>
                  <input name="subscriberLimit" type="number" defaultValue={editingPlan?.subscriberLimit ?? 100} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">Email Limit</label>
                    {serviceStatuses.email === false && (
                      <AlertTriangle size={12} className="text-amber-500" title="Email service is globally disabled" />
                    )}
                  </div>
                  <input name="emailLimit" type="number" defaultValue={editingPlan?.emailLimit ?? 500} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${serviceStatuses.email === false ? 'bg-amber-50 border-amber-200' : ''}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">SMS Limit</label>
                    {serviceStatuses.sms === false && (
                      <AlertTriangle size={12} className="text-amber-500" title="SMS service is globally disabled" />
                    )}
                  </div>
                  <input name="smsLimit" type="number" defaultValue={editingPlan?.smsLimit ?? 0} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${serviceStatuses.sms === false ? 'bg-amber-50 border-amber-200' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">OTP Limit</label>
                    {serviceStatuses.otp === false && (
                      <AlertTriangle size={12} className="text-amber-500" title="OTP service is globally disabled" />
                    )}
                  </div>
                  <input name="otpLimit" type="number" defaultValue={editingPlan?.otpLimit ?? 0} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${serviceStatuses.otp === false ? 'bg-amber-50 border-amber-200' : ''}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">Storage Limit (MB)</label>
                    {serviceStatuses.storage === false && (
                      <AlertTriangle size={12} className="text-amber-500" title="Storage service is globally disabled" />
                    )}
                  </div>
                  <input name="storageLimit" type="number" step="0.1" defaultValue={editingPlan?.storageLimit ?? 100} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${serviceStatuses.storage === false ? 'bg-amber-50 border-amber-200' : ''}`} />
                </div>
              </div>

              {/* Status Warning */}
              {(serviceStatuses.email === false || serviceStatuses.sms === false || serviceStatuses.otp === false || serviceStatuses.storage === false || serviceStatuses.api === false) && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 items-start">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-tight">
                    One or more services included in this plan are currently <strong>disabled globally</strong> in System Settings. 
                    Limits for these services will be inaccessible to users until the services are re-enabled.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Included Email Credits</label>
                  <input name="emailCredits" type="number" defaultValue={editingPlan?.emailCredits ?? 0} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Included SMS Credits</label>
                  <input name="smsCredits" type="number" defaultValue={editingPlan?.smsCredits ?? 0} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Included OTP Credits</label>
                  <input name="otpCredits" type="number" defaultValue={editingPlan?.otpCredits ?? 0} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Included Storage Credits (GB)</label>
                  <input name="storageCredits" type="number" step="0.1" defaultValue={editingPlan?.storageCredits ?? 0} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Extra Credit Rate (₦)</label>
                  <input name="extraCreditRate" type="number" step="0.01" defaultValue={editingPlan?.extraCreditRate ?? 0} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Rollover Credits</label>
                  <select name="rollOverCredits" defaultValue={editingPlan?.rollOverCredits ? 'true' : 'false'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Dev API Access</label>
                  <select name="devApiAccess" defaultValue={editingPlan?.devApiAccess !== false ? 'true' : 'false'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <label className="text-xs font-bold text-gray-500 block">Additional Features</label>
                
                {Object.entries(planFeatures).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {Object.entries(planFeatures).map(([name, value]) => (
                      <div key={name} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-sm">
                        <span className="flex-1 font-medium">{name}: {String(value)}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = { ...planFeatures };
                            delete updated[name];
                            setPlanFeatures(updated);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    placeholder="Feature name"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input 
                    placeholder="Value"
                    value={newFeatureValue}
                    onChange={(e) => setNewFeatureValue(e.target.value)}
                    className="w-24 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newFeatureName.trim()) {
                        setPlanFeatures({ ...planFeatures, [newFeatureName.trim()]: newFeatureValue });
                        setNewFeatureName('');
                        setNewFeatureValue('');
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 rounded text-xs font-bold hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1 border-t pt-4">
                <label className="text-xs font-bold text-gray-500">Paystack Plan Code</label>
                <input name="paystackPlanCode" defaultValue={editingPlan?.paystackPlanCode} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="PLN_..." />
              </div>

              <button type="submit" className="w-full py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
