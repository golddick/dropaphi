// app/api/webhooks/paystack/route.ts
import { NextRequest } from "next/server";
import crypto from 'crypto';
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { 
  InvoiceStatus, 
  SubscriptionStatus, 
  SubscriptionTier, 
  PlanSubscriptionStatus,
  Services 
} from "@/lib/generated/prisma";
import { NotificationService } from "@/lib/notification.service";

export async function POST(req: NextRequest) {
  const requestId = dropid('wh').substring(0, 10);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    console.log(`[Webhook:${requestId}] Received:`, { event: JSON.parse(body).event });

    // Verify signature
    if (!signature) {
      return new Response('No signature', { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error(`[Webhook:${requestId}] Invalid signature`);
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    
    // Process event based on type
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data, requestId);
        break;
      case 'subscription.create':
        await handleSubscriptionCreate(event.data, requestId);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data, requestId);
        break;
      case 'subscription.renewal':
        await handleSubscriptionRenewal(event.data, requestId);
        break;
      case 'subscription.cancel':
        await handleSubscriptionCancel(event.data, requestId);
        break;
      default:
        console.log(`[Webhook:${requestId}] Unhandled:`, event.event);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error(`[Webhook:${requestId}] Error:`, error);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
}

// ============================================================
// CHARGE SUCCESS HANDLER
// ============================================================
async function handleChargeSuccess(data: any, requestId: string) {
  const { reference, amount, metadata, customer, channel } = data;
  const amountNaira = amount / 100;

  console.log(`[Webhook:${requestId}] Charge success:`, {
    reference,
    amount: amountNaira,
    type: metadata?.type,
    workspaceId: metadata?.workspaceId
  });

  // Check for duplicate (idempotency)
  const existing = await db.subscriptionTransaction.findFirst({
    where: { referenceId: reference }
  });

  if (existing) {
    console.log(`[Webhook:${requestId}] Duplicate skipped`);
    return;
  }

  if (metadata?.type === 'top_up') {
    await handleTopUp(data, requestId);
  } else if (metadata?.type === 'subscription' || metadata?.isSubscription) {
    await handleSubscriptionPayment(data, requestId);
  }
}

// ============================================================
// TOP-UP HANDLER 
// ============================================================
async function handleTopUp(data: any, requestId: string) {
  const { reference, amount, metadata, channel, authorization } = data;
  const amountNaira = amount / 100;

  console.log(`[Webhook:${requestId}] Processing top-up:`, {
    reference,
    workspaceId: metadata.workspaceId,
    serviceType: metadata.serviceType,
    quantity: metadata.quantity,
    bonusCredits: metadata.bonusCredits,
    amount: amountNaira
  });

  // Convert string values to numbers
  const quantity = parseInt(metadata.quantity, 10);
  const bonusCredits = parseInt(metadata.bonusCredits || '0', 10);
  
  // Validate conversion
  if (isNaN(quantity) || isNaN(bonusCredits)) {
    throw new Error(`Invalid credit values: quantity=${metadata.quantity}, bonus=${metadata.bonusCredits}`);
  }
  
  const totalCredits = quantity + bonusCredits;

  await db.$transaction(async (tx) => {
    // 1. Update invoice
    const invoice = await tx.invoice.update({
      where: { id: metadata.invoiceId },
      data: {
        status: InvoiceStatus.PAID,
        paymentRef: reference,
        paidAt: new Date(),
        metadata: {
          ...metadata,
          paymentChannel: channel,
          cardLast4: authorization?.last4,
          paidAt: new Date().toISOString()
        }
      }
    });

    // 2. Get or create wallet
    let wallet = await tx.wallet.findUnique({
      where: { workspaceId: metadata.workspaceId }
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          id: dropid('wlt'),
          workspaceId: metadata.workspaceId,
          balance: 0,
          emailCredits: 0,
          smsCredits: 0,
          otpCredits: 0,
          blogCredits: 0,
          pushCredits: 0,
          aiCredits: 0,
          storageCredits: 0,
        }
      });
    }

    // 3. Add credits to the specific wallet field (now using number)
    const updateData: any = {};
    updateData[metadata.walletField] = { increment: totalCredits };

    await tx.wallet.update({
      where: { workspaceId: metadata.workspaceId },
      data: updateData
    });

    // 4. Create transaction record
    await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: metadata.workspaceId,
        subscriptionId: '',
        type: 'TOPUP',
        status: 'COMPLETED',
        amount: amountNaira,
        description: `Added ${totalCredits} ${metadata.serviceType} credits (${quantity} purchased + ${bonusCredits} bonus)`,
        referenceId: reference,
        invoiceId: invoice.id,
        metadata: {
          serviceType: metadata.serviceType,
          quantity: quantity,
          bonusCredits: bonusCredits,
          totalCredits,
          paymentChannel: channel,
          amountPaid: amountNaira
        }
      }
    });

    // Rest of your code remains the same...
    // 5. Update promo code usage if applicable
    if (metadata.promoCode && invoice.promoCodeId) {
      await tx.promoCode.update({
        where: { id: invoice.promoCodeId },
        data: { usedCount: { increment: 1 } }
      });

      await tx.promoRedemption.create({
        data: {
          id: dropid('red'),
          promoCodeId: invoice.promoCodeId,
          workspaceId: metadata.workspaceId,
          invoiceId: invoice.id,
          discountAmount: invoice.discount?.toNumber() || 0,
        }
      });
    }

    // 6. Create success alert
    await tx.workspaceAlert.create({
      data: {
        id: dropid('alt'),
        workspaceId: metadata.workspaceId,
        title: "Top-up Successful",
        message: bonusCredits 
          ? `Successfully added ${quantity.toLocaleString()} ${metadata.serviceType} credits + ${bonusCredits} bonus credits!`
          : `Successfully added ${quantity.toLocaleString()} ${metadata.serviceType} credits.`,
        type: "success"
      }
    });

    // 7. Send notification to user
    const member = await tx.workspaceMember.findFirst({
      where: { workspaceId: metadata.workspaceId, userId: metadata.userId },
      include: { user: true }
    });

    if (member) {
      await NotificationService.create({
        userId: member.user.id,
        type: 'CREDITS_ADDED',
        variables: {
          amount: totalCredits.toLocaleString(),
          type: metadata.serviceType,
          bonus: bonusCredits ? ` + ${bonusCredits} bonus` : ''
        },
        metadata: { 
          serviceType: metadata.serviceType, 
          quantity: quantity,
          bonusCredits: bonusCredits,
          totalCredits 
        },
        actionUrl: `/dashboard/${metadata.workspaceId}/billing`
      });
    }

    console.log(`[Webhook:${requestId}] Top-up completed:`, {
      workspaceId: metadata.workspaceId,
      serviceType: metadata.serviceType,
      quantity: quantity,
      bonusCredits: bonusCredits,
      totalCredits,
      amount: amountNaira
    });
  });
}

