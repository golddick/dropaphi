// // app/api/billing/webhook/route.ts
// import { NextRequest } from "next/server";
// import crypto from 'crypto';
// import { db } from "@/lib/db";
// import { dropid } from "dropid";
// import { InvoiceStatus, SubscriptionStatus, SubscriptionTier } from "@/lib/generated/prisma/enums";
// import { NotificationService } from "@/lib/notification.service";

// // Webhook secret for additional security (optional but recommended)
// const WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

// export async function POST(req: NextRequest) {
//   const requestId = dropid('webhook').substring(0, 10);
  
//   try {
//     // Get raw body for signature verification
//     const body = await req.text();
//     const signature = req.headers.get('x-paystack-signature');
    
//     console.log(`[Webhook:${requestId}] Received webhook`, {
//       signature: signature ? 'present' : 'missing',
//       bodyLength: body.length,
//       contentType: req.headers.get('content-type'),
//     });

//     // Verify webhook signature
//     if (!signature) {
//       console.error(`[Webhook:${requestId}] No signature provided`);
//       return new Response('No signature provided', { status: 401 });
//     }

//     // Verify signature with Paystack secret
//     const hash = crypto
//       .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
//       .update(body)
//       .digest('hex');

//     if (hash !== signature) {
//       console.error(`[Webhook:${requestId}] Invalid signature`, {
//         expected: hash.substring(0, 10) + '...',
//         received: signature.substring(0, 10) + '...',
//       });
//       return new Response('Invalid signature', { status: 401 });
//     }

//     // Parse event
//     const event = JSON.parse(body);
    
//     console.log(`[Webhook:${requestId}] Processing event:`, {
//       event: event.event,
//       id: event.id || 'no-id',
//       createdAt: event.createdAt,
//     });

//     // Process event based on type
//     let result;
//     switch (event.event) {
//       case 'charge.success':
//         result = await handleSuccessfulCharge(event.data, requestId);
//         break;
      
//       case 'subscription.create':
//         result = await handleSubscriptionCreate(event.data, requestId);
//         break;
      
//       case 'subscription.disable':
//         result = await handleSubscriptionDisable(event.data, requestId);
//         break;
      
//       case 'subscription.expiring_cards':
//         result = await handleExpiringCard(event.data, requestId);
//         break;
      
//       case 'subscription.renewal':
//         result = await handleSubscriptionRenewal(event.data, requestId);
//         break;
      
//       case 'subscription.cancel':
//         result = await handleSubscriptionCancel(event.data, requestId);
//         break;
      
//       case 'subscription.expiring':
//         result = await handleSubscriptionExpiring(event.data, requestId);
//         break;
      
//       case 'transfer.success':
//       case 'transfer.failed':
//       case 'transfer.reversed':
//         result = await handleTransfer(event.data, requestId);
//         break;
      
//       default:
//         console.log(`[Webhook:${requestId}] Unhandled event type:`, event.event);
//         return new Response('Event received but unhandled', { status: 200 });
//     }

//     console.log(`[Webhook:${requestId}] Event processed successfully:`, result);
    
//     return new Response(JSON.stringify({ 
//       received: true,
//       event: event.event,
//       processed: true,
//       requestId
//     }), { 
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });

//   } catch (error) {
//     console.error(`[Webhook:${requestId}] Error:`, {
//       error: error instanceof Error ? error.message : 'Unknown error',
//       stack: error instanceof Error ? error.stack : undefined,
//     });

//     // Always return 200 to prevent Paystack from retrying
//     return new Response(JSON.stringify({ 
//       received: true,
//       error: 'Webhook processing failed but acknowledged',
//       requestId
//     }), { 
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
// }

// async function handleSuccessfulCharge(data: any, requestId: string) {
//   const { reference, amount, metadata, customer, authorization, channel } = data;

//   console.log(`[Webhook:${requestId}] Processing charge.success:`, {
//     reference,
//     amount: amount / 100,
//     customer: customer?.email,
//     type: metadata?.type,
//   });

//   // Check if this webhook was already processed (idempotency)
//   const existingTransaction = await db.subscriptionTransaction.findFirst({
//     where: { referenceId: reference },
//   });

//   if (existingTransaction) {
//     console.log(`[Webhook:${requestId}] Transaction already processed:`, reference);
//     return { processed: false, reason: 'duplicate' };
//   }

//   // Handle subscription payments
//   if (metadata?.type === 'subscription_payment' || metadata?.isSubscription) {
//     return handleSubscriptionPayment(data, requestId);
//   }

//   return { processed: false, reason: 'unknown_type' };
// }

// async function handleSubscriptionPayment(data: any, requestId: string) {
//   const { metadata, reference, amount, customer, authorization, channel } = data;

//   console.log(`[Webhook:${requestId}] Processing subscription payment:`, {
//     workspaceId: metadata?.workspaceId,
//     tier: metadata?.tier,
//     amount: amount / 100,
//     discount: metadata?.discount,
//   });

//   return await db.$transaction(async (tx) => {
//     // Update invoice
//     const invoice = await tx.invoice.update({
//       where: { id: metadata.invoiceId },
//       data: {
//         status: InvoiceStatus.PAID,
//         paymentRef: reference,
//         paidAt: new Date(),
//         metadata: {
//           ...metadata,
//           paymentChannel: channel,
//           cardType: authorization?.card_type,
//           bank: authorization?.bank,
//           last4: authorization?.last4,
//           paidAt: new Date().toISOString(),
//         },
//       },
//     });

