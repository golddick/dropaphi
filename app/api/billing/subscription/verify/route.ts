// app/api/payment/verify/route.ts
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
  TransactionStatus,
  Services
} from "@/lib/generated/prisma";
import { NotificationService } from "@/lib/notification.service";
import crypto from 'crypto'; 

// Helper function to safely parse numeric values from metadata
function parseNumericValue(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    console.log('🔵 [VERIFY_PAYMENT] Callback received:', { reference, trxref });

    const transactionRef = reference || trxref;
    
    if (!transactionRef) {
      console.log('🔴 [VERIFY_PAYMENT] No reference provided');
      return err('No transaction reference provided', 400);
    }

    // Check if already processed by webhook (idempotency check)
    const existingTransaction = await db.subscriptionTransaction.findFirst({
      where: { referenceId: transactionRef }
    });

    if (existingTransaction) {
      console.log('ℹ️ [VERIFY_PAYMENT] Transaction already processed by webhook:', transactionRef);
      
      // Get workspaceId from existing transaction
      const successUrl = new URL(`/dashboard/${existingTransaction.workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
      successUrl.searchParams.set('status', 'success');
      successUrl.searchParams.set('reference', transactionRef);
      successUrl.searchParams.set('already_processed', 'true');
      return Response.redirect(successUrl.toString());
    }

    // Wait a moment to see if webhook is just delayed
    console.log('⏳ [VERIFY_PAYMENT] Waiting for potential webhook processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check again after delay
    const retryCheck = await db.subscriptionTransaction.findFirst({
      where: { referenceId: transactionRef }
    });

    if (retryCheck) {
      console.log('ℹ️ [VERIFY_PAYMENT] Webhook processed during delay:', transactionRef);
      const successUrl = new URL(`/dashboard/${retryCheck.workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
      successUrl.searchParams.set('status', 'success');
      successUrl.searchParams.set('reference', transactionRef);
      successUrl.searchParams.set('already_processed', 'true');
      return Response.redirect(successUrl.toString());
    }

    // Verify the transaction with Paystack (webhook hasn't processed yet)
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
      type,
      tier, 
      serviceType,
      quantity,
      walletField,
      bonusCredits,
      promoCode, 
      discount, 
      originalAmount, 
      userId,
      usageRate
    } = metadata;

    if (!workspaceId || !invoiceId) {
      console.log('🔴 [VERIFY_PAYMENT] Missing critical metadata:', { workspaceId, invoiceId });
      return err('Invalid transaction metadata', 400);
    }

    // Start transaction
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
        return { alreadyProcessed: true, invoice: currentInvoice };
      }

      // 2. Check if Paystack says it failed
      if (verificationResult.data.status !== 'success') {
        console.log('🔴 [VERIFY_PAYMENT] Transaction not successful:', verificationResult.data.status);
        
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: InvoiceStatus.FAILED }
        });

        return { failed: true, workspaceId };
      }

      // 3. Get workspace and wallet
      const workspace = await tx.workspace.findUnique({
        where: { id: workspaceId },
        include: { wallet: true, subscription: true }
      });

      if (!workspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // 4. Update Invoice to PAID
      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
          paymentRef: transactionRef,
          metadata: {
            ...metadata,
            paystackResponse: verificationResult.data,
            verifiedAt: new Date().toISOString(),
          },
        },
      });

      // 5. Process based on type
      const isSubscription = type === 'subscription' || type === 'subscription_payment' || !!tier;
      const isTopUp = type === 'top_up';

      if (isSubscription) {
        // ============================================================
        // SUBSCRIPTION PAYMENT
        // ============================================================
        console.log('💎 Processing Subscription for:', workspaceId);

        // Get plan from database
        const dbPlan = await tx.plan.findFirst({
          where: { tier: tier as SubscriptionTier, isActive: true, isArchived: false },
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
            monthlyPrice: originalAmount ? Number(originalAmount) : Number(dbPlan.price),
            paymentRef: transactionRef,
            updatedAt: new Date(),
          },
          create: {
            id: dropid('sub'),
            workspaceId: workspaceId,
            tier: tier as SubscriptionTier,
            planId: dbPlan.id,
            status: SubscriptionStatus.ACTIVE,
            monthlyPrice: originalAmount ? Number(originalAmount) : Number(dbPlan.price),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paymentRef: transactionRef,
          },
        });

        // Update workspace with plan limits
        await tx.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: tier as SubscriptionTier,
            planSubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
            subscriberLimit: dbPlan.subscriberLimit,
            emailLimit: dbPlan.emailLimit,
            smsLimit: dbPlan.smsLimit,
            otpLimit: dbPlan.otpLimit,
            blogLimit: dbPlan.blogLimit,
            pushLimit: dbPlan.pushLimit,
            aiLimit: dbPlan.aiLimit,
            storageLimit: Math.floor(dbPlan.storageLimit),
            updatedAt: new Date(),
          },
        });

        // Update or create monthly usage records for all services
        const month = new Date().toISOString().slice(0, 7);
        const services = [
          Services.SUBSCRIBERS, Services.EMAIL, Services.SMS, 
          Services.OTP, Services.STORAGE, Services.BLOG, 
          Services.PUSH, Services.AI
        ];

        for (const service of services) {
          await tx.monthlyUsage.upsert({
            where: {
              workspaceId_service_month: {
                workspaceId: workspaceId,
                service,
                month
              }
            },
            update: {
              subscriberLimit: dbPlan.subscriberLimit,
              emailLimit: dbPlan.emailLimit,
              smsLimit: dbPlan.smsLimit,
              otpLimit: dbPlan.otpLimit,
              storageLimit: Math.floor(dbPlan.storageLimit),
              blogLimit: dbPlan.blogLimit,
              pushLimit: dbPlan.pushLimit,
              aiLimit: dbPlan.aiLimit,
              updatedAt: new Date()
            },
            create: {
              id: dropid('mus'),
              workspaceId: workspaceId,
              service,
              month,
              subscriberLimit: dbPlan.subscriberLimit,
              emailLimit: dbPlan.emailLimit,
              smsLimit: dbPlan.smsLimit,
              otpLimit: dbPlan.otpLimit,
              storageLimit: Math.floor(dbPlan.storageLimit),
              blogLimit: dbPlan.blogLimit,
              pushLimit: dbPlan.pushLimit,
              aiLimit: dbPlan.aiLimit,
              unitsUsed: 0,
              currentSubscribers: 0,
              currentEmailsSent: 0,
              currentStorageUsed: 0,
              currentSmsSent: 0,
              currentOtpSent: 0,
              currentAiCalls: 0,
              currentBlogsCount: 0,
              currentPushSent: 0,
              topUpUnitsUsed: 0,
              topUpCost: 0
            }
          });
        }

        // Update wallet with plan credits if any
        if (workspace.wallet && dbPlan.features) {
          const features = dbPlan.features as any;
          await tx.wallet.update({
            where: { workspaceId: workspaceId },
            data: {
              emailCredits: { increment: features.emailCredits || 0 },
              smsCredits: { increment: features.smsCredits || 0 },
              otpCredits: { increment: features.otpCredits || 0 }
            }
          });
        }

        // Create alert
        await tx.workspaceAlert.create({
          data: {
            id: dropid('alt'),
            workspaceId,
            title: "Subscription Activated",
            message: `Your ${tier} plan is now active. Limits have been updated.`,
            type: "success"
          }
        });

        // Create transaction record
        await tx.subscriptionTransaction.create({
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

        // Send notification to owner
        const owner = await tx.workspaceMember.findFirst({
          where: { workspaceId, role: 'OWNER' },
          include: { user: true }
        });

        if (owner) {
          await NotificationService.create({
            userId: owner.user.id,
            type: 'PAYMENT_SUCCESS',
            variables: {
              amount: (verificationResult.data.amount / 100).toLocaleString(),
              plan: tier,
              limits: `Subscribers: ${dbPlan.subscriberLimit}, Email: ${dbPlan.emailLimit}, SMS: ${dbPlan.smsLimit}`
            },
            metadata: { subscriptionId: subscription.id, plan: tier },
            actionUrl: `/dashboard/${workspaceId}/billing`
          });
        }

        return { success: true, type: 'subscription', invoiceId: invoice.id, workspaceId };

      } else if (isTopUp) {
        // ============================================================
        // TOP-UP PAYMENT - FIXED VERSION
        // ============================================================
        console.log('💰 Processing Top-up for:', workspaceId, { 
          serviceType, 
          quantity, 
          bonusCredits, 
          walletField 
        });

        if (!workspace.wallet) {
          throw new Error(`Wallet not found for workspace: ${workspaceId}`);
        }

        // FIX: Convert string values to numbers safely
        const quantityNum = parseNumericValue(quantity, 0);
        const bonusCreditsNum = parseNumericValue(bonusCredits, 0);
        const usageRateNum = parseNumericValue(usageRate, 1);
        
        // Validate conversion
        if (isNaN(quantityNum) || isNaN(bonusCreditsNum)) {
          throw new Error(`Invalid credit values: quantity=${quantity}, bonusCredits=${bonusCredits}`);
        }
        
        const totalCredits = quantityNum + bonusCreditsNum;
        
        console.log('💰 [VERIFY_PAYMENT] Credit calculation:', {
          quantity: quantityNum,
          bonusCredits: bonusCreditsNum,
          totalCredits
        });
        
        // Update wallet with service-specific credits
        if (walletField && walletField !== 'balance') {
          await tx.wallet.update({
            where: { workspaceId },
            data: {
              [walletField]: { increment: totalCredits }
            }
          });
        } else {
          // Fallback to balance if no specific field
          const amountNaira = verificationResult.data.amount / 100;
          await tx.wallet.update({
            where: { workspaceId },
            data: {
              balance: { increment: amountNaira }
            }
          });
        }

        // Create alert
        await tx.workspaceAlert.create({
          data: {
            id: dropid('alt'),
            workspaceId,
            title: "Top-up Successful",
            message: bonusCreditsNum 
              ? `Successfully added ${quantityNum.toLocaleString()} ${serviceType} credits + ${bonusCreditsNum} bonus credits!`
              : `Successfully added ${quantityNum.toLocaleString()} ${serviceType} credits.`,
            type: "success"
          }
        });

        // Create transaction record
        const currentSub = await tx.workspaceSubscription.findUnique({
          where: { workspaceId }
        });

        await tx.subscriptionTransaction.create({
          data: {
            id: dropid('stxn'),
            workspaceId,
            subscriptionId: currentSub?.id || '',
            type: SubscriptionTransactionType.TOPUP,
            status: TransactionStatus.COMPLETED,
            amount: verificationResult.data.amount / 100,
            description: `Top-up: ${totalCredits} ${serviceType} credits`,
            referenceId: transactionRef,
            invoiceId: invoice.id,
            metadata: { 
              serviceType, 
              quantity: quantityNum,
              bonusCredits: bonusCreditsNum,
              totalCredits,
              usageRate: usageRateNum
            }
          }
        });

        // Send notification
        const member = await tx.workspaceMember.findFirst({
          where: { workspaceId, userId: userId },
          include: { user: true }
        });

        if (member) {
          await NotificationService.create({
            userId: member.user.id,
            type: 'CREDITS_ADDED',
            variables: {
              amount: totalCredits.toLocaleString(),
              type: serviceType,
              bonus: bonusCreditsNum ? ` + ${bonusCreditsNum} bonus` : ''
            },
            metadata: { 
              serviceType, 
              quantity: quantityNum, 
              bonusCredits: bonusCreditsNum, 
              totalCredits 
            },
            actionUrl: `/dashboard/${workspaceId}/billing/wallet`
          });
        }

        // Update promo code usage if applicable
        if (promoCode && invoice.promoCodeId) {
          await tx.promoCode.update({
            where: { id: invoice.promoCodeId },
            data: { usedCount: { increment: 1 } }
          });

          await tx.promoRedemption.create({
            data: {
              id: dropid('red'),
              promoCodeId: invoice.promoCodeId,
              workspaceId,
              invoiceId: invoice.id,
              discountAmount: parseNumericValue(discount, 0),
            }
          });
        }

        console.log('✅ [VERIFY_PAYMENT] Top-up completed:', {
          workspaceId,
          serviceType,
          quantity: quantityNum,
          bonusCredits: bonusCreditsNum,
          totalCredits,
          amount: verificationResult.data.amount / 100
        });

        return { success: true, type: 'topup', invoiceId: invoice.id, workspaceId };
      }

      return { success: true, type: 'unknown', invoiceId: invoice.id, workspaceId };
    });

    if (result.failed) {
      const failureUrl = new URL(`/dashboard/${result.workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
      failureUrl.searchParams.set('status', 'failed');
      return Response.redirect(failureUrl.toString());
    }

    if (result.alreadyProcessed) {
      const successUrl = new URL(`/dashboard/${workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
      successUrl.searchParams.set('status', 'already_processed');
      successUrl.searchParams.set('reference', transactionRef);
      return Response.redirect(successUrl.toString());
    }

    // Redirect to success page
    const successUrl = new URL(`/dashboard/${result.workspaceId}/billing`, process.env.NEXT_PUBLIC_APP_URL);
    successUrl.searchParams.set('status', 'success');
    successUrl.searchParams.set('reference', transactionRef);
    if (result.type) successUrl.searchParams.set('type', result.type);
    
    return Response.redirect(successUrl.toString());

  } catch (error: any) {
    console.error('🔴 [VERIFY_PAYMENT] Error:', error);
    
    const workspaceId = req.nextUrl.searchParams.get('workspaceId') || '';
    const redirectPath = workspaceId ? `/dashboard/${workspaceId}/billing` : '/dashboard';
    
    const errorUrl = new URL(redirectPath, process.env.NEXT_PUBLIC_APP_URL);
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', error.message || 'Payment verification failed');
    return Response.redirect(errorUrl.toString());
  }
}

// POST handler for webhook fallback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-paystack-signature');

    console.log('🔵 [PAYMENT_WEBHOOK] Received:', { event: body.event });

    // Verify signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      console.error('🔴 [PAYMENT_WEBHOOK] Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    switch (body.event) {
      case 'charge.success':
        console.log('✅ Webhook charge.success:', body.data.reference);
        // Optionally trigger verification here
        break;

      case 'subscription.disable':
      case 'subscription.cancel':
        const subscriptionCode = body.data.subscription_code;
        await db.workspaceSubscription.updateMany({
          where: { paymentRef: subscriptionCode },
          data: { 
            status: SubscriptionStatus.CANCELED,
            cancelledAt: new Date()
          }
        });
        console.log('❌ Subscription cancelled:', subscriptionCode);
        break;

      case 'subscription.renewal':
        console.log('🔄 Subscription renewal:', body.data);
        // Handle renewal logic here
        break;
    }

    return ok({ message: 'Webhook processed' });
  } catch (error) {
    console.error('[PAYMENT_WEBHOOK] Error:', error);
    return serverError();
  }
}