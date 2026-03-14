// app/api/admin/transactions/export/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    
    // Apply filters
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (type) where.type = type;
    if (status) where.status = status;

    // Fetch all subscription transactions with related data
    const subscriptionTransactions = await db.subscriptionTransaction.findMany({
      where,
      include: {
        workspace: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: true },
            },
          },
        },
        subscription: true,
        invoice: {
          include: {
            promoCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format transactions for export
    const transactions = subscriptionTransactions.map(t => {
      const owner = t.workspace?.members[0]?.user;
      
      // Format description based on type
      let description = t.description;
      if (!description || description === '') {
        switch (t.type) {
          case 'SUBSCRIPTION_PAYMENT':
            description = `Initial subscription payment for ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_RENEWAL':
            description = `Monthly renewal for ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_UPGRADE':
            description = `Upgrade to ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_DOWNGRADE':
            description = `Downgrade subscription`;
            break;
          case 'SUBSCRIPTION_REFUND':
            description = `Refund for subscription payment`;
            break;
          default:
            description = `Subscription transaction`;
        }
      }

      return {
        'Transaction ID': t.id,
        'Workspace ID': t.workspaceId,
        'Workspace Name': t.workspace?.name || 'Unknown',
        // 'Workspace Email': t.workspace?.email || '',
        'User ID': owner?.id || '',
        'User Email': owner?.email || 'Unknown',
        'User Name': owner?.fullName || '',
        
        // Transaction Details
        'Transaction Type': t.type,
        'Transaction Type Display': t.type.replace(/_/g, ' '),
        'Amount (NGN)': t.amount.toNumber(),
        'Description': description,
        'Status': t.status,
        'Date': new Date(t.createdAt).toLocaleString('en-NG', { 
          timeZone: 'Africa/Lagos',
          dateStyle: 'full',
          timeStyle: 'long'
        }),
        'Date ISO': t.createdAt.toISOString(),
        
        // Subscription Details
        'Subscription ID': t.subscription?.id || '',
        'Plan Tier': t.subscription?.tier || '',
        'Subscription Status': t.subscription?.status || '',
        'Monthly Price': t.subscription?.monthlyPrice?.toNumber() || 0,
        'Current Period Start': t.subscription?.currentPeriodStart?.toISOString() || '',
        'Current Period End': t.subscription?.currentPeriodEnd?.toISOString() || '',
        
        // Invoice Details
        'Invoice ID': t.invoice?.id || '',
        'Invoice Number': t.invoice?.invoiceNumber || '',
        'Invoice Amount': t.invoice?.amount?.toNumber() || 0,
        'Invoice Discount': t.invoice?.discount?.toNumber() || 0,
        'Invoice Final Amount': t.invoice?.finalAmount?.toNumber() || 0,
        'Invoice Currency': t.invoice?.currency || 'NGN',
        'Payment Method': t.invoice?.paymentMethod || '',
        'Payment Reference': t.invoice?.paymentRef || '',
        'Paid At': t.invoice?.paidAt?.toISOString() || '',
        
        // Promo Code Details
        'Promo Code': t.invoice?.promoCode?.code || '',
        'Promo Discount Type': t.invoice?.promoCode?.discountType || '',
        'Promo Discount Value': t.invoice?.promoCode?.discountValue || 0,
        
        // Reference
        'Reference ID': t.referenceId || '',
        
        // Metadata (flattened)
        'Metadata Tier': typeof t.metadata === 'object' && t.metadata ? (t.metadata as any).tier : '',
        'Metadata Plan Amount': typeof t.metadata === 'object' && t.metadata ? (t.metadata as any).planAmount : '',
        'Metadata Discount': typeof t.metadata === 'object' && t.metadata ? (t.metadata as any).discount : '',
        'Metadata Final Amount': typeof t.metadata === 'object' && t.metadata ? (t.metadata as any).finalAmount : '',
      };
    });

    // Calculate summary statistics for the exported data
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + (t['Amount (NGN)'] || 0), 0),
      byType: transactions.reduce((acc: any, t) => {
        const type = t['Transaction Type'];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      byStatus: transactions.reduce((acc: any, t) => {
        const status = t['Status'];
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      dateRange: {
        start: startDate || 'All time',
        end: endDate || 'All time',
      },
    };

    if (format === 'csv') {
      // Create CSV with headers
      const headers = Object.keys(transactions[0] || {}).join(',');
      const rows = transactions.map(t => 
        Object.values(t).map(v => {
          // Handle values that might contain commas or quotes
          if (v === null || v === undefined) return '""';
          const stringValue = String(v);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      );
      
      // Add summary as comments at the top
      const summaryRows = [
        `# Export Summary:`,
        `# Total Transactions: ${summary.totalTransactions}`,
        `# Total Amount: ₦${summary.totalAmount.toLocaleString()}`,
        `# Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`,
        `# Generated: ${new Date().toISOString()}`,
        '',
      ];
      
      const csv = [...summaryRows, headers, ...rows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscription-transactions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // JSON format with summary and data
      const exportData = {
        summary,
        exportDate: new Date().toISOString(),
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
          type: type || null,
          status: status || null,
        },
        transactions,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="subscription-transactions-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error) {
    console.error("[EXPORT_SUBSCRIPTION_TRANSACTIONS]", error);
    return new Response(JSON.stringify({ 
      error: 'Export failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}