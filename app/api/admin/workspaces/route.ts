import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { dropid } from "dropid";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (plan !== 'all') {
      where.plan = plan;
    }

    // Get total count for pagination
    const totalWorkspaces = await db.workspace.count({ where });

    // Get workspaces with their members and subscription
    const workspaces = await db.workspace.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              }
            }
          }
        },
        subscription: true,
        wallet: true,
      }
    });

    // Transform the data
    const transformedWorkspaces = workspaces.map(workspace => {
      const owners = workspace.members
        .filter(m => m.role === 'OWNER' || m.role === 'ADMIN')
        .map(m => ({
          id: m.user.id,
          name: m.user.fullName,
          email: m.user.email,
        }));

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        email: workspace.email,
        plan: workspace.plan,
        isActive: workspace.isActive,
        memberCount: workspace.members.length,
        owners,
        currentEmailsSent: workspace.currentEmailsSent,
        currentSmsSent: workspace.currentSmsSent,
        currentSubscribers: workspace.currentSubscribers,
        emailLimit: workspace.emailLimit,
        smsLimit: workspace.smsLimit,
        subscriberLimit: workspace.subscriberLimit,
        wallet: workspace.wallet ? {
          balance: workspace.wallet.balance.toNumber(),
          updatedAt: workspace.wallet.updatedAt.toISOString(),
        } : null,
        subscription: workspace.subscription ? {
          tier: workspace.subscription.tier,
          status: workspace.subscription.status,
          currentPeriodEnd: workspace.subscription.currentPeriodEnd.toISOString(),
        } : null,
        createdAt: workspace.createdAt.toISOString(),
      };
    });

    return ok({
      workspaces: transformedWorkspaces,
      stats: {
        total: totalWorkspaces,
        active: workspaces.filter(w => w.isActive).length,
      },
      pagination: {
        page,
        limit,
        total: totalWorkspaces,
        pages: Math.ceil(totalWorkspaces / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_WORKSPACES]", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { workspaceId, amount, type, reason } = body; // type: 'CREDIT' | 'DEBIT'

    const wallet = await db.wallet.findUnique({
      where: { workspaceId }
    });

    if (!wallet) {
      return serverError('Wallet not found for this workspace');
    }

    const adjustment = parseFloat(amount);
    const currentBalance = wallet.balance.toNumber();
    const newBalance = type === 'CREDIT' 
      ? currentBalance + adjustment 
      : currentBalance - adjustment;

    const updatedWallet = await db.wallet.update({
      where: { workspaceId },
      data: { balance: newBalance }
    });

    // Log the adjustment in usage logs
    await db.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId,
        service: 'CREDIT_ADJUSTMENT',
        month: new Date().toISOString().slice(0, 7),
        metadata: {
          previousBalance: currentBalance,
          newBalance,
          adjustment: type === 'CREDIT' ? adjustment : -adjustment,
          reason,
          adminId: (auth as any).userId || 'admin'
        }
      }
    });

    return ok(updatedWallet);
  } catch (error) {
    console.error('[ADMIN_WORKSPACES_POST]', error);
    return serverError('Failed to adjust credits');
  }
}