//     // Update or create workspace subscription
//     const subscription = await tx.workspaceSubscription.upsert({
//       where: {
//         workspaceId: metadata.workspaceId,
//       },
//       update: {
//         tier: metadata.tier,
//         status: SubscriptionStatus.ACTIVE,
//         currentPeriodStart: new Date(),
//         currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         monthlyPrice: metadata.originalAmount,
//         paymentRef: reference,
//         updatedAt: new Date(),
//       },
//       create: {
//         id: dropid('sub'),
//         workspaceId: metadata.workspaceId,
//         tier: metadata.tier,
//         status: SubscriptionStatus.ACTIVE,
//         monthlyPrice: metadata.originalAmount,
//         currentPeriodStart: new Date(),
//         currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         paymentRef: reference,
//       },
//     });

//     // If promo code was used, record redemption
//     if (metadata.promoCode) {
//       const promo = await tx.promoCode.findUnique({
//         where: { code: metadata.promoCode.toUpperCase() },
//       });

//       if (promo) {
//         const existingRedemption = await tx.promoRedemption.findFirst({
//           where: {
//             promoCodeId: promo.id,
//             workspaceId: metadata.workspaceId,
//             invoiceId: invoice.id,
//           },
//         });

//         if (!existingRedemption) {
//           await tx.promoRedemption.create({
//             data: {
//               id: dropid('red'),
//               promoCodeId: promo.id,
//               workspaceId: metadata.workspaceId,
//               invoiceId: invoice.id,
//               discountAmount: metadata.discount || 0,
//             },
//           });

//           await tx.promoCode.update({
//             where: { id: promo.id },
//             data: { usedCount: { increment: 1 } },
//           });
//         }
//       }
//     }

//     // Create subscription transaction
//     const transaction = await tx.subscriptionTransaction.create({
//       data: {
//         id: dropid('stxn'),
//         workspaceId: metadata.workspaceId,
//         subscriptionId: subscription.id,
//         type: metadata.discount ? 'SUBSCRIPTION_PAYMENT' : 'SUBSCRIPTION_PAYMENT',
//         status: 'COMPLETED',
//         amount: amount / 100,
//         description: metadata.discount 
//           ? `Subscription payment for ${metadata.tier} plan (${metadata.discount} discount applied)`
//           : `Subscription payment for ${metadata.tier} plan`,
//         referenceId: reference,
//         invoiceId: invoice.id,
//         metadata: {
//           tier: metadata.tier,
//           planAmount: metadata.originalAmount,
//           discount: metadata.discount || 0,
//           finalAmount: amount / 100,
//           promoCode: metadata.promoCode,
//           paymentMethod: channel,
//           cardType: authorization?.card_type,
//           bank: authorization?.bank,
//           last4: authorization?.last4,
//           customerEmail: customer?.email,
//         },
//       },
//     });

//     // Send notification
//     const member = await tx.workspaceMember.findFirst({
//       where: { workspaceId: metadata.workspaceId, role: 'OWNER' },
//       include: { user: true },
//     });

//     if (member) {
//       await NotificationService.create({
//         userId: member.user.id,
//         type: 'PAYMENT_SUCCESS',
//         variables: {
//           amount: (amount / 100).toLocaleString(),
//           plan: metadata.tier,
//           email: customer?.email,
//         },
//         metadata: {
//           transactionId: transaction.id,
//           subscriptionId: subscription.id,
//           invoiceId: invoice.id,
//         },
//         actionUrl: `/dashboard/${member.workspaceId}/billing`,
//       });
//     }

//     console.log(`[Webhook:${requestId}] Subscription payment completed:`, {
//       workspaceId: metadata.workspaceId,
//       subscriptionId: subscription.id,
//       transactionId: transaction.id,
//       amount: amount / 100,
//     });

//     return { 
//       processed: true, 
//       type: 'subscription_payment',
//       subscriptionId: subscription.id,
//       transactionId: transaction.id 
//     };
//   });
// }

// async function handleSubscriptionCreate(data: any, requestId: string) {
//   const { customer, plan, subscription_code, next_payment_date, amount } = data;
  
//   console.log(`[Webhook:${requestId}] Processing subscription.create:`, {
//     customer: customer?.email,
//     plan: plan?.plan_code,
//     subscription_code,
//     amount: amount ? amount / 100 : 'N/A',
//   });

//   const member = await db.workspaceMember.findFirst({
//     where: { user: { email: customer.email } },
//     include: { workspace: true, user: true },
//   });

//   if (!member) {
//     console.log(`[Webhook:${requestId}] Workspace not found for email:`, customer.email);
//     return { processed: false, reason: 'workspace_not_found' };
//   }

//   const tier = mapPlanCodeToTier(plan.plan_code);

//   return await db.$transaction(async (tx) => {
//     const subscription = await tx.workspaceSubscription.upsert({
//       where: { workspaceId: member.workspaceId },
//       create: {
//         id: dropid('sub'),
//         workspaceId: member.workspaceId,
//         tier: tier,
//         status: SubscriptionStatus.ACTIVE,
//         monthlyPrice: (amount || plan.amount) / 100,
//         currentPeriodStart: new Date(),
//         currentPeriodEnd: new Date(next_payment_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
//         paymentRef: subscription_code,
//       },
//       update: {
//         tier: tier,
//         status: SubscriptionStatus.ACTIVE,
//         monthlyPrice: (amount || plan.amount) / 100,
//         currentPeriodStart: new Date(),
//         currentPeriodEnd: new Date(next_payment_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
//         paymentRef: subscription_code,
//       },
//     });

