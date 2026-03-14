import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user statistics
    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({
      where: { status: 'ACTIVE' }
    });
    const pendingUsers = await db.user.count({
      where: { status: 'PENDING_VERIFICATION' }
    });
    const suspendedUsers = await db.user.count({
      where: { status: 'SUSPENDED' }
    });
    
    // Users joined in the period
    const newUsers = await db.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get workspace statistics
    const totalWorkspaces = await db.workspace.count();
    const activeWorkspaces = await db.workspace.count({
      where: { isActive: true }
    });
    
    // Workspaces created in the period
    const newWorkspaces = await db.workspace.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Subscription statistics
    const subscriptionsByTier = await db.workspace.groupBy({
      by: ['plan'],
      _count: true,
      where: {
        plansubscriptionStatus: 'ACTIVE'
      }
    });

    // Revenue statistics
    const totalRevenue = await db.subscriptionTransaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE']
        }
      },
      _sum: { amount: true }
    });

    const revenueThisPeriod = await db.subscriptionTransaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE']
        },
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    });

    const refundsThisPeriod = await db.subscriptionTransaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: 'SUBSCRIPTION_REFUND',
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    });

    // Transaction statistics
    const pendingTransactions = await db.subscriptionTransaction.count({
      where: { status: 'PENDING' }
    });

    const failedTransactions = await db.subscriptionTransaction.count({
      where: { status: 'FAILED' }
    });

    // API usage statistics
    const totalApiCalls = await db.aPiUsageSummary.aggregate({
      _sum: { totalCalls: true }
    });

    const apiCallsThisPeriod = await db.aPiUsageSummary.aggregate({
      where: {
        date: { gte: startDate }
      },
      _sum: { totalCalls: true }
    });

    // Communication statistics
    const totalEmailsSent = await db.email.count();
    const emailsSentThisPeriod = await db.email.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    const totalSmsSent = await db.smsMessage.count();
    const smsSentThisPeriod = await db.smsMessage.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // User growth chart data (last 30 days)
    const userGrowthData = await getUserGrowthData(period);
    
    // Revenue chart data
    const revenueChartData = await getRevenueChartData(period);
    
    // Recent users
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
        avatarUrl: true,
        workspaceMembers: {
          take: 1,
          select: {
            workspace: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Recent transactions
    const recentTransactions = await db.subscriptionTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: {
          select: {
            name: true
          }
        }
      }
    });

    // System alerts
    const systemAlerts = await getSystemAlerts();

    // Top workspaces by usage
    const topWorkspaces = await db.workspace.findMany({
      take: 5,
      orderBy: [
        { currentEmailsSent: 'desc' },
        { currentSmsSent: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        currentEmailsSent: true,
        currentSmsSent: true,
        currentSubscribers: true,
        members: {
          select: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return ok({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
          new: newUsers,
          growth: calculateGrowth(totalUsers, newUsers)
        },
        workspaces: {
          total: totalWorkspaces,
          active: activeWorkspaces,
          new: newWorkspaces,
          byTier: subscriptionsByTier.map(item => ({
            tier: item.plan,
            count: item._count
          }))
        },
        revenue: {
          total: totalRevenue._sum.amount?.toNumber() || 0,
          thisPeriod: revenueThisPeriod._sum.amount?.toNumber() || 0,
          refunds: refundsThisPeriod._sum.amount?.toNumber() || 0,
          net: (revenueThisPeriod._sum.amount?.toNumber() || 0) - 
               (refundsThisPeriod._sum.amount?.toNumber() || 0)
        },
        transactions: {
          pending: pendingTransactions,
          failed: failedTransactions
        },
        api: {
          totalCalls: totalApiCalls._sum.totalCalls || 0,
          thisPeriod: apiCallsThisPeriod._sum.totalCalls || 0
        },
        communications: {
          emails: {
            total: totalEmailsSent,
            thisPeriod: emailsSentThisPeriod
          },
          sms: {
            total: totalSmsSent,
            thisPeriod: smsSentThisPeriod
          }
        }
      },
      charts: {
        userGrowth: userGrowthData,
        revenue: revenueChartData
      },
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        status: user.status.toLowerCase(),
        joinedAt: user.createdAt.toISOString().split('T')[0],
        avatarUrl: user.avatarUrl,
        workspace: user.workspaceMembers[0]?.workspace?.name || 'No workspace'
      })),
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        workspaceName: t.workspace.name,
        type: t.type,
        amount: t.amount.toNumber(),
        status: t.status.toLowerCase(),
        createdAt: t.createdAt.toISOString().split('T')[0]
      })),
      topWorkspaces: topWorkspaces.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        plan: w.plan,
        emailsSent: w.currentEmailsSent,
        smsSent: w.currentSmsSent,
        subscribers: w.currentSubscribers,
        owner: w.members[0]?.user?.fullName || 'Unknown'
      })),
      alerts: systemAlerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD]', error);
    return serverError();
  }
}