async function handleSubscriptionPayment(data: any, requestId: string) {
  const { reference, amount, metadata, customer, channel, authorization } = data;
  const amountNaira = amount / 100;

  await db.$transaction(async (tx) => {
    // 1. Get plan from database
    const plan = await tx.plan.findFirst({
      where: { tier: metadata.tier, isActive: true, isArchived: false }
    });

    if (!plan) {
      throw new Error(`Plan ${metadata.tier} not found in database`);
    }

    // 2. Update or create invoice
    let invoice = await tx.invoice.findUnique({
      where: { id: metadata.invoiceId }
    });

    if (!invoice) {
      invoice = await tx.invoice.create({
        data: {
          id: dropid('inv'),
          workspaceId: metadata.workspaceId,
          invoiceNumber: `INV-${Date.now()}`,
          amount: amountNaira,
          finalAmount: amountNaira,
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
          paymentRef: reference,
          description: `${plan.tier} plan subscription`,
          billingEmail: customer?.email
        }
      });
    } else {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
          paymentRef: reference
        }
      });
    }

    // 3. Update or create workspace subscription
    const subscription = await tx.workspaceSubscription.upsert({
      where: { workspaceId: metadata.workspaceId },
      update: {
        tier: plan.tier,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: plan.price,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: reference,
        updatedAt: new Date()
      },
      create: {
        id: dropid('sub'),
        workspaceId: metadata.workspaceId,
        tier: plan.tier,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: plan.price,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: reference
      }
    });

    // 4. Update workspace with plan limits
    await tx.workspace.update({
      where: { id: metadata.workspaceId },
      data: {
        plan: plan.tier,
        planSubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
        subscriberLimit: plan.subscriberLimit,
        emailLimit: plan.emailLimit,
        smsLimit: plan.smsLimit,
        otpLimit: plan.otpLimit,
        blogLimit: plan.blogLimit,
        pushLimit: plan.pushLimit,
        aiLimit: plan.aiLimit,
        storageLimit: Math.floor(plan.storageLimit),
        updatedAt: new Date()
      }
    });

    // 5. Update wallet with plan credits (if plan has any)
    const wallet = await tx.wallet.findUnique({
      where: { workspaceId: metadata.workspaceId }
    });

    if (wallet && plan.features) {
      const features = plan.features as any;
      await tx.wallet.update({
        where: { workspaceId: metadata.workspaceId },
        data: {
          emailCredits: { increment: features.emailCredits || 0 },
          smsCredits: { increment: features.smsCredits || 0 },
          otpCredits: { increment: features.otpCredits || 0 }
        }
      });
    }

    // 6. Create monthly usage records for all services
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
            workspaceId: metadata.workspaceId,
            service,
            month
          }
        },
        update: {
          subscriberLimit: plan.subscriberLimit,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit,
          storageLimit: Math.floor(plan.storageLimit),
          blogLimit: plan.blogLimit,
          pushLimit: plan.pushLimit,
          aiLimit: plan.aiLimit,
          updatedAt: new Date()
        },
        create: {
          id: dropid('mus'),
          workspaceId: metadata.workspaceId,
          service,
          month,
          subscriberLimit: plan.subscriberLimit,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit,
          storageLimit: Math.floor(plan.storageLimit),
          blogLimit: plan.blogLimit,
          pushLimit: plan.pushLimit,
          aiLimit: plan.aiLimit,
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

    // 7. Create transaction record
    await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: metadata.workspaceId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION_PAYMENT',
        status: 'COMPLETED',
        amount: amountNaira,
        description: `${plan.tier} plan subscription payment`,
        referenceId: reference,
        invoiceId: invoice.id,
        metadata: {
          tier: plan.tier,
          limits: {
            subscribers: plan.subscriberLimit,
            email: plan.emailLimit,
            sms: plan.smsLimit,
            otp: plan.otpLimit,
            storage: plan.storageLimit
          }
        }
      }
    });

    // 8. Send notification to owner
    const owner = await tx.workspaceMember.findFirst({
      where: { workspaceId: metadata.workspaceId, role: 'OWNER' },
      include: { user: true }
    });

    if (owner) {
      await NotificationService.create({
        userId: owner.user.id,
        type: 'PAYMENT_SUCCESS',
        variables: {
          amount: amountNaira.toLocaleString(),
          plan: plan.tier,
          limits: `Subscribers: ${plan.subscriberLimit}, Email: ${plan.emailLimit}, SMS: ${plan.smsLimit}`
        },
        metadata: { subscriptionId: subscription.id, plan: plan.tier },
        actionUrl: `/dashboard/${metadata.workspaceId}/billing`
      });
    }

    console.log(`[Webhook:${requestId}] Subscription payment processed:`, {
      workspaceId: metadata.workspaceId,
      tier: plan.tier,
      limits: {
        subscribers: plan.subscriberLimit,
        email: plan.emailLimit,
        sms: plan.smsLimit
      }
    });
  });
}

