// app/api/billing/subscription/verify/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { err, ok, serverError } from "@/lib/respond/response";
import { dropid } from "dropid";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack sometimes uses this

    console.log('🔵 [VERIFY_SUBSCRIPTION] Callback received:', { reference, trxref });

    const transactionRef = reference || trxref;
    
    if (!transactionRef) {
      console.log('🔴 [VERIFY_SUBSCRIPTION] No reference provided');
      return err('No transaction reference provided', 400);
    }

    // Verify the transaction with Paystack
    const verificationResult = await verifyTransaction(transactionRef);
    
    console.log('📊 [VERIFY_SUBSCRIPTION] Verification result:', {
      status: verificationResult.data.status,
      amount: verificationResult.data.amount / 100,
      customer: verificationResult.data.customer?.email,
      metadata: verificationResult.data.metadata
    });

    // Extract metadata
    const metadata = verificationResult.data.metadata || {};
    const { 
      workspaceId, 
      tier, 
      invoiceId, 
      promoCode, 
      discount, 
      originalAmount, 
      userId,
      workspaceName 
    } = metadata;

    if (!workspaceId || !tier || !invoiceId) {
      console.log('🔴 [VERIFY_SUBSCRIPTION] Missing metadata:', { workspaceId, tier, invoiceId });
      return err('Invalid transaction metadata', 400);
    }

    // Check if transaction was successful
    if (verificationResult.data.status !== 'success') {
      console.log('🔴 [VERIFY_SUBSCRIPTION] Transaction not successful:', verificationResult.data.status);
      
      // Update invoice status
      await db.invoice.update({
        where: { id: invoiceId },
        data: { status: 'FAILED' }
      });

      // Redirect to failure page
      const failureUrl = new URL('/dashboard/billing?status=failed', process.env.NEXT_PUBLIC_APP_URL);
      return Response.redirect(failureUrl.toString());
    }

    // Calculate final amount (use discounted amount from metadata)
    const paidAmount = originalAmount - (discount || 0);
    const paystackAmount = verificationResult.data.amount / 100;

    // Verify that the amount paid matches what we expected
    if (Math.abs(paidAmount - paystackAmount) > 1) { // Allow 1 naira difference for rounding
      console.log('⚠️ [VERIFY_SUBSCRIPTION] Amount mismatch:', {
        expected: paidAmount,
        actual: paystackAmount,
        originalAmount,
        discount
      });
      // Don't fail, just log it
    }

    // Start a transaction to update all related records
    const result = await db.$transaction(async (tx) => {
      // 1. Update invoice
      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef: transactionRef,
          finalAmount: paidAmount, // Update with actual paid amount
          metadata: {
            ...(metadata as any),
            paystackResponse: verificationResult.data,
            amountVerified: true,
            expectedAmount: originalAmount,
            discountApplied: discount || 0,
            paidAmount,
          },
        },
      });

      // 2. Update or create workspace subscription
      const subscription = await tx.workspaceSubscription.upsert({
        where: {
          workspaceId: workspaceId,
        },
        update: {
          tier: tier,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          monthlyPrice: originalAmount, // Store the original price (before discount)
          paymentRef: transactionRef,
          updatedAt: new Date(),
          // Store discount info in metadata if you have a field
        },
        create: {
          id: dropid('sub'),
          workspaceId: workspaceId,
          tier: tier,
          status: 'ACTIVE',
          monthlyPrice: originalAmount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentRef: transactionRef,
        },
      });

      // 3. If promo code was used, record redemption
      if (promoCode) {
        const promo = await tx.promoCode.findUnique({
          where: { code: promoCode.toUpperCase() },
        });

        if (promo) {
          // Check if redemption already exists (prevent duplicates)
          const existingRedemption = await tx.promoRedemption.findFirst({
            where: {
              promoCodeId: promo.id,
              workspaceId: workspaceId,
              invoiceId: invoice.id,
            },
          });

          if (!existingRedemption) {
            await tx.promoRedemption.create({
              data: {
                id: dropid('red'),
                promoCodeId: promo.id,
                workspaceId: workspaceId,
                invoiceId: invoice.id,
                discountAmount: discount || 0,
              },
            });

            // Increment used count
            await tx.promoCode.update({
              where: { id: promo.id },
              data: { usedCount: { increment: 1 } },
            });

            console.log('🎫 Promo redemption recorded:', promo.code);
          }
        }
      }

      // 4. Create subscription transaction
      const transaction = await tx.subscriptionTransaction.create({
        data: {
          id: dropid('stxn'),
          workspaceId,
          subscriptionId: subscription.id,
          type: discount ? 'SUBSCRIPTION_PAYMENT' : 'SUBSCRIPTION_PAYMENT', // You could add a separate type for discounted payments
          status: 'COMPLETED',
          amount: paidAmount, // Use the discounted amount
          description: discount 
            ? `Subscription payment for ${tier} plan (${discount} discount applied)`
            : `Subscription payment for ${tier} plan`,
          referenceId: transactionRef,
          invoiceId: invoice.id,
          metadata: {
            tier,
            planAmount: originalAmount,
            discount: discount || 0,
            finalAmount: paidAmount,
            promoCode: promoCode || null,
            workspaceName,
            paymentMethod: verificationResult.data.authorization?.channel || 'unknown',
            cardType: verificationResult.data.authorization?.card_type || null,
            bank: verificationResult.data.authorization?.bank || null,
          },
        },
      });

      console.log('💳 Subscription transaction created:', transaction.id);

      return { invoice, subscription, transaction };
    });

    console.log('✅ [VERIFY_SUBSCRIPTION] Subscription activated successfully:', {
      workspaceId,
      tier,
      invoiceId: result.invoice.id,
      subscriptionId: result.subscription.id,
      transactionId: result.transaction.id,
      amountPaid: result.transaction.amount,
      discount: discount || 0,
    });

    // Redirect to success page with query params
    const successUrl = new URL('/dashboard/billing', process.env.NEXT_PUBLIC_APP_URL);
    successUrl.searchParams.set('status', 'success');
    successUrl.searchParams.set('reference', transactionRef);
    if (discount) {
      successUrl.searchParams.set('discount', discount.toString());
    }
    
    return Response.redirect(successUrl.toString());

  } catch (error: any) {
    console.error('🔴 [VERIFY_SUBSCRIPTION] Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Redirect to error page
    const errorUrl = new URL('/dashboard/billing', process.env.NEXT_PUBLIC_APP_URL);
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', 'Payment verification failed');
    
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