//     const transaction = await tx.subscriptionTransaction.create({
//       data: {
//         id: dropid('stxn'),
//         workspaceId: member.workspaceId,
//         subscriptionId: subscription.id,
//         type: 'SUBSCRIPTION_PAYMENT',
//         status: 'COMPLETED',
//         amount: (amount || plan.amount) / 100,
//         description: `Initial subscription payment for ${tier} plan`,
//         referenceId: subscription_code,
//         metadata: {
//           tier,
//           planCode: plan.plan_code,
//           customerEmail: customer.email,
//           event: 'subscription.create',
//         },
//       },
//     });

//     // Send notification
//     await NotificationService.create({
//       userId: member.user.id,
//       type: 'SUBSCRIPTION_CREATED',
//       variables: {
//         plan: tier,
//         workspace: member.workspace.name,
//         email: customer.email,
//       },
//       metadata: {
//         subscriptionId: subscription.id,
//         transactionId: transaction.id,
//       },
//       actionUrl: `/dashboard/${member.workspaceId}/billing`,
//     });

//     console.log(`[Webhook:${requestId}] Subscription created:`, {
//       workspaceId: member.workspaceId,
//       subscriptionId: subscription.id,
//       transactionId: transaction.id,
//       tier,
//     });

//     return { 
//       processed: true, 
//       subscriptionId: subscription.id,
//       transactionId: transaction.id 
//     };
//   });
// }

// async function handleSubscriptionRenewal(data: any, requestId: string) {
//   const { customer, subscription_code, amount, next_payment_date, invoice_code } = data;
  
//   console.log(`[Webhook:${requestId}] Processing subscription.renewal:`, {
//     customer: customer?.email,
//     subscription_code,
//     amount: amount / 100,
//     next_payment_date,
//   });

//   const subscription = await db.workspaceSubscription.findFirst({
//     where: { paymentRef: subscription_code },
//     include: { workspace: true },
//   });

//   if (!subscription) {
//     console.log(`[Webhook:${requestId}] Subscription not found:`, subscription_code);
//     return { processed: false, reason: 'subscription_not_found' };
//   }

//   const member = await db.workspaceMember.findFirst({
//     where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
//     include: { user: true },
//   });

//   return await db.$transaction(async (tx) => {
//     const invoice = await tx.invoice.create({
//       data: {
//         id: dropid('inv'),
//         workspaceId: subscription.workspaceId,
//         invoiceNumber: `REN-${Date.now()}`,
//         amount: amount / 100,
//         discount: 0,
//         finalAmount: amount / 100,
//         status: InvoiceStatus.PAID,
//         paidAt: new Date(),
//         periodStart: subscription.currentPeriodEnd,
//         periodEnd: new Date(next_payment_date),
//         paymentRef: invoice_code || subscription_code,
//         metadata: {
//           type: 'subscription_renewal',
//           subscriptionCode: subscription_code,
//           customerEmail: customer?.email,
//         },
//       },
//     });

//     const updatedSubscription = await tx.workspaceSubscription.update({
//       where: { id: subscription.id },
//       data: {
//         currentPeriodStart: subscription.currentPeriodEnd,
//         currentPeriodEnd: new Date(next_payment_date),
//         updatedAt: new Date(),
//       },
//     });

//     const transaction = await tx.subscriptionTransaction.create({
//       data: {
//         id: dropid('stxn'),
//         workspaceId: subscription.workspaceId,
//         subscriptionId: subscription.id,
//         type: 'SUBSCRIPTION_RENEWAL',
//         status: 'COMPLETED',
//         amount: amount / 100,
//         description: `Subscription renewal for ${subscription.tier} plan`,
//         referenceId: invoice_code || subscription_code,
//         invoiceId: invoice.id,
//         metadata: {
//           tier: subscription.tier,
//           amount: amount / 100,
//           nextPaymentDate: next_payment_date,
//           customerEmail: customer?.email,
//         },
//       },
//     });

//     if (member) {
//       await NotificationService.create({
//         userId: member.user.id,
//         type: 'SUBSCRIPTION_RENEWED',
//         variables: {
//           plan: subscription.tier,
//           amount: (amount / 100).toLocaleString(),
//         },
//         metadata: {
//           subscriptionId: subscription.id,
//           transactionId: transaction.id,
//           invoiceId: invoice.id,
//         },
//         actionUrl: `/dashboard/${subscription.workspaceId}/billing/invoices/${invoice.id}`,
//       });
//     }

//     console.log(`[Webhook:${requestId}] Subscription renewed:`, {
//       workspaceId: subscription.workspaceId,
//       subscriptionId: subscription.id,
//       transactionId: transaction.id,
//       newPeriodEnd: next_payment_date,
//     });

//     return { 
//       processed: true, 
//       subscriptionId: subscription.id,
//       transactionId: transaction.id 
//     };
//   });
// }

// async function handleSubscriptionDisable(data: any, requestId: string) {
//   const { customer, subscription_code } = data;
  
//   console.log(`[Webhook:${requestId}] Processing subscription.disable:`, {
//     customer: customer?.email,
//     subscription_code,
//   });

//   const subscription = await db.workspaceSubscription.findFirst({
//     where: { paymentRef: subscription_code },
//     include: { workspace: true },
//   });

//   if (!subscription) {
//     return { processed: false, reason: 'subscription_not_found' };
//   }

//   const result = await db.workspaceSubscription.update({
//     where: { id: subscription.id },
//     data: { 
//       status: SubscriptionStatus.CANCELED, 
//       cancelledAt: new Date() 
//     },
//   });

//   const member = await db.workspaceMember.findFirst({
//     where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
//     include: { user: true },
//   });

//   if (member) {
//     await NotificationService.create({
//       userId: member.user.id,
//       type: 'SUBSCRIPTION_CANCELLED',
//       variables: {
//         plan: subscription.tier,
//         endDate: subscription.currentPeriodEnd.toLocaleDateString(),
//       },
//       metadata: {
//         subscriptionId: subscription.id,
//       },
//       actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
//     });
//   }

