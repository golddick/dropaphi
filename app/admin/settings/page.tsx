// 'use client';
//
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { Save, AlertCircle, Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
//
// export default function AdminSettingsPage() {
//     const [costs, setCosts] = useState<any[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isSavingAll, setIsSavingAll] = useState(false);
//     const [saved, setSaved] = useState(false);
//
//     useEffect(() => {
//         fetchCosts();
//     }, []);
//
//     const fetchCosts = async () => {
//         try {
//             setIsLoading(true);
//             const res = await fetch('/api/admin/service-costs');
//
//             console.log(res , 'cost ')
//
//             if (res.ok) {
//                 const result = await res.json();
//                 setCosts(result.data || []);
//             }
//         } catch (err) {
//             toast.error('Failed to load service costs');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const handleCostChange = (service: string, field: string, value: any) => {
//         setCosts(prev => {
//             const existing = prev.find(c => c.service === service);
//             if (existing) {
//                 return prev.map(c =>
//                     c.service === service ? { ...c, [field]: value } : c
//                 );
//             } else {
//                 return [...prev, { service, [field]: value, cost: 0, usageRate: 1, minPurchase: 1, isActive: true }];
//             }
//         });
//     };
//
//
//
//     const saveAllCosts = async () => {
//         try {
//             setIsSavingAll(true);
//
//             const payload = costs.map(c => ({
//                 service: c.service,
//                 cost: c.cost?.toString().trim() || "0",
//                 usageRate: c.usageRate?.toString().trim() || "1",
//                 minPurchase: c.minPurchase?.toString().trim() || "1",
//                 isActive: c.isActive ?? true,
//                 description: c.description || null
//             }));
//
//             const res = await fetch('/api/admin/service-costs', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
//
//             if (res.ok) {
//                 toast.success('All service costs updated');
//                 fetchCosts();
//             } else {
//                 const errorData = await res.json().catch(() => ({}));
//                 toast.error(errorData.error || 'Failed to update');
//             }
//         } catch {
//             toast.error('Save failed');
//         } finally {
//             setIsSavingAll(false);
//         }
//     };
//
//
//     const saveServiceCost = async (serviceCost: any) => {
//         try {
//             setIsSaving(true);
//
//             const payload = {
//                 service: serviceCost.service,
//
//                 // Send as STRING (important)
//                 cost: serviceCost.cost?.toString().trim() || "0",
//                 usageRate: serviceCost.usageRate?.toString().trim() || "1",
//                 minPurchase: serviceCost.minPurchase?.toString().trim() || "1",
//
//                 isActive: serviceCost.isActive ?? true,
//                 description: serviceCost.description || null
//             };
//
//             const res = await fetch('/api/admin/service-costs', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
//
//             if (res.ok) {
//                 setSaved(true);
//                 setTimeout(() => setSaved(false), 3000);
//                 toast.success(`Updated ${serviceCost.service}`);
//                 await fetchCosts();
//             } else {
//                 const errorData = await res.json().catch(() => ({}));
//                 toast.error(errorData.error || 'Failed to update');
//             }
//         } catch (err) {
//             toast.error('Save failed');
//         } finally {
//             setIsSaving(false);
//         }
//     };
//
//
//     const services = [
//         { key: 'EMAIL', label: 'Email Service' },
//         { key: 'SMS', label: 'SMS Service' },
//         { key: 'OTP', label: 'OTP (Email) Service' },
//         { key: 'STORAGE', label: 'Storage Overage (GB)' },
//         { key: 'BLOG', label: 'Blog Service' },
//         { key: 'PUSH', label: 'Push Notification' },
//         { key: 'SUBSCRIBERS', label: 'SUBSCRIBERS Usage' },
//         { key: 'API', label: 'API Usage' },
//     ];
//
//     return (
//         <div className="space-y-6 pb-20">
//             {/* Header */}
//             <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//             >
//                 <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
//                     System Settings
//                 </h1>
//                 <p style={{ color: '#666666' }}>
//                     Configure platform-wide pricing and service rules
//                 </p>
//             </motion.div>
//
//             {/* Pricing Settings */}
//             <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.1, duration: 0.5 }}
//                 className="space-y-4"
//             >
//                 <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
//                         Service Pricing & Rules
//                     </h2>
//                     <div className="flex items-center gap-3">
//                         {isLoading && <Loader2 className="animate-spin h-5 w-5 text-gray-400" />}
//                         <Button
//                             onClick={saveAllCosts}
//                             disabled={isSavingAll || isLoading}
//                             className="bg-red-600 hover:bg-red-700 text-white"
//                         >
//                             {isSavingAll ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
//                             Save All Changes
//                         </Button>
//                     </div>
//                 </div>
//
//                 <div className="grid grid-cols-1 gap-6">
//                     {services.map((s) => {
//                         const costData = costs.find(c => c.service === s.key) || {
//                             service: s.key,
//                             cost: '',
//                             usageRate: '',
//                             minPurchase: '',
//                             isActive: true
//                         };
//
//                         return (
//                             <div
//                                 key={s.key}
//                                 className={`p-6 rounded-lg border bg-white shadow-sm flex items-center flex-col md:flex-row md:items-end gap-4 transition-opacity ${!costData.isActive ? 'opacity-75' : ''}`}
//                             >
//                                 <div className="flex-1 space-y-4 w-full">
//                                     <div className="flex items-center justify-between border-b pb-2">
//                                         <h3 className="font-bold text-lg flex items-center gap-2">
//                                             {s.label}
//                                             {!costData.isActive && (
//                                                 <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
//                                                     Disabled
//                                                 </span>
//                                             )}
//                                         </h3>
//                                         <div className="flex items-center gap-2">
//                                             <span className={`text-xs font-medium ${costData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
//                                                 {costData.isActive ? 'Active' : 'Inactive'}
//                                             </span>
//                                             <Switch
//                                                 checked={costData.isActive}
//                                                 onCheckedChange={(checked) => {
//                                                     handleCostChange(s.key, 'isActive', checked);
//                                                 }}
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                                         <div>
//                                             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
//                                                 Cost Per Unit (₦)
//                                             </label>
//                                             <Input
//                                                 type="number"
//                                                 value={costData.cost}
//                                                 onChange={(e) => {
//                                                     const val = e.target.value;
//                                                     // Allow empty string or any valid number
//                                                     if (val === '' || !isNaN(parseFloat(val))) {
//                                                         handleCostChange(s.key, 'cost', val);
//                                                     }
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     let val = e.target.value;
//                                                     if (val === '' || val === '-') {
//                                                         val = '0';
//                                                     }
//                                                     handleCostChange(s.key, 'cost', val);
//                                                 }}
//                                                 className="w-full"
//                                                 disabled={!costData.isActive}
//                                                 step="0.01"
//                                                 min="0"
//                                                 placeholder="0.00"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
//                                                 Credit Usage Rate
//                                             </label>
//                                             <Input
//                                                 type="number"
//                                                 value={costData.usageRate}
//                                                 onChange={(e) => {
//                                                     const val = e.target.value;
//                                                     // Allow empty string or any valid number including decimals
//                                                     if (val === '' || !isNaN(parseFloat(val))) {
//                                                         handleCostChange(s.key, 'usageRate', val);
//                                                     }
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     let val = e.target.value;
//                                                     if (val === '' || val === '-') {
//                                                         val = '1';
//                                                     }
//                                                     // Ensure valid decimal number
//                                                     const numVal = parseFloat(val);
//                                                     if (!isNaN(numVal)) {
//                                                         handleCostChange(s.key, 'usageRate', numVal.toString());
//                                                     } else {
//                                                         handleCostChange(s.key, 'usageRate', '1');
//                                                     }
//                                                 }}
//                                                 className="w-full"
//                                                 disabled={!costData.isActive}
//                                                 step="0.01"
//                                                 min="0.01"
//                                                 placeholder="0.00"
//                                             />
//                                             <p className="text-[10px] text-gray-400 mt-1">Credits used per action (supports decimals like 0.5)</p>
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
//                                                 Min. Top-up Units
//                                             </label>
//                                             <Input
//                                                 type="number"
//                                                 value={costData.minPurchase}
//                                                 onChange={(e) => {
//                                                     const val = e.target.value;
//                                                     // Allow empty string or any valid number
//                                                     if (val === '' || !isNaN(parseFloat(val))) {
//                                                         handleCostChange(s.key, 'minPurchase', val);
//                                                     }
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     let val = e.target.value;
//                                                     if (val === '' || val === '-') {
//                                                         val = '1';
//                                                     }
//                                                     handleCostChange(s.key, 'minPurchase', val);
//                                                 }}
//                                                 className="w-full"
//                                                 disabled={!costData.isActive}
//                                                 step="0.01"
//                                                 min="0"
//                                                 placeholder="1"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <Button
//                                     onClick={() => saveServiceCost(costData)}
//                                     disabled={isSaving}
//                                     className="bg-black hover:bg-gray-800 text-white min-w-[120px]"
//                                 >
//                                     {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
//                                     Save
//                                 </Button>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </motion.div>
//
//             {/* Warning Section */}
//             <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 0.5 }}
//                 className="p-6 rounded-lg border bg-red-50 border-red-100"
//             >
//                 <div className="flex gap-3">
//                     <AlertCircle size={24} className="text-red-600 shrink-0" />
//                     <div>
//                         <h3 className="font-bold mb-2 text-red-600">
//                             Danger Zone
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                             These settings affect the Marketplace (Top-up) prices for all users immediately.
//                             Always verify the Unit Cost and Usage Rate before saving.
//                         </p>
//                     </div>
//                 </div>
//             </motion.div>
//         </div>
//     );
// }



'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Save, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [costs, setCosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchCosts();
    }, []);

    const fetchCosts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/service-costs');

            console.log(res , 'cost ')

            if (res.ok) {
                const result = await res.json();
                setCosts(result.data || []);
            }
        } catch (err) {
            toast.error('Failed to load service costs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCostChange = (service: string, field: string, value: any) => {
        setCosts(prev => {
            const existing = prev.find(c => c.service === service);
            if (existing) {
                return prev.map(c =>
                    c.service === service ? { ...c, [field]: value } : c
                );
            } else {
                return [...prev, { service, [field]: value, cost: 0, usageRate: 1, minPurchase: 1, isActive: true }];
            }
        });
    };



    const saveAllCosts = async () => {
        try {
            setIsSavingAll(true);

            const payload = costs.map(c => ({
                service: c.service,
                cost: c.cost?.toString().trim() || "0",
                usageRate: c.usageRate?.toString().trim() || "1",
                minPurchase: c.minPurchase?.toString().trim() || "1",
                isActive: c.isActive ?? true,
                description: c.description || null
            }));

            const res = await fetch('/api/admin/service-costs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('All service costs updated');
                fetchCosts();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.error || 'Failed to update');
            }
        } catch {
            toast.error('Save failed');
        } finally {
            setIsSavingAll(false);
        }
    };


    const saveServiceCost = async (serviceCost: any) => {
        try {
            setIsSaving(true);

            const payload = {
                service: serviceCost.service,

                // Send as STRING (important)
                cost: serviceCost.cost?.toString().trim() || "0",
                usageRate: serviceCost.usageRate?.toString().trim() || "1",
                minPurchase: serviceCost.minPurchase?.toString().trim() || "1",

                isActive: serviceCost.isActive ?? true,
                description: serviceCost.description || null
            };

            const res = await fetch('/api/admin/service-costs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                toast.success(`Updated ${serviceCost.service}`);
                await fetchCosts();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.error || 'Failed to update');
            }
        } catch (err) {
            toast.error('Save failed');
        } finally {
            setIsSaving(false);
        }
    };


    const services = [
        { key: 'EMAIL', label: 'Email Service' },
        { key: 'SMS', label: 'SMS Service' },
        { key: 'OTP', label: 'OTP (Email) Service' },
        { key: 'STORAGE', label: 'Storage Overage (GB)' },
        { key: 'BLOG', label: 'Blog Service' },
        { key: 'PUSH', label: 'Push Notification' },
        { key: 'API', label: 'API Usage' },
        { key: 'SUBSCRIBERS', label: 'Subscriber Service' },
    ];

    return (
        <div className="space-y-6 pb-20">
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
                    Configure platform-wide pricing and service rules
                </p>
            </motion.div>

            {/* Pricing Settings */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                        Service Pricing & Rules
                    </h2>
                    <div className="flex items-center gap-3">
                        {isLoading && <Loader2 className="animate-spin h-5 w-5 text-gray-400" />}
                        <Button
                            onClick={saveAllCosts}
                            disabled={isSavingAll || isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSavingAll ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
                            Save All Changes
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {services.map((s) => {
                        const costData = costs.find(c => c.service === s.key) || {
                            service: s.key,
                            cost: '',
                            usageRate: '',
                            minPurchase: '',
                            isActive: true
                        };

                        return (
                            <div
                                key={s.key}
                                className={`p-6 rounded-lg border bg-white shadow-sm flex items-center flex-col md:flex-row md:items-end gap-4 transition-opacity ${!costData.isActive ? 'opacity-75' : ''}`}
                            >
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {s.label}
                                            {!costData.isActive && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
                                                    Disabled
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${costData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {costData.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <Switch
                                                checked={costData.isActive}
                                                onCheckedChange={(checked) => {
                                                    handleCostChange(s.key, 'isActive', checked);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                                Cost Per Unit (₦)
                                            </label>
                                            <Input
                                                type="number"
                                                value={costData.cost}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow empty string or any valid number
                                                    if (val === '' || !isNaN(parseFloat(val))) {
                                                        handleCostChange(s.key, 'cost', val);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    let val = e.target.value;
                                                    if (val === '' || val === '-') {
                                                        val = '0';
                                                    }
                                                    handleCostChange(s.key, 'cost', val);
                                                }}
                                                className="w-full"
                                                disabled={!costData.isActive}
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                                Credit Usage Rate
                                            </label>
                                            <Input
                                                type="number"
                                                value={costData.usageRate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow empty string or any valid number including decimals
                                                    if (val === '' || !isNaN(parseFloat(val))) {
                                                        handleCostChange(s.key, 'usageRate', val);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    let val = e.target.value;
                                                    if (val === '' || val === '-') {
                                                        val = '1';
                                                    }
                                                    // Ensure valid decimal number
                                                    const numVal = parseFloat(val);
                                                    if (!isNaN(numVal)) {
                                                        handleCostChange(s.key, 'usageRate', numVal.toString());
                                                    } else {
                                                        handleCostChange(s.key, 'usageRate', '1');
                                                    }
                                                }}
                                                className="w-full"
                                                disabled={!costData.isActive}
                                                step="0.01"
                                                min="0.01"
                                                placeholder="0.00"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Credits used per action (supports decimals like 0.5)</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                                Min. Top-up Units
                                            </label>
                                            <Input
                                                type="number"
                                                value={costData.minPurchase}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow empty string or any valid number
                                                    if (val === '' || !isNaN(parseFloat(val))) {
                                                        handleCostChange(s.key, 'minPurchase', val);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    let val = e.target.value;
                                                    if (val === '' || val === '-') {
                                                        val = '1';
                                                    }
                                                    handleCostChange(s.key, 'minPurchase', val);
                                                }}
                                                className="w-full"
                                                disabled={!costData.isActive}
                                                step="0.01"
                                                min="0"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => saveServiceCost(costData)}
                                    disabled={isSaving}
                                    className="bg-black hover:bg-gray-800 text-white min-w-[120px]"
                                >
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
                                    Save
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Warning Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="p-6 rounded-lg border bg-red-50 border-red-100"
            >
                <div className="flex gap-3">
                    <AlertCircle size={24} className="text-red-600 shrink-0" />
                    <div>
                        <h3 className="font-bold mb-2 text-red-600">
                            Danger Zone
                        </h3>
                        <p className="text-sm text-gray-600">
                            These settings affect the Marketplace (Top-up) prices for all users immediately.
                            Always verify the Unit Cost and Usage Rate before saving.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}