// ============================================================
// SUBSCRIPTION CREATE HANDLER
// ============================================================
async function handleSubscriptionCreate(data: any, requestId: string) {
  const { customer, plan: planData, subscription_code, amount } = data;
  const amountNaira = (amount || planData.amount) / 100;
  const tier = mapPlanCodeToTier(planData.plan_code);

  // Find workspace by user email
  const member = await db.workspaceMember.findFirst({
    where: { user: { email: customer.email }, role: 'OWNER' },
    include: { workspace: true, user: true }
  });

  if (!member) {
    console.log(`[Webhook:${requestId}] Workspace not found for:`, customer.email);
    return;
  }

  await db.$transaction(async (tx) => {
    // Get plan from database
    const plan = await tx.plan.findFirst({
      where: { tier, isActive: true, isArchived: false }
    });

    if (!plan) {
      throw new Error(`Plan ${tier} not found in database`);
    }

    // Create subscription
    const subscription = await tx.workspaceSubscription.create({
      data: {
        id: dropid('sub'),
        workspaceId: member.workspaceId,
        tier: plan.tier,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: plan.price,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: subscription_code
      }
    });

    // Update workspace with plan limits
    await tx.workspace.update({
      where: { id: member.workspaceId },
      data: {
        plan: plan.tier,
        planSubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
        subscriberLimit: plan.subscriberLimit,
        emailLimit: plan.emailLimit,
        smsLimit: plan.smsLimit,
        otpLimit: plan.otpLimit,
        blogLimit: plan.blogLimit,
        pushLimit: plan.pushLimit,
        aiLimit: plan.aiLimit,
        storageLimit: Math.floor(plan.storageLimit)
      }
    });

    // Create monthly usage records
    const month = new Date().toISOString().slice(0, 7);
    const services = [Services.SUBSCRIBERS, Services.EMAIL, Services.SMS, Services.OTP, Services.STORAGE, Services.BLOG, Services.PUSH, Services.AI];

    for (const service of services) {
      await tx.monthlyUsage.upsert({
        where: { workspaceId_service_month: { workspaceId: member.workspaceId, service, month } },
        update: {
          subscriberLimit: plan.subscriberLimit,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit,
          storageLimit: Math.floor(plan.storageLimit),
          blogLimit: plan.blogLimit,
          pushLimit: plan.pushLimit,
          aiLimit: plan.aiLimit
        },
        create: {
          id: dropid('mus'),
          workspaceId: member.workspaceId,
          service,
          month,
          subscriberLimit: plan.subscriberLimit,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit,
          storageLimit: Math.floor(plan.storageLimit),
          blogLimit: plan.blogLimit,
          pushLimit: plan.pushLimit,
          aiLimit: plan.aiLimit,
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

    // Send notification
    await NotificationService.create({
      userId: member.user.id,
      type: 'SUBSCRIPTION_CREATED',
      variables: { plan: plan.tier, workspace: member.workspace.name },
      metadata: { subscriptionId: subscription.id, limits: { subscribers: plan.subscriberLimit, email: plan.emailLimit } },
      actionUrl: `/dashboard/${member.workspaceId}/billing`
    });
  });

  console.log(`[Webhook:${requestId}] Subscription created:`, { email: customer.email, tier });
}

// ============================================================
// SUBSCRIPTION RENEWAL HANDLER
// ============================================================
async function handleSubscriptionRenewal(data: any, requestId: string) {
  const { customer, subscription_code, amount, next_payment_date } = data;
  const amountNaira = amount / 100;

  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscription_code },
    include: { workspace: true }
  });

  if (!subscription) {
    console.log(`[Webhook:${requestId}] Subscription not found:`, subscription_code);
    return;
  }

  await db.$transaction(async (tx) => {
    // Get plan from database
    const plan = await tx.plan.findFirst({
      where: { tier: subscription.tier, isActive: true }
    });

    if (!plan) {
      throw new Error(`Plan ${subscription.tier} not found`);
    }

    // Update subscription period
    await tx.workspaceSubscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: new Date(next_payment_date),
        status: SubscriptionStatus.ACTIVE,
        updatedAt: new Date()
      }
    });

    // Ensure workspace is active
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: { planSubscriptionStatus: PlanSubscriptionStatus.ACTIVE }
    });

    // Update monthly usage for new period
    const month = new Date().toISOString().slice(0, 7);
    const services = [Services.EMAIL, Services.SMS, Services.OTP];

    for (const service of services) {
      await tx.monthlyUsage.upsert({
        where: { workspaceId_service_month: { workspaceId: subscription.workspaceId, service, month } },
        update: {
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit
        },
        create: {
          id: dropid('mus'),
          workspaceId: subscription.workspaceId,
          service,
          month,
          subscriberLimit: plan.subscriberLimit,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          otpLimit: plan.otpLimit,
          storageLimit: Math.floor(plan.storageLimit),
          blogLimit: plan.blogLimit,
          pushLimit: plan.pushLimit,
          aiLimit: plan.aiLimit,
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

    // Create renewal transaction
    await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: subscription.workspaceId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION_RENEWAL',
        status: 'COMPLETED',
        amount: amountNaira,
        description: `${subscription.tier} plan renewal`,
        referenceId: subscription_code,
        metadata: { tier: subscription.tier, amount: amountNaira }
      }
    });
  });

  console.log(`[Webhook:${requestId}] Subscription renewed:`, { subscription_code, amount: amountNaira });
}