//   console.log(`[Webhook:${requestId}] Subscription disabled:`, {
//     subscription_code,
//     updated: result.id,
//   });

//   return { processed: true };
// }

// async function handleSubscriptionCancel(data: any, requestId: string) {
//   const { customer, subscription_code } = data;
  
//   console.log(`[Webhook:${requestId}] Processing subscription.cancel:`, {
//     customer: customer?.email,
//     subscription_code,
//   });

//   const subscription = await db.workspaceSubscription.findFirst({
//     where: { paymentRef: subscription_code },
//     include: { workspace: true },
//   });

//   if (!subscription) {
//     return { processed: false, reason: 'subscription_not_found' };
//   }

//   const result = await db.workspaceSubscription.update({
//     where: { id: subscription.id },
//     data: { 
//       status: SubscriptionStatus.CANCELED, 
//       cancelledAt: new Date() 
//     },
//   });

//   const member = await db.workspaceMember.findFirst({
//     where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
//     include: { user: true },
//   });

//   if (member) {
//     await NotificationService.create({
//       userId: member.user.id,
//       type: 'SUBSCRIPTION_CANCELLED',
//       variables: {
//         plan: subscription.tier,
//         endDate: subscription.currentPeriodEnd.toLocaleDateString(),
//       },
//       metadata: {
//         subscriptionId: subscription.id,
//       },
//       actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
//     });
//   }

//   console.log(`[Webhook:${requestId}] Subscription cancelled:`, {
//     subscription_code,
//     updated: result.id,
//   });

//   return { processed: true };
// }

// async function handleSubscriptionExpiring(data: any, requestId: string) {
//   const { customer, subscription_code, next_payment_date } = data;
  
//   console.log(`[Webhook:${requestId}] Processing subscription.expiring:`, {
//     customer: customer?.email,
//     subscription_code,
//     next_payment_date,
//   });

//   const subscription = await db.workspaceSubscription.findFirst({
//     where: { paymentRef: subscription_code },
//     include: { workspace: true },
//   });

//   if (!subscription) {
//     return { processed: false, reason: 'subscription_not_found' };
//   }

//   const daysUntilExpiry = Math.ceil(
//     (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
//   );

//   const member = await db.workspaceMember.findFirst({
//     where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
//     include: { user: true },
//   });

//   if (member) {
//     await NotificationService.create({
//       userId: member.user.id,
//       type: 'SUBSCRIPTION_EXPIRING',
//       variables: {
//         plan: subscription.tier,
//         days: daysUntilExpiry.toString(),
//       },
//       metadata: {
//         subscriptionId: subscription.id,
//         expiryDate: subscription.currentPeriodEnd,
//       },
//       actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
//     });
//   }

//   return { processed: true };
// }

// async function handleExpiringCard(data: any, requestId: string) {
//   const { customer, authorization } = data;
  
//   console.log(`[Webhook:${requestId}] Processing expiring card:`, {
//     customer: customer?.email,
//     last4: authorization?.last4,
//     expMonth: authorization?.exp_month,
//     expYear: authorization?.exp_year,
//   });

//   const member = await db.workspaceMember.findFirst({
//     where: { user: { email: customer.email } },
//     include: { workspace: true, user: true },
//   });

//   if (!member) {
//     return { processed: false, reason: 'workspace_not_found' };
//   }

//   await NotificationService.create({
//     userId: member.user.id,
//     type: 'CARD_EXPIRING',
//     variables: {
//       last4: authorization.last4,
//       expMonth: authorization.exp_month,
//       expYear: authorization.exp_year,
//     },
//     metadata: {
//       last4: authorization.last4,
//       expMonth: authorization.exp_month,
//       expYear: authorization.exp_year,
//       customerEmail: customer.email,
//     },
//     actionUrl: `/dashboard/${member.workspaceId}/billing`,
//   });

//   console.log(`[Webhook:${requestId}] Card expiring notification created for:`, {
//     workspaceId: member.workspaceId,
//     userId: member.user.id,
//   });

//   return { processed: true };
// }

// async function handleTransfer(data: any, requestId: string) {
//   console.log(`[Webhook:${requestId}] Transfer event:`, {
//     status: data.status,
//     reference: data.reference,
//     amount: data.amount / 100,
//     recipient: data.recipient?.name,
//   });

//   return { processed: true };
// }

// function mapPlanCodeToTier(planCode: string): SubscriptionTier {
//   const upperCode = planCode.toUpperCase();
//   if (upperCode.includes('STARTER')) return SubscriptionTier.STARTER;
//   if (upperCode.includes('PROFESSIONAL')) return SubscriptionTier.PROFESSIONAL;
//   if (upperCode.includes('BUSINESS')) return SubscriptionTier.BUSINESS;
//   return SubscriptionTier.FREE;
// }









import { NextRequest } from "next/server";
import crypto from 'crypto';
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { InvoiceStatus, SubscriptionStatus, SubscriptionTier, PlanSubscriptionStatus } from "@/lib/generated/prisma/enums";
import { NotificationService } from "@/lib/notification.service";
import { getPlanByTier } from "@/lib/billing/plan";

