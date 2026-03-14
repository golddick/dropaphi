// // lib/billing/middleware.ts
// import { db } from '@/lib/db';
// import { dropid } from 'dropid';
// import { TransactionStatus, TransactionType } from '../generated/prisma/enums';


// export async function deductCredits(
//   workspaceId: string,
//   service: string,
//   amount: number,
//   description: string,
//   metadata?: any
// ) {
//   try {
//     // Get current balance
//     const balance = await db.creditBalance.findUnique({
//       where: { workspaceId },
//     });

//     if (!balance) {
//       throw new Error('No credit balance found');
//     }

//     // Check if enough credits (convert Decimal to number for comparison)
//     const currentBalance = balance.balance.toNumber();
    
//     if (currentBalance < amount) {
//       // Check auto-recharge
//       if (balance.autoRecharge && balance.autoThreshold && balance.autoAmount) {
//         const threshold = balance.autoThreshold.toNumber();
//         if (currentBalance <= threshold) {
//           // Trigger auto-recharge
//           await triggerAutoRecharge(workspaceId, balance.autoAmount.toNumber());
//         }
//       }
//       throw new Error('Insufficient credits');
//     }

//     const newBalance = currentBalance - amount;

//     // Update balance
//     await db.creditBalance.update({
//       where: { workspaceId },
//       data: { balance: newBalance },
//     });

//     // Create transaction record
//     await db.creditTransaction.create({
//       data: {
//         id: dropid('txn'),
//         workspaceId,
//         type: TransactionType.CREDIT_USAGE,
//         status: TransactionStatus.COMPLETED,
//         amount,
//         balanceBefore: currentBalance,
//         balanceAfter: newBalance,
//         description,
//         service,
//         metadata,
//       },
//     });

//     // Log usage
//     await db.usageLog.create({
//       data: {
//         id: dropid('ulg'),
//         method:'',
//         endpoint:' ',
//         statusCode:200,
//         workspaceId,
//         service,
//         creditsUsed: amount,
//         metadata,
//       },
//     });

//     return { success: true, newBalance };
//   } catch (error) {
//     console.error('[DEDUCT_CREDITS]', error);
//     throw error;
//   }
// }

// async function triggerAutoRecharge(workspaceId: string, amount: number) {
//   // Create pending transaction
//   const invoice = await db.invoice.create({
//     data: {
//       id: dropid('inv'),
//       workspaceId,
//       invoiceNumber: `AUTO-${Date.now()}`,
//       amount,
//       status: 'PENDING',
//     },
//   });

//   // Notify user
//   console.log(`Auto-recharge triggered for ${workspaceId} with amount ${amount}`);
  
//   // You can send email notification here
//   // await sendAutoRechargeNotification(workspaceId, amount, invoice.id);
// }