// ============================================================
// SUBSCRIPTION DISABLE/CANCEL HANDLER
// ============================================================
async function handleSubscriptionDisable(data: any, requestId: string) {
  const { subscription_code } = data;
  await downgradeToFreePlan(subscription_code, requestId, 'disable');
}

async function handleSubscriptionCancel(data: any, requestId: string) {
  const { subscription_code } = data;
  await downgradeToFreePlan(subscription_code, requestId, 'cancel');
}

async function downgradeToFreePlan(subscriptionCode: string, requestId: string, event: string) {
  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscriptionCode },
    include: { workspace: true }
  });

  if (!subscription) {
    console.log(`[Webhook:${requestId}] Subscription not found:`, subscriptionCode);
    return;
  }

  await db.$transaction(async (tx) => {
    // Get FREE plan from database
    const freePlan = await tx.plan.findFirst({
      where: { tier: SubscriptionTier.FREE, isActive: true, isArchived: false }
    });

    if (!freePlan) {
      throw new Error('FREE plan not found in database');
    }

    // Update subscription status
    await tx.workspaceSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelledAt: new Date()
      }
    });

    // Downgrade workspace to FREE plan limits
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: {
        plan: SubscriptionTier.FREE,
        planSubscriptionStatus: PlanSubscriptionStatus.INACTIVE,
        subscriberLimit: freePlan.subscriberLimit,
        emailLimit: freePlan.emailLimit,
        smsLimit: freePlan.smsLimit,
        otpLimit: freePlan.otpLimit,
        blogLimit: freePlan.blogLimit,
        pushLimit: freePlan.pushLimit,
        aiLimit: freePlan.aiLimit,
        storageLimit: Math.floor(freePlan.storageLimit),
        updatedAt: new Date()
      }
    });

    // Update monthly usage records with FREE limits
    const month = new Date().toISOString().slice(0, 7);
    const services = [Services.SUBSCRIBERS, Services.EMAIL, Services.SMS, Services.OTP, Services.STORAGE, Services.BLOG, Services.PUSH, Services.AI];

    for (const service of services) {
      await tx.monthlyUsage.upsert({
        where: { workspaceId_service_month: { workspaceId: subscription.workspaceId, service, month } },
        update: {
          subscriberLimit: freePlan.subscriberLimit,
          emailLimit: freePlan.emailLimit,
          smsLimit: freePlan.smsLimit,
          otpLimit: freePlan.otpLimit,
          storageLimit: Math.floor(freePlan.storageLimit),
          blogLimit: freePlan.blogLimit,
          pushLimit: freePlan.pushLimit,
          aiLimit: freePlan.aiLimit
        },
        create: {
          id: dropid('mus'),
          workspaceId: subscription.workspaceId,
          service,
          month,
          subscriberLimit: freePlan.subscriberLimit,
          emailLimit: freePlan.emailLimit,
          smsLimit: freePlan.smsLimit,
          otpLimit: freePlan.otpLimit,
          storageLimit: Math.floor(freePlan.storageLimit),
          blogLimit: freePlan.blogLimit,
          pushLimit: freePlan.pushLimit,
          aiLimit: freePlan.aiLimit,
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

    // Send notification to owner
    const owner = await tx.workspaceMember.findFirst({
      where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
      include: { user: true }
    });

    if (owner) {
      await NotificationService.create({
        userId: owner.user.id,
        type: 'SUBSCRIPTION_CANCELLED',
        variables: {
          plan: subscription.tier,
          newPlan: 'FREE',
          limits: `Subscribers: ${freePlan.subscriberLimit}, Email: ${freePlan.emailLimit}`
        },
        metadata: { oldTier: subscription.tier, newTier: SubscriptionTier.FREE },
        actionUrl: `/dashboard/${subscription.workspaceId}/billing`
      });
    }
  });

  console.log(`[Webhook:${requestId}] Workspace downgraded to FREE:`, {
    subscription: subscriptionCode,
    event
  });
}

// ============================================================
// HELPER: Map Paystack plan code to SubscriptionTier
// ============================================================
function mapPlanCodeToTier(planCode: string): SubscriptionTier {
  const upperCode = planCode.toUpperCase();
  
  if (upperCode.includes('STARTER')) return SubscriptionTier.STARTER;
  if (upperCode.includes('PROFESSIONAL')) return SubscriptionTier.PROFESSIONAL;
  if (upperCode.includes('BUSINESS')) return SubscriptionTier.BUSINESS;
  
  return SubscriptionTier.FREE;
}