// Webhook secret for additional security (optional but recommended)
const WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const requestId = dropid('webhook').substring(0, 10);
  
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    console.log(`[Webhook:${requestId}] Received webhook`, {
      signature: signature ? 'present' : 'missing',
      bodyLength: body.length,
      contentType: req.headers.get('content-type'),
    });

    // Verify webhook signature
    if (!signature) {
      console.error(`[Webhook:${requestId}] No signature provided`);
      return new Response('No signature provided', { status: 401 });
    }

    // Verify signature with Paystack secret
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error(`[Webhook:${requestId}] Invalid signature`, {
        expected: hash.substring(0, 10) + '...',
        received: signature.substring(0, 10) + '...',
      });
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse event
    const event = JSON.parse(body);
    
    console.log(`[Webhook:${requestId}] Processing event:`, {
      event: event.event,
      id: event.id || 'no-id',
      createdAt: event.createdAt,
    });

    // Process event based on type
    let result;
    switch (event.event) {
      case 'charge.success':
        result = await handleSuccessfulCharge(event.data, requestId);
        break;
      
      case 'subscription.create':
        result = await handleSubscriptionCreate(event.data, requestId);
        break;
      
      case 'subscription.disable':
        result = await handleSubscriptionDisable(event.data, requestId);
        break;
      
      case 'subscription.expiring_cards':
        result = await handleExpiringCard(event.data, requestId);
        break;
      
      case 'subscription.renewal':
        result = await handleSubscriptionRenewal(event.data, requestId);
        break;
      
      case 'subscription.cancel':
        result = await handleSubscriptionCancel(event.data, requestId);
        break;
      
      case 'subscription.expiring':
        result = await handleSubscriptionExpiring(event.data, requestId);
        break;
      
      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        result = await handleTransfer(event.data, requestId);
        break;
      
      default:
        console.log(`[Webhook:${requestId}] Unhandled event type:`, event.event);
        return new Response('Event received but unhandled', { status: 200 });
    }

    console.log(`[Webhook:${requestId}] Event processed successfully:`, result);
    
    return new Response(JSON.stringify({ 
      received: true,
      event: event.event,
      processed: true,
      requestId
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[Webhook:${requestId}] Error:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Always return 200 to prevent Paystack from retrying
    return new Response(JSON.stringify({ 
      received: true,
      error: 'Webhook processing failed but acknowledged',
      requestId
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleSuccessfulCharge(data: any, requestId: string) {
  const { reference, amount, metadata, customer, authorization, channel } = data;

  console.log(`[Webhook:${requestId}] Processing charge.success:`, {
    reference,
    amount: amount / 100,
    customer: customer?.email,
    type: metadata?.type,
  });

  // Check if this webhook was already processed (idempotency)
  const existingTransaction = await db.subscriptionTransaction.findFirst({
    where: { referenceId: reference },
  });

  if (existingTransaction) {
    console.log(`[Webhook:${requestId}] Transaction already processed:`, reference);
    return { processed: false, reason: 'duplicate' };
  }

  // Handle subscription payments
  if (metadata?.type === 'subscription_payment' || metadata?.isSubscription) {
    return handleSubscriptionPayment(data, requestId);
  }

  return { processed: false, reason: 'unknown_type' };
}

async function handleSubscriptionPayment(data: any, requestId: string) {
  const { metadata, reference, amount, customer, authorization, channel } = data;

  console.log(`[Webhook:${requestId}] Processing subscription payment:`, {
    workspaceId: metadata?.workspaceId,
    tier: metadata?.tier,
    amount: amount / 100,
    discount: metadata?.discount,
  });

  return await db.$transaction(async (tx) => {
    // Update invoice
    const invoice = await tx.invoice.update({
      where: { id: metadata.invoiceId },
      data: {
        status: InvoiceStatus.PAID,
        paymentRef: reference,
        paidAt: new Date(),
        metadata: {
          ...metadata,
          paymentChannel: channel,
          cardType: authorization?.card_type,
          bank: authorization?.bank,
          last4: authorization?.last4,
          paidAt: new Date().toISOString(),
        },
      },
    });

    // Get plan limits from imported plans
    const plan = getPlanByTier(metadata.tier);
    if (!plan) {
      throw new Error(`Plan not found for tier: ${metadata.tier}`);
    }

    // Update or create workspace subscription
    const subscription = await tx.workspaceSubscription.upsert({
      where: {
        workspaceId: metadata.workspaceId,
      },
      update: {
        tier: metadata.tier,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyPrice: metadata.originalAmount,
        paymentRef: reference,
        updatedAt: new Date(),
      },
      create: {
        id: dropid('sub'),
        workspaceId: metadata.workspaceId,
        tier: metadata.tier,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: metadata.originalAmount,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: reference,
      },
    });

    // Update workspace limits and subscription status
    await tx.workspace.update({
      where: { id: metadata.workspaceId },
      data: {
        plan: metadata.tier,
        plansubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
        subscriberLimit: plan.limits.subscribers,
        emailLimit: plan.limits.email,
        smsLimit: plan.limits.sms,
        otpLimit: plan.limits.otp,
        fileLimit: plan.limits.storage,
        updatedAt: new Date(),
      },
    });

    // Reset usage counts for new billing period (optional - based on your business logic)
    // Uncomment if you want to reset usage at the start of each billing period
    
    await tx.workspace.update({
      where: { id: metadata.workspaceId },
      data: {
        currentEmailsSent: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        currentFilesUsed: 0,
        currentSubscribers: 0, // Be careful with this one
      },
    });
    

    // If promo code was used, record redemption
    if (metadata.promoCode) {
      const promo = await tx.promoCode.findUnique({
        where: { code: metadata.promoCode.toUpperCase() },
      });

      if (promo) {
        const existingRedemption = await tx.promoRedemption.findFirst({
          where: {
            promoCodeId: promo.id,
            workspaceId: metadata.workspaceId,
            invoiceId: invoice.id,
          },
        });

        if (!existingRedemption) {
          await tx.promoRedemption.create({
            data: {
              id: dropid('red'),
              promoCodeId: promo.id,
              workspaceId: metadata.workspaceId,
              invoiceId: invoice.id,
              discountAmount: metadata.discount || 0,
            },
          });

          await tx.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    // Create subscription transaction
    const transaction = await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: metadata.workspaceId,
        subscriptionId: subscription.id,
        type: metadata.discount ? 'SUBSCRIPTION_PAYMENT' : 'SUBSCRIPTION_PAYMENT',
        status: 'COMPLETED',
        amount: amount / 100,
        description: metadata.discount 
          ? `Subscription payment for ${metadata.tier} plan (${metadata.discount} discount applied)`
          : `Subscription payment for ${metadata.tier} plan`,
        referenceId: reference,
        invoiceId: invoice.id,
        metadata: {
          tier: metadata.tier,
          planAmount: metadata.originalAmount,
          discount: metadata.discount || 0,
          finalAmount: amount / 100,
          promoCode: metadata.promoCode,
          paymentMethod: channel,
          cardType: authorization?.card_type,
          bank: authorization?.bank,
          last4: authorization?.last4,
          customerEmail: customer?.email,
          limits: plan.limits, // Store the limits for reference
        },
      },
    });

    // Create usage log for the new subscription
    await tx.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId: metadata.workspaceId,
        service: 'SUBSCRIPTION',
        month: new Date().toISOString().slice(0, 7),
        currentSubscribers: 0, // Will be updated by the subscriber count
        currentEmailsSent: 0,
        currentFilesUsed: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        createdAt: new Date(),
      },
    });

    // Send notification
    const member = await tx.workspaceMember.findFirst({
      where: { workspaceId: metadata.workspaceId, role: 'OWNER' },
      include: { user: true },
    });

    if (member) {
      await NotificationService.create({
        userId: member.user.id,
        type: 'PAYMENT_SUCCESS',
        variables: {
          amount: (amount / 100).toLocaleString(),
          plan: metadata.tier,
          email: customer?.email,
          limits: `Subscribers: ${plan.limits.subscribers}, SMS: ${plan.limits.sms}, Email: ${plan.limits.email}`,
        },
        metadata: {
          transactionId: transaction.id,
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          limits: plan.limits,
        },
        actionUrl: `/dashboard/${member.workspaceId}/billing`,
      });
    }

    console.log(`[Webhook:${requestId}] Subscription payment completed with limits:`, {
      workspaceId: metadata.workspaceId,
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      amount: amount / 100,
      tier: metadata.tier,
      limits: plan.limits,
    });

    return { 
      processed: true, 
      type: 'subscription_payment',
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      tier: metadata.tier,
      limits: plan.limits,
    };
  });
}

async function handleSubscriptionCreate(data: any, requestId: string) {
  const { customer, plan, subscription_code, next_payment_date, amount } = data;
  
  console.log(`[Webhook:${requestId}] Processing subscription.create:`, {
    customer: customer?.email,
    plan: plan?.plan_code,
    subscription_code,
    amount: amount ? amount / 100 : 'N/A',
  });

  const member = await db.workspaceMember.findFirst({
    where: { user: { email: customer.email } },
    include: { workspace: true, user: true },
  });

  if (!member) {
    console.log(`[Webhook:${requestId}] Workspace not found for email:`, customer.email);
    return { processed: false, reason: 'workspace_not_found' };
  }

  const tier = mapPlanCodeToTier(plan.plan_code);
  const planConfig = getPlanByTier(tier);
  
  if (!planConfig) {
    throw new Error(`Plan not found for tier: ${tier}`);
  }

  return await db.$transaction(async (tx) => {
    const subscription = await tx.workspaceSubscription.upsert({
      where: { workspaceId: member.workspaceId },
      create: {
        id: dropid('sub'),
        workspaceId: member.workspaceId,
        tier: tier,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: (amount || plan.amount) / 100,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(next_payment_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: subscription_code,
      },
      update: {
        tier: tier,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: (amount || plan.amount) / 100,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(next_payment_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentRef: subscription_code,
      },
    });

    // Update workspace limits and subscription status
    await tx.workspace.update({
      where: { id: member.workspaceId },
      data: {
        plan: tier,
        plansubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
        subscriberLimit: planConfig.limits.subscribers,
        emailLimit: planConfig.limits.email,
        smsLimit: planConfig.limits.sms,
        otpLimit: planConfig.limits.otp,
        fileLimit: planConfig.limits.storage,
        updatedAt: new Date(),
      },
    });

    const transaction = await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: member.workspaceId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION_PAYMENT',
        status: 'COMPLETED',
        amount: (amount || plan.amount) / 100,
        description: `Initial subscription payment for ${tier} plan`,
        referenceId: subscription_code,
        metadata: {
          tier,
          planCode: plan.plan_code,
          customerEmail: customer.email,
          event: 'subscription.create',
          limits: planConfig.limits,
        },
      },
    });

    // Send notification
    await NotificationService.create({
      userId: member.user.id,
      type: 'SUBSCRIPTION_CREATED',
      variables: {
        plan: tier,
        workspace: member.workspace.name,
        email: customer.email,
        limits: `Subscribers: ${planConfig.limits.subscribers}, SMS: ${planConfig.limits.sms}, Email: ${planConfig.limits.email}`,
      },
      metadata: {
        subscriptionId: subscription.id,
        transactionId: transaction.id,
        limits: planConfig.limits,
      },
      actionUrl: `/dashboard/${member.workspaceId}/billing`,
    });

    console.log(`[Webhook:${requestId}] Subscription created with limits:`, {
      workspaceId: member.workspaceId,
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      tier,
      limits: planConfig.limits,
    });

    return { 
      processed: true, 
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      limits: planConfig.limits,
    };
  });
}

async function handleSubscriptionRenewal(data: any, requestId: string) {
  const { customer, subscription_code, amount, next_payment_date, invoice_code } = data;
  
  console.log(`[Webhook:${requestId}] Processing subscription.renewal:`, {
    customer: customer?.email,
    subscription_code,
    amount: amount / 100,
    next_payment_date,
  });

  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscription_code },
    include: { workspace: true },
  });

  if (!subscription) {
    console.log(`[Webhook:${requestId}] Subscription not found:`, subscription_code);
    return { processed: false, reason: 'subscription_not_found' };
  }

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
    include: { user: true },
  });

  const planConfig = getPlanByTier(subscription.tier);
  
  if (!planConfig) {
    throw new Error(`Plan not found for tier: ${subscription.tier}`);
  }

  return await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        id: dropid('inv'),
        workspaceId: subscription.workspaceId,
        invoiceNumber: `REN-${Date.now()}`,
        amount: amount / 100,
        discount: 0,
        finalAmount: amount / 100,
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        periodStart: subscription.currentPeriodEnd,
        periodEnd: new Date(next_payment_date),
        paymentRef: invoice_code || subscription_code,
        metadata: {
          type: 'subscription_renewal',
          subscriptionCode: subscription_code,
          customerEmail: customer?.email,
        },
      },
    });

    const updatedSubscription = await tx.workspaceSubscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: new Date(next_payment_date),
        status: SubscriptionStatus.ACTIVE,
        updatedAt: new Date(),
      },
    });

    // Update workspace subscription status (ensure it's active)
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: {
        plansubscriptionStatus: PlanSubscriptionStatus.ACTIVE,
        updatedAt: new Date(),
      },
    });

    // Optionally reset usage counts for the new period
    // Uncomment if you want to reset usage at renewal
    
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: {
        currentEmailsSent: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        currentFilesUsed: 0,
      },
    });
    

    const transaction = await tx.subscriptionTransaction.create({
      data: {
        id: dropid('stxn'),
        workspaceId: subscription.workspaceId,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION_RENEWAL',
        status: 'COMPLETED',
        amount: amount / 100,
        description: `Subscription renewal for ${subscription.tier} plan`,
        referenceId: invoice_code || subscription_code,
        invoiceId: invoice.id,
        metadata: {
          tier: subscription.tier,
          amount: amount / 100,
          nextPaymentDate: next_payment_date,
          customerEmail: customer?.email,
          limits: planConfig.limits,
        },
      },
    });

    if (member) {
      await NotificationService.create({
        userId: member.user.id,
        type: 'SUBSCRIPTION_RENEWED',
        variables: {
          plan: subscription.tier,
          amount: (amount / 100).toLocaleString(),
          limits: `Subscribers: ${planConfig.limits.subscribers}, SMS: ${planConfig.limits.sms}`,
        },
        metadata: {
          subscriptionId: subscription.id,
          transactionId: transaction.id,
          invoiceId: invoice.id,
          limits: planConfig.limits,
        },
        actionUrl: `/dashboard/${subscription.workspaceId}/billing/invoices/${invoice.id}`,
      });
    }

    console.log(`[Webhook:${requestId}] Subscription renewed with limits:`, {
      workspaceId: subscription.workspaceId,
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      tier: subscription.tier,
      limits: planConfig.limits,
      newPeriodEnd: next_payment_date,
    });

    return { 
      processed: true, 
      subscriptionId: subscription.id,
      transactionId: transaction.id,
      limits: planConfig.limits,
    };
  });
}

