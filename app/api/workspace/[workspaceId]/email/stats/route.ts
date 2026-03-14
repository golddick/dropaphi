// app/api/workspace/[workspaceId]/email/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { emailService } from "@/lib/email/service/email-stats";



// ========================================
// GET /api/workspace/[workspaceId]/email/stats
// Get email statistics
// ======================================== 

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stats = await emailService.getCampaignStats(workspaceId); 

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { stats } 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[EMAIL_STATS_ERROR]", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}