// lib/billing/plans.ts

import { SubscriptionTier } from "../generated/prisma/enums";

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limits: {
    subscribers: number;
    sms: number;
    email: number;
    otp: number;
    storage: number; // in MB
  };
  paystackPlanCode?: string;
}

export const PLANS: Plan[] = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    features: [
      '500 SMS/month',
      '1,000 Emails/month',
      '500 OTP verifications/month',
      '100 MB Storage',
      'Basic Analytics',
      'Community Support',
    ],
    limits: {
      subscribers: 1000,
      sms: 500,
      email: 1000,
      otp: 500,
      storage: 100,
    },
  },
  {
    tier: 'STARTER',
    name: 'Starter',
    price: 1000, // ₦1,000
    features: [
      '5,000 SMS/month',
      '10,000 Emails/month',
      '5,000 OTP verifications/month',
      '1 GB Storage',
      'Advanced Analytics',
      'Priority Support',
      'API Access',
    ],
    limits: {
      subscribers: 10000,
      sms: 5000,
      email: 10000,
      otp: 5000,
      storage: 1024, // 1GB
    },
    paystackPlanCode: process.env.PAYSTACK_STARTER_PLAN_CODE || 'PLN_vk1ee3ktb6f379t',
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    price: 2500, // ₦2,500
    features: [
      '25,000 SMS/month',
      '50,000 Emails/month',
      '25,000 OTP verifications/month',
      '5 GB Storage',
      'Everything in Starter',
      'WhatsApp Integration',
      'Webhook Support',
      '24/7 Support',
    ],
    limits: {
      subscribers: 50000,
      sms: 25000,
      email: 50000,
      otp: 25000,
      storage: 5120, // 5GB
    },
    paystackPlanCode: process.env.PAYSTACK_PROFESSIONAL_PLAN_CODE || 'PLN_c4oywrnqhuskhxq',
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    price: 5000, // ₦5,000
    features: [
      '50,000 SMS/month',
      '100,000 Emails/month',
      '50,000 OTP verifications/month',
      '10 GB Storage',
      'Everything in Professional',
      'Dedicated Support',
      'Custom Sender ID',
      'SLA Guarantee',
    ],
    limits: {
      subscribers: 100000,
      sms: 50000,
      email: 100000,
      otp: 50000,
      storage: 10240, // 10GB
    },
paystackPlanCode: process.env.PAYSTACK_BUSINESS_PLAN_CODE || 'PLN_olurhwssfcm75k3',
  },
];


export function getPlanByTier(tier: SubscriptionTier): Plan | undefined {
  return PLANS.find(p => p.tier === tier);
}

export function calculateDiscount(price: number, promoCode: any): number {
  if (!promoCode) return 0;
  
  if (promoCode.discountType === 'PERCENTAGE') {
    return Math.round(price * (promoCode.discountValue / 100));
  } else {
    return Math.min(promoCode.discountValue, price);
  }
}