async function handleSubscriptionDisable(data: any, requestId: string) {
  const { customer, subscription_code } = data;
  
  console.log(`[Webhook:${requestId}] Processing subscription.disable:`, {
    customer: customer?.email,
    subscription_code,
  });

  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscription_code },
    include: { workspace: true },
  });

  if (!subscription) {
    return { processed: false, reason: 'subscription_not_found' };
  }

  // Get FREE plan limits for fallback
  const freePlan = getPlanByTier(SubscriptionTier.FREE);
  
  if (!freePlan) {
    throw new Error('FREE plan not found');
  }

  const result = await db.$transaction(async (tx) => {
    // Update subscription
    const updatedSub = await tx.workspaceSubscription.update({
      where: { id: subscription.id },
      data: { 
        status: SubscriptionStatus.CANCELED, 
        cancelledAt: new Date() 
      },
    });

    // Downgrade workspace to FREE plan
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: {
        plan: SubscriptionTier.FREE,
        plansubscriptionStatus: PlanSubscriptionStatus.INACTIVE,
        subscriberLimit: freePlan.limits.subscribers,
        emailLimit: freePlan.limits.email,
        smsLimit: freePlan.limits.sms,
        otpLimit: freePlan.limits.otp,
        fileLimit: freePlan.limits.storage,
        updatedAt: new Date(),
      },
    });

    return updatedSub;
  });

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
    include: { user: true },
  });

  if (member) {
    await NotificationService.create({
      userId: member.user.id,
      type: 'SUBSCRIPTION_CANCELLED',
      variables: {
        plan: subscription.tier,
        endDate: subscription.currentPeriodEnd.toLocaleDateString(),
        newPlan: 'FREE',
        limits: `New limits: Subscribers: ${freePlan.limits.subscribers}`,
      },
      metadata: {
        subscriptionId: subscription.id,
        oldTier: subscription.tier,
        newTier: SubscriptionTier.FREE,
        limits: freePlan.limits,
      },
      actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
    });
  }

  console.log(`[Webhook:${requestId}] Subscription disabled and workspace downgraded to FREE:`, {
    subscription_code,
    oldTier: subscription.tier,
    newLimits: freePlan.limits,
  });

  return { processed: true };
}