// Helper functions
async function getUserGrowthData(period: string) {
  const now = new Date();
  const points = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 12 : 12;
  const interval = period === '7d' ? 'day' : period === '30d' ? 'day' : period === '90d' ? 'week' : 'month';
  
  const data = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date();
    if (interval === 'day') {
      date.setDate(now.getDate() - i);
    } else if (interval === 'week') {
      date.setDate(now.getDate() - (i * 7));
    } else {
      date.setMonth(now.getMonth() - i);
    }
    
    const nextDate = new Date(date);
    if (interval === 'day') {
      nextDate.setDate(date.getDate() + 1);
    } else if (interval === 'week') {
      nextDate.setDate(date.getDate() + 7);
    } else {
      nextDate.setMonth(date.getMonth() + 1);
    }
    
    const count = await db.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });
    
    data.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  return data;
}

async function getRevenueChartData(period: string) {
  const now = new Date();
  const points = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 12 : 12;
  const interval = period === '7d' ? 'day' : period === '30d' ? 'day' : period === '90d' ? 'week' : 'month';
  
  const data = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date();
    if (interval === 'day') {
      date.setDate(now.getDate() - i);
    } else if (interval === 'week') {
      date.setDate(now.getDate() - (i * 7));
    } else {
      date.setMonth(now.getMonth() - i);
    }
    
    const nextDate = new Date(date);
    if (interval === 'day') {
      nextDate.setDate(date.getDate() + 1);
    } else if (interval === 'week') {
      nextDate.setDate(date.getDate() + 7);
    } else {
      nextDate.setMonth(date.getMonth() + 1);
    }
    
    const revenue = await db.subscriptionTransaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE']
        },
        createdAt: {
          gte: date,
          lt: nextDate
        }
      },
      _sum: { amount: true }
    });
    
    data.push({
      date: date.toISOString().split('T')[0],
      amount: revenue._sum.amount?.toNumber() || 0
    });
  }
  
  return data;
}

async function getSystemAlerts() {
  const alerts = [];
  
  // Check for failed transactions
  const failedTransactions = await db.subscriptionTransaction.count({
    where: {
      status: 'FAILED',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    }
  });
  
  if (failedTransactions > 0) {
    alerts.push({
      id: 'alert_001',
      type: 'error',
      message: `${failedTransactions} failed transaction${failedTransactions > 1 ? 's' : ''} in the last 24 hours`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for pending verifications
  const pendingUsers = await db.user.count({
    where: { status: 'PENDING_VERIFICATION' }
  });
  
  if (pendingUsers > 10) {
    alerts.push({
      id: 'alert_002',
      type: 'warning',
      message: `${pendingUsers} users pending verification`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for high API usage
  const highUsageWorkspaces = await db.workspace.count({
    where: {
      currentEmailsSent: {
        gte: db.workspace.fields.emailLimit // Assuming emailLimit field exists
      }
    }
  });
  
  if (highUsageWorkspaces > 0) {
    alerts.push({
      id: 'alert_003',
      type: 'info',
      message: `${highUsageWorkspaces} workspaces near usage limits`,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

function calculateGrowth(total: number, new_: number) {
  if (total === 0) return 0;
  return Math.round((new_ / total) * 100);
}