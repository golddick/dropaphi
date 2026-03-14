'use client';

import { PLANS } from '@/lib/billing/plan';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Format price in Naira
const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `₦${price.toLocaleString()}`;
};

// Map plan features to display format
const getFeatureList = (plan: typeof PLANS[0]) => {
  const features = [
    `${plan.limits.sms.toLocaleString()} SMS/month`,
    `${plan.limits.email.toLocaleString()} Emails/month`,
    `${plan.limits.otp.toLocaleString()} OTP verifications/month`,
    plan.limits.storage >= 1024 
      ? `${plan.limits.storage / 1024} GB Storage`
      : `${plan.limits.storage} MB Storage`,
  ];

  // Add additional features based on tier
  if (plan.tier === 'FREE') {
    features.push('Basic Analytics', 'Community Support');
  } else if (plan.tier === 'STARTER') {
    features.push('Advanced Analytics', 'Priority Support', 'API Access');
  } else if (plan.tier === 'PROFESSIONAL') {
    features.push('WhatsApp Integration', 'Webhook Support', '24/7 Support');
  } else if (plan.tier === 'BUSINESS') {
    features.push('Dedicated Support', 'Custom Sender ID', 'SLA Guarantee');
  }

  return features;
};

export default function PricingSection() {
  // Filter out any plans you don't want to display
  const displayPlans = PLANS.filter(plan => 
    ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS'].includes(plan.tier)
  );

  return (
    <section id="pricing" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-4">
            Pricing
          </div>
          <h2 className="font-[Bricolage_Grotesque] text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-gray-900">
            Transparent. <span className="text-red-600">No surprises.</span>
          </h2>
          <p className="font-sans text-base text-gray-500 mt-3 max-w-sm mx-auto">
            Start free, upgrade when you need it. DropID SDK on every plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {displayPlans.map((plan, i) => {
            const isPopular = plan.tier === 'PROFESSIONAL';
            const features = getFeatureList(plan);
            
            return (
              <motion.div 
                key={plan.tier} 
                initial={{ opacity: 0, y: 24 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }} 
                viewport={{ once: true }}
                className={`relative p-6 lg:p-8 rounded-2xl flex flex-col h-full ${
                  isPopular 
                    ? 'bg-black text-white border-2 border-red-600 shadow-xl scale-105 lg:scale-105' 
                    : 'bg-white border border-gray-200 text-gray-900 hover:shadow-lg transition-shadow'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white font-[Bricolage_Grotesque] font-extrabold text-xs px-4 py-1 rounded-full tracking-wider whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                
                {/* Plan name */}
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider mb-4 ${
                  isPopular 
                    ? 'bg-white/10 border border-white/20 text-gray-400' 
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                }`}>
                  {plan.name}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-[Bricolage_Grotesque] text-3xl lg:text-4xl font-extrabold tracking-tight">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className={`font-mono text-sm ml-1 ${isPopular ? 'text-white/40' : 'text-gray-400'}`}>
                      /mo
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className={`h-px mb-6 ${isPopular ? 'bg-white/10' : 'bg-gray-100'}`} />

                {/* Features */}
                <ul className="list-none p-0 m-0 flex-1 flex flex-col gap-3 mb-8">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-red-600 text-xs mt-1">✓</span>
                      <span className={`font-sans text-sm ${
                        isPopular ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link 
                  href={{
                    pathname: '/auth/signup',
                    query: plan.price > 0 ? { plan: plan.tier.toLowerCase() } : undefined
                  }}
                  className="block mt-auto"
                >
                  <button className={`w-full py-3 rounded-lg font-[Bricolage_Grotesque] font-bold transition-all ${
                    isPopular
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-transparent border border-gray-200 text-gray-800 hover:border-red-600 hover:text-red-600'
                  }`}>
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                  </button>
                </Link>

                {/* Paystack Plan Code (hidden, for reference) */}
                {plan.paystackPlanCode && (
                  <div className="hidden" data-plan-code={plan.paystackPlanCode} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            All plans include DropID SDK, API access, and 24/7 monitoring.
            <br />
            Need a custom plan? <Link href="/contact" className="text-red-600 hover:underline">Contact sales</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

