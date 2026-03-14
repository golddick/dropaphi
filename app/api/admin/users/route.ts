import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      where.status = status;
    }

    // Get total count for pagination
    const totalUsers = await db.user.count({ where });

    // Get users with their workspaces
    const users = await db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        workspaceMembers: {
          include: {
            workspace: {
              include: {
                members: {
                  select: {
                    role: true,
                    user: {
                      select: {
                        id: true,
                        email: true,
                        fullName: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data for the frontend
    const transformedUsers = users.map(user => {
      // Get workspace memberships with workspace details
      const workspaces = user.workspaceMembers.map(wm => {
        const workspace = wm.workspace;
        
        // Calculate member count from workspace members array
        const memberCount = workspace.members?.length || 0;
        
        // Get owners/admins for workspace info
        const workspaceOwners = workspace.members
          ?.filter(m => m.role === 'OWNER' || m.role === 'ADMIN')
          .map(m => ({
            id: m.user.id,
            name: m.user.fullName,
            email: m.user.email,
          })) || [];

        return {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          plan: workspace.plan || 'FREE',
          status: workspace.isActive ? 'ACTIVE' : 'INACTIVE',
          role: wm.role,
          joinedAt: wm.joinedAt?.toISOString().split('T')[0] || wm.createdAt.toISOString().split('T')[0],
          memberCount: memberCount,
          owners: workspaceOwners,
          createdAt: workspace.createdAt.toISOString(),
        };
      });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        status: user.status.toLowerCase(),
        role: user.role.toLowerCase(),
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        joinedAt: user.createdAt.toISOString().split('T')[0],
        twoFactorEnabled: user.twoFactorEnabled,
        workspaces: workspaces,
        workspaceCount: workspaces.length,
      };
    });

    // Calculate statistics
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const pendingUsers = users.filter(u => u.status === 'PENDING_VERIFICATION').length;
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;

    // Get counts by role
    const countsByRole = await db.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get counts by status
    const countsByStatus = await db.user.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get recent activity (users who logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActiveUsers = await db.user.count({
      where: {
        lastLoginAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return ok({
      users: transformedUsers,
      stats: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        recentActive: recentActiveUsers,
      },
      breakdown: {
        byRole: countsByRole.map(item => ({
          role: item.role.toLowerCase(),
          count: item._count,
        })),
        byStatus: countsByStatus.map(item => ({
          status: item.status.toLowerCase(),
          count: item._count,
        })),
      },
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_USERS]", error);
    return serverError();
  }
}