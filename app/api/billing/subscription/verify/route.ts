import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { err, ok, serverError } from "@/lib/respond/response";
import { dropid } from "dropid";
import { 
  InvoiceStatus, 
  SubscriptionStatus, 
  PlanSubscriptionStatus, 
  SubscriptionTier,
  SubscriptionTransactionType,
  TransactionStatus
} from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack sometimes uses this

    console.log('🔵 [VERIFY_PAYMENT] Callback received:', { reference, trxref });

    const transactionRef = reference || trxref;
    
    if (!transactionRef) {
      console.log('🔴 [VERIFY_PAYMENT] No reference provided');
      return err('No transaction reference provided', 400);
    }

    // Verify the transaction with Paystack
    const verificationResult = await verifyTransaction(transactionRef);
    
    if (!verificationResult || !verificationResult.status) {
        console.log('🔴 [VERIFY_PAYMENT] Verification failed:', transactionRef);
        return err('Transaction verification failed', 400);
    }

    console.log('📊 [VERIFY_PAYMENT] Verification result:', {
      status: verificationResult.data.status,
      amount: verificationResult.data.amount / 100,
      customer: verificationResult.data.customer?.email,
      metadata: verificationResult.data.metadata
    });

    // Extract metadata
    const metadata = verificationResult.data.metadata || {};
    const { 
      workspaceId, 
      invoiceId, 
      type, // 'subscription_payment' or 'top_up'
      tier, 
      serviceType,
      quantity,
      promoCode, 
      discount, 
      originalAmount, 
      userId,
      workspaceName 
    } = metadata;

    if (!workspaceId || !invoiceId) {
      console.log('🔴 [VERIFY_PAYMENT] Missing critical metadata:', { workspaceId, invoiceId });
      return err('Invalid transaction metadata', 400);
    }

    // Start a transaction to update all related records
    // We do this BEFORE checking Paystack status to handle the "FAILED" case gracefully in DB
    const result = await db.$transaction(async (tx) => {
        // 1. Fetch current invoice to check status (Idempotency)
        const currentInvoice = await tx.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!currentInvoice) {
            throw new Error(`Invoice not found: ${invoiceId}`);
        }

        if (currentInvoice.status === InvoiceStatus.PAID) {
            console.log('ℹ️ [VERIFY_PAYMENT] Invoice already processed:', invoiceId);
            return { alreadyProcessed: true };
        }

        // 2. Check if Paystack says it failed
        if (verificationResult.data.status !== 'success') {
            console.log('🔴 [VERIFY_PAYMENT] Transaction not successful:', verificationResult.data.status);
            
            await tx.invoice.update({
                where: { id: invoiceId },
                data: { status: InvoiceStatus.FAILED }
            });

            return { failed: true };
        }

        // 3. Process based on type
        const isSubscription = type === 'subscription_payment' || !!tier;
        const isTopUp = type === 'top_up';

        // --- SHARED: Update Invoice to PAID ---
        const invoice = await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                status: InvoiceStatus.PAID,
                paidAt: new Date(),
                paymentRef: transactionRef,
                metadata: {
                    ...(metadata as any),
                    paystackResponse: verificationResult.data,
                    verifiedAt: new Date().toISOString(),
                },
            },
        });

        if (isSubscription) {
            // --- SUBSCRIPTION LOGIC ---
            console.log('💎 Processing Subscription Sync for:', workspaceId);

            // Fetch Plan details from DB (Admin-defined)
            const dbPlan = await tx.plan.findFirst({
                where: { tier: tier as SubscriptionTier, isArchived: false },
            });

            if (!dbPlan) {
                throw new Error(`Plan not found for tier: ${tier}`);
            }

            // Update or create workspace subscription
            const subscription = await tx.workspaceSubscription.upsert({
                where: { workspaceId: workspaceId },
                update: {
                    tier: tier as SubscriptionTier,
                    planId: dbPlan.id,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    monthlyPrice: originalAmount || Number(dbPlan.price),
                    paymentRef: transactionRef,
                    updatedAt: new Date(),
                },
                create: {
                    id: dropid('sub'),
                    workspaceId: workspaceId,
                    tier: tier as SubscriptionTier,
                    planId: dbPlan.id,
                    status: SubscriptionStatus.ACTIVE,
                    monthlyPrice: originalAmount || Number(dbPlan.price),
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    paymentRef: transactionRef,
                },
            });

            // Update Workspace limits and status
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    plan: tier as SubscriptionTier,
                    planSubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
                    subscriberLimit: dbPlan.subscriberLimit,
                    emailLimit: dbPlan.emailLimit,
                    smsLimit: dbPlan.smsLimit,
                    otpLimit: dbPlan.otpLimit,
                    fileLimit: Math.floor(dbPlan.storageLimit),
                    // Reset usage for new period
                    currentEmailsSent: 0,
                    currentSmsSent: 0,
                    currentOtpSent: 0,
                    currentFilesUsed: 0,
                    updatedAt: new Date(),
                },
            });

            // Update Wallet credits based on Plan
            await tx.wallet.update({
                where: { workspaceId: workspaceId },
                data: {
                    emailCredits: dbPlan.rollOverCredits ? { increment: dbPlan.emailCredits } : dbPlan.emailCredits,
                    smsCredits: dbPlan.rollOverCredits ? { increment: dbPlan.smsCredits } : dbPlan.smsCredits,
                    otpCredits: dbPlan.rollOverCredits ? { increment: dbPlan.otpCredits } : dbPlan.otpCredits,
                    storageCredits: dbPlan.rollOverCredits ? { increment: dbPlan.storageCredits } : dbPlan.storageCredits,
                }
            });

            // Create Alert
            await tx.workspaceAlert.create({
                data: {
                    id: dropid('alt'),
                    workspaceId,
                    title: "Subscription Activated",
                    message: `Your ${tier} plan is now active. Limits and credits have been updated.`,
                    type: "success"
                }
            });

            // Log Transaction
            const transaction = await tx.subscriptionTransaction.create({
                data: {
                    id: dropid('stxn'),
                    workspaceId,
                    subscriptionId: subscription.id,
                    type: SubscriptionTransactionType.SUBSCRIPTION_PAYMENT,
                    status: TransactionStatus.COMPLETED,
                    amount: verificationResult.data.amount / 100,
                    description: `Subscription payment for ${tier} plan`,
                    referenceId: transactionRef,
                    invoiceId: invoice.id,
                    metadata: { tier, planId: dbPlan.id }
                }
            });

            return { success: true, type: 'subscription', invoiceId: invoice.id, workspaceId };

        } else if (isTopUp) {
            // --- TOP-UP LOGIC ---
            console.log('💰 Processing Top-up Sync for:', workspaceId);

            // Fetch current subscription for transaction logging (REQUIRED field)
            const currentSub = await tx.workspaceSubscription.findUnique({
                where: { workspaceId }
            });

            if (!currentSub) {
                throw new Error(`Workspace subscription not found for top-up: ${workspaceId}`);
            }

            const walletFieldMap: Record<string, string> = {
                sms: "smsCredits",
                email: "emailCredits",
                otp: "otpCredits",
                storage: "storageCredits",
                api: "apiCredits"
            };

            const walletField = walletFieldMap[serviceType] || "balance";
            
            if (walletField === "balance") {
                await tx.wallet.update({
                    where: { workspaceId },
                    data: { balance: { increment: verificationResult.data.amount / 100 } }
                });
            } else {
                await tx.wallet.update({
                    where: { workspaceId },
                    data: { [walletField]: { increment: quantity || 0 } }
                });
            }

            // Create Alert
            await tx.workspaceAlert.create({
                data: {
                    id: dropid('alt'),
                    workspaceId,
                    title: "Top-up Successful",
                    message: walletField === "balance" 
                        ? `Successfully topped up your wallet balance.`
                        : `Successfully added ${quantity} ${serviceType} credits to your wallet.`,
                    type: "success"
                }
            });

            // Log Transaction
            await tx.subscriptionTransaction.create({
                data: {
                    id: dropid('stxn'),
                    workspaceId,
                    subscriptionId: currentSub.id,
                    type: SubscriptionTransactionType.TOPUP,
                    status: TransactionStatus.COMPLETED,
                    amount: verificationResult.data.amount / 100,
                    description: `Top-up for ${serviceType}`,
                    referenceId: transactionRef,
                    invoiceId: invoice.id,
                    metadata: { serviceType, quantity }
                }
            });

            return { success: true, type: 'topup', invoiceId: invoice.id, workspaceId };
        }

        return { success: true, type: 'unknown', invoiceId: invoice.id, workspaceId };
    });

    if (result.failed) {
        const failureUrl = new URL(`/dashboard/${workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
        failureUrl.searchParams.set('status', 'failed');
        return Response.redirect(failureUrl.toString());
    }

    // Redirect to success page
    const successUrl = new URL(`/dashboard/${workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
    successUrl.searchParams.set('status', 'success');
    successUrl.searchParams.set('reference', transactionRef);
    if (result.type) successUrl.searchParams.set('type', result.type);
    
    return Response.redirect(successUrl.toString());

  } catch (error: any) {
    console.error('🔴 [VERIFY_PAYMENT] Error:', error);
    
    // Attempt to extract workspaceId from error or params if possible for better redirect
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId') || '';
    const redirectPath = workspaceIdParam ? `/dashboard/${workspaceIdParam}/billing` : '/dashboard';
    
    const errorUrl = new URL(redirectPath, process.env.NEXT_PUBLIC_APP_URL);
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', error.message || 'Payment verification failed');
    return Response.redirect(errorUrl.toString());
  }
}


// Handle POST for webhook (Paystack can send webhooks)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-paystack-signature');

    console.log('🔵 [VERIFY_SUBSCRIPTION_WEBHOOK] Webhook received:', {
      event: body.event,
      data: body.data
    });

    // Handle different event types
    switch (body.event) {
      case 'charge.success':
        const { reference, metadata } = body.data;
        console.log('✅ Charge successful:', { reference, metadata });
        
        // You could trigger the verification here if needed
        break;

      case 'subscription.create':
        console.log('📋 Subscription created:', body.data);
        break;

      case 'subscription.disable':
        // Handle subscription cancellation
        const subscriptionData = body.data;
        
        // Find and update the subscription
        const updated = await db.workspaceSubscription.updateMany({
          where: { paymentRef: subscriptionData.subscription_code },
          data: { 
            status: 'CANCELED',
            cancelledAt: new Date()
          }
        });
        
        console.log('❌ Subscription disabled:', {
          subscription_code: subscriptionData.subscription_code,
          updated: updated.count
        });
        break;

      case 'subscription.expiring':
        // Notify user about expiring subscription
        console.log('⚠️ Subscription expiring:', {
          email: body.data.customer?.email,
          next_payment_date: body.data.next_payment_date
        });
        // TODO: Send notification email
        break;

      case 'subscription.renewal':
        // Handle subscription renewal
        const renewalData = body.data;
        console.log('🔄 Subscription renewal:', {
          subscription_code: renewalData.subscription_code,
          amount: renewalData.amount / 100,
          next_payment_date: renewalData.next_payment_date
        });
        
        // TODO: Create new invoice and transaction for renewal
        // This would be similar to the verification flow but for renewal
        break;
    }

    return ok({ message: 'Webhook received' });
  } catch (error) {
    console.error('[VERIFY_SUBSCRIPTION_WEBHOOK] Error:', error);
    return serverError();
  }
}






