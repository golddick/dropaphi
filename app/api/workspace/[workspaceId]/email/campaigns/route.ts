// app/api/workspace/[workspaceId]/email/campaigns/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  templateId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
}); 

// GET /api/workspace/[workspaceId]/email/campaigns
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

    const campaigns = await db.emailCampaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        emails: {
          select: {
            id: true,
            status: true,
            openedAt: true,
            clickedAt: true,
          }
        }
      },
    });

    // Calculate stats for each campaign
    const campaignsWithStats = campaigns.map(campaign => {
      const total = campaign.emails.length;
      const sent = campaign.emails.filter(e => e.status === 'SENT' || e.status === 'DELIVERED').length;
      const opened = campaign.emails.filter(e => e.openedAt).length;
      const clicked = campaign.emails.filter(e => e.clickedAt).length;

      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: 'ACTIVE',
        // scheduledAt: campaign.scheduledAt,
        sentAt: campaign.lastSentAt,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        stats: {
          total,
          sent,
          opened,
          clicked,
          bounced: 0,
        }
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { campaigns: campaignsWithStats } 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[GET_CAMPAIGNS_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


// POST /api/workspace/[workspaceId]/email/campaigns
export async function POST(
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

    const body = await req.json();
    const parsed = createCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: parsed.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, subject, templateId, scheduledAt } = parsed.data;

    const campaignId = dropid('cmp');
    const campaign = await db.emailCampaign.create({
      data: {
        id: campaignId,
        workspaceId,
        name,
        subject,
        status:'ACTIVE'
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { campaign: { ...campaign, stats: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0 } } },
        message: "Campaign created successfully" 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[CREATE_CAMPAIGN_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}