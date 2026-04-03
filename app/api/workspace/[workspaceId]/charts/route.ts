// import { NextRequest } from "next/server";
// import { db } from "@/lib/db";
// import { requireAuth } from "@/lib/auth/auth-server";
// import { ok, unauthorized, notFound, serverError } from "@/lib/respond/response";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { workspaceId: string } }
// ) {
//   try {
//    const auth = await requireAuth();
//     if (auth instanceof Response) return auth;

//     const { workspaceId } = params;
//     const searchParams = req.nextUrl.searchParams;
//     const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

//     // Check workspace access
//     const membership = await db.workspaceMember.findFirst({
//       where: {
//         workspaceId,
//         userId: auth.userId,
//       },
//     });

//     if (!membership) {
//       return notFound("Workspace not found");
//     }

//     // Calculate date range
//     const endDate = new Date();
//     const startDate = new Date();
    
//     switch (period) {
//       case '7d':
//         startDate.setDate(endDate.getDate() - 7);
//         break;
//       case '30d':
//         startDate.setDate(endDate.getDate() - 30);
//         break;
//       case '90d':
//         startDate.setDate(endDate.getDate() - 90);
//         break;
//       default:
//         startDate.setDate(endDate.getDate() - 30);
//     }

//     // Get SMS data
//     const smsData = await db.smsMessage.groupBy({
//       by: ['createdAt'],
//       where: {
//         workspaceId,
//         createdAt: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//       _count: true,
//     });

//     // Get Email data
//     const emailData = await db.email.groupBy({
//       by: ['createdAt'],
//       where: {
//         workspaceId,
//         createdAt: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//       _count: true,
//     });

//     // Get OTP data
//     const otpData = await db.otpRequest.groupBy({
//       by: ['createdAt'],
//       where: {
//         workspaceId,
//         createdAt: {
//           gte: startDate,
//           lte: endDate,
//         },
//       },
//       _count: true,
//     });

//     // Format data for charts (group by day)
//     const chartData = [];
//     const currentDate = new Date(startDate);

//     while (currentDate <= endDate) {
//       const dateStr = currentDate.toISOString().split('T')[0];
      
//       chartData.push({
//         date: dateStr,
//         sms: smsData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
//         email: emailData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
//         otp: otpData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
//       });

//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     return ok({
//       period,
//       data: chartData,
//     });
//   } catch (error) {
//     console.error("[WORKSPACE_CHARTS]", error);
//     return serverError();
//   }
// }





// app/api/workspace/[workspaceId]/charts/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, notFound, serverError } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    if (!workspaceId) {
      return notFound("Workspace ID required");
    }

    // Check if user has access to this workspace
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!membership) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get daily data for the period
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const chartData = [];

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      
      const dateStr = currentDate.toISOString().split('T')[0];

      // Get SMS count for this day
      const smsCount = await db.smsMessage.count({
        where: {
          workspaceId,
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      // Get Email count for this day
      const emailCount = await db.email.count({
        where: {
          workspaceId,
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      // Get Email opens for this day
      const emailOpens = await db.emailTrackingEvent.count({
        where: {
          email: {
            workspaceId,
          },
          event: 'OPEN',
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      // Get Email clicks for this day
      const emailClicks = await db.emailTrackingEvent.count({
        where: {
          email: {
            workspaceId,
          },
          event: 'CLICK',
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      // Get OTP count for this day
      const otpCount = await db.otpRequest.count({
        where: {
          workspaceId,
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      // Get new subscribers for this day
      const newSubscribers = await db.subscriber.count({
        where: {
          workspaceId,
          createdAt: {
            gte: currentDate,
            lt: nextDate,
          },
        },
      });

      chartData.push({
        date: dateStr,
        sms: smsCount,
        email: emailCount,
        otp: otpCount,
        emailOpens,
        emailClicks,
        newSubscribers,
      });
    }

    // Calculate totals
    const totals = {
      sms: chartData.reduce((sum, d) => sum + d.sms, 0),
      email: chartData.reduce((sum, d) => sum + d.email, 0),
      otp: chartData.reduce((sum, d) => sum + d.otp, 0),
      emailOpens: chartData.reduce((sum, d) => sum + d.emailOpens, 0),
      emailClicks: chartData.reduce((sum, d) => sum + d.emailClicks, 0),
      newSubscribers: chartData.reduce((sum, d) => sum + d.newSubscribers, 0),
    };

    // Calculate open rate and click rate
    const openRate = totals.email > 0 ? (totals.emailOpens / totals.email) * 100 : 0;
    const clickRate = totals.email > 0 ? (totals.emailClicks / totals.email) * 100 : 0;

    return ok({
      data: chartData,
      totals,
      rates: {
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
      },
      period,
    });
  } catch (error) {
    console.error("[WORKSPACE_CHARTS]", error);
    return serverError();
  }
}