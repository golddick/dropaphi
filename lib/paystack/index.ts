// lib/paystack.ts
import axios from 'axios';

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface InitializeCustomSubscriptionParams {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  metadata: Record<string, any>;
}

export async function initializeCustomSubscription({ 
  email, 
  amount, 
  metadata 
}: InitializeCustomSubscriptionParams) {
  try {
    console.log('📤 [Paystack] Initializing custom subscription:', { 
      email, 
      amount, // This should be in naira
      amountInKobo: amount * 100,
      metadata 
    });

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY is not set');
    }

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = amount * 100;

    const requestBody = {
      email,
      amount: amountInKobo,
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/subscription/verify`,
    };

    console.log('📦 [Paystack] Request body:', requestBody);

    const response = await paystack.post('/transaction/initialize', requestBody);

    console.log('✅ [Paystack] Transaction initialized:', {
      reference: response.data.data.reference,
      authorization_url: response.data.data.authorization_url
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Paystack] Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

// Keep this for reference if you want to use plans without discounts
export async function initializePlanSubscription({ 
  email, 
  planCode, 
  metadata 
}: { 
  email: string; 
  planCode: string; 
  metadata: Record<string, any> 
}) {
  try {
    console.log('📤 [Paystack] Initializing plan subscription:', { email, planCode, metadata });

    const requestBody = {
      email,
      plan: planCode,
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/subscription/verify`,
    };

    const response = await paystack.post('/transaction/initialize', requestBody);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Paystack] Plan subscription error:', error.response?.data || error.message);
    throw error;
  }
}

export async function verifyTransaction(reference: string) {
  try {
    console.log('📤 [Paystack] Verifying transaction:', reference);

    const response = await paystack.get(`/transaction/verify/${reference}`);

    console.log('✅ [Paystack] Transaction verified:', {
      status: response.data.data.status,
      amount: response.data.data.amount / 100,
      customer: response.data.data.customer?.email
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [Paystack] Verify error:', error.response?.data || error.message);
    throw error;
  }
}