async function handleSubscriptionCancel(data: any, requestId: string) {
  const { customer, subscription_code } = data;
  
  console.log(`[Webhook:${requestId}] Processing subscription.cancel:`, {
    customer: customer?.email,
    subscription_code,
  });

  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscription_code },
    include: { workspace: true },
  });

  if (!subscription) {
    return { processed: false, reason: 'subscription_not_found' };
  }

  // Get FREE plan limits for fallback
  const freePlan = getPlanByTier(SubscriptionTier.FREE);
  
  if (!freePlan) {
    throw new Error('FREE plan not found');
  }

  const result = await db.$transaction(async (tx) => {
    // Update subscription
    const updatedSub = await tx.workspaceSubscription.update({
      where: { id: subscription.id },
      data: { 
        status: SubscriptionStatus.CANCELED, 
        cancelledAt: new Date() 
      },
    });

    // Downgrade workspace to FREE plan
    await tx.workspace.update({
      where: { id: subscription.workspaceId },
      data: {
        plan: SubscriptionTier.FREE,
        plansubscriptionStatus: PlanSubscriptionStatus.INACTIVE,
        subscriberLimit: freePlan.limits.subscribers,
        emailLimit: freePlan.limits.email,
        smsLimit: freePlan.limits.sms,
        otpLimit: freePlan.limits.otp,
        fileLimit: freePlan.limits.storage,
        updatedAt: new Date(),
      },
    });

    return updatedSub;
  });

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
    include: { user: true },
  });

  if (member) {
    await NotificationService.create({
      userId: member.user.id,
      type: 'SUBSCRIPTION_CANCELLED',
      variables: {
        plan: subscription.tier,
        endDate: subscription.currentPeriodEnd.toLocaleDateString(),
        newPlan: 'FREE',
        limits: `New limits: Subscribers: ${freePlan.limits.subscribers}`,
      },
      metadata: {
        subscriptionId: subscription.id,
        oldTier: subscription.tier,
        newTier: SubscriptionTier.FREE,
        limits: freePlan.limits,
      },
      actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
    });
  }

  console.log(`[Webhook:${requestId}] Subscription cancelled and workspace downgraded to FREE:`, {
    subscription_code,
    oldTier: subscription.tier,
    newLimits: freePlan.limits,
  });

  return { processed: true };
}

async function handleSubscriptionExpiring(data: any, requestId: string) {
  const { customer, subscription_code, next_payment_date } = data;
  
  console.log(`[Webhook:${requestId}] Processing subscription.expiring:`, {
    customer: customer?.email,
    subscription_code,
    next_payment_date,
  });

  const subscription = await db.workspaceSubscription.findFirst({
    where: { paymentRef: subscription_code },
    include: { workspace: true },
  });

  if (!subscription) {
    return { processed: false, reason: 'subscription_not_found' };
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: subscription.workspaceId, role: 'OWNER' },
    include: { user: true },
  });

  if (member) {
    await NotificationService.create({
      userId: member.user.id,
      type: 'SUBSCRIPTION_EXPIRING',
      variables: {
        plan: subscription.tier,
        days: daysUntilExpiry.toString(),
      },
      metadata: {
        subscriptionId: subscription.id,
        expiryDate: subscription.currentPeriodEnd,
      },
      actionUrl: `/dashboard/${subscription.workspaceId}/billing`,
    });
  }

  return { processed: true };
}

async function handleExpiringCard(data: any, requestId: string) {
  const { customer, authorization } = data;
  
  console.log(`[Webhook:${requestId}] Processing expiring card:`, {
    customer: customer?.email,
    last4: authorization?.last4,
    expMonth: authorization?.exp_month,
    expYear: authorization?.exp_year,
  });

  const member = await db.workspaceMember.findFirst({
    where: { user: { email: customer.email } },
    include: { workspace: true, user: true },
  });

  if (!member) {
    return { processed: false, reason: 'workspace_not_found' };
  }

  await NotificationService.create({
    userId: member.user.id,
    type: 'CARD_EXPIRING',
    variables: {
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
    },
    metadata: {
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
      customerEmail: customer.email,
    },
    actionUrl: `/dashboard/${member.workspaceId}/billing`,
  });

  console.log(`[Webhook:${requestId}] Card expiring notification created for:`, {
    workspaceId: member.workspaceId,
    userId: member.user.id,
  });

  return { processed: true };
}

async function handleTransfer(data: any, requestId: string) {
  console.log(`[Webhook:${requestId}] Transfer event:`, {
    status: data.status,
    reference: data.reference,
    amount: data.amount / 100,
    recipient: data.recipient?.name,
  });

  return { processed: true };
}

function mapPlanCodeToTier(planCode: string): SubscriptionTier {
  const upperCode = planCode.toUpperCase();
  
  // Map Paystack plan codes to tiers
  const starterCode = process.env.PAYSTACK_STARTER_PLAN_CODE?.toUpperCase() || 'PLN_VK1EE3KTB6F379T';
  const professionalCode = process.env.PAYSTACK_PROFESSIONAL_PLAN_CODE?.toUpperCase() || 'PLN_C4OYWRNQHUSKHXQ';
  const businessCode = process.env.PAYSTACK_BUSINESS_PLAN_CODE?.toUpperCase() || 'PLN_OLURHWSSFCM75K3';
  
  if (upperCode.includes('STARTER') || upperCode === starterCode) return SubscriptionTier.STARTER;
  if (upperCode.includes('PROFESSIONAL') || upperCode === professionalCode) return SubscriptionTier.PROFESSIONAL;
  if (upperCode.includes('BUSINESS') || upperCode === businessCode) return SubscriptionTier.BUSINESS;
  
  return SubscriptionTier.FREE;
}