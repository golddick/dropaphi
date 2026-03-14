







// app/api/user/workspaces/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, validationError } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";
import { SubscriptionTier, SubscriptionStatus } from "@/lib/generated/prisma/enums";
import { getPlanByTier } from "@/lib/billing/plan";

// ================= HELPERS =================

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const exists = await db.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ================= GET =================

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: { userId: auth.userId },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        teamSize: true,
        description: true,
        logoUrl: true,
        subscriberLimit: true,
        emailLimit: true,
        fileLimit: true,
        smsLimit: true,
        otpLimit: true,
        currentSubscribers: true,
        currentEmailsSent: true,
        currentFilesUsed: true,
        currentSmsSent: true,
        currentOtpSent: true,
        timezone: true,
        isActive: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            tier: true,
            status: true,
            monthlyPrice: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
        members: {
          where: { userId: auth.userId },
          select: { role: true, joinedAt: true },
        },
        _count: {
          select: {
            members: true,
            apiKeys: true,
            subscribers: true,
            files: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedWorkspaces = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      website: w.website || undefined,
      industry: w.industry || "",
      teamSize: w.teamSize || undefined,
      description: w.description || undefined,
      logo: w.logoUrl || undefined,
      createdAt: w.createdAt.toISOString(),
      role: w.members[0]?.role ?? "MEMBER",
      joinedAt: w.members[0]?.joinedAt?.toISOString(),

      limits: {
        subscribers: {
          limit: w.subscriberLimit,
          used: w.currentSubscribers,
          remaining: Math.max(0, w.subscriberLimit - w.currentSubscribers),
          percentage:
            w.subscriberLimit > 0
              ? (w.currentSubscribers / w.subscriberLimit) * 100
              : 0,
        },
        emails: {
          limit: w.emailLimit,
          used: w.currentEmailsSent,
          remaining: Math.max(0, w.emailLimit - w.currentEmailsSent),
          percentage:
            w.emailLimit > 0
              ? (w.currentEmailsSent / w.emailLimit) * 100
              : 0,
        },
        files: {
          limit: w.fileLimit,
          used: w.currentFilesUsed,
          remaining: Math.max(0, w.fileLimit - w.currentFilesUsed),
          percentage:
            w.fileLimit > 0
              ? (w.currentFilesUsed / w.fileLimit) * 100
              : 0,
        },
        sms: {
          limit: w.smsLimit,
          used: w.currentSmsSent,
          remaining: Math.max(0, w.smsLimit - w.currentSmsSent),
          percentage:
            w.smsLimit > 0
              ? (w.currentSmsSent / w.smsLimit) * 100
              : 0,
        },
        otp: {
          limit: w.otpLimit,
          used: w.currentOtpSent,
          remaining: Math.max(0, w.otpLimit - w.currentOtpSent),
          percentage:
            w.otpLimit > 0
              ? (w.currentOtpSent / w.otpLimit) * 100
              : 0,
        },
      },

      subscription: w.subscription
        ? {
            id: w.subscription.id,
            tier: w.subscription.tier,
            status: w.subscription.status,
            monthlyPrice: Number(w.subscription.monthlyPrice),
            periodStart: w.subscription.currentPeriodStart.toISOString(),
            periodEnd: w.subscription.currentPeriodEnd.toISOString(),
          }
        : null,

      counts: {
        members: w._count.members,
        apiKeys: w._count.apiKeys,
        subscribers: w._count.subscribers,
        files: w._count.files,
      },
    }));

    return ok({ workspaces: formattedWorkspaces });
  } catch (error) {
    console.error("[GET_USER_WORKSPACES]", error);
    return serverError();
  }
}

// ================= POST =================

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();

    const workspaceSchema = z.object({
      name: z.string().min(1, "Workspace name is required"),
      website: z.string().optional(),
      industry: z.string().optional(),
      teamSize: z.string().optional(),
      description: z.string().optional(),
    });

    const parsed = workspaceSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, website, industry, teamSize, description } = parsed.data;

    const baseSlug = createSlug(name);
    if (!baseSlug) {
      return new Response(
        JSON.stringify({
          error: "Invalid workspace name. Please use letters and numbers only.",
        }),
        { status: 422 }
      );
    }

    const slug = await generateUniqueSlug(baseSlug);

    const freePlan = getPlanByTier('FREE');
    if (!freePlan) return serverError();

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          id: dropid("wsp"),
          name,
          slug,
          website: website || null,
          industry: industry || null,
          teamSize: teamSize || null,
          description: description || null,
          logoUrl: null,
          isActive: true,
          timezone: "Africa/Lagos",

          // ✅ FIXED — correct mapping
          subscriberLimit: freePlan.limits.subscribers,
          emailLimit: freePlan.limits.email,
          fileLimit: freePlan.limits.storage,
          smsLimit: freePlan.limits.sms,
          otpLimit: freePlan.limits.otp,

          currentSubscribers: 0,
          currentEmailsSent: 0,
          currentFilesUsed: 0,
          currentSmsSent: 0,
          currentOtpSent: 0,
        },
      });

      await tx.workspaceMember.create({
        data: {
          id: dropid("wsm"),
          workspaceId: workspace.id,
          userId: auth.userId,
          role: "OWNER",
          invitedBy: auth.userId,
          joinedAt: new Date(),
        },
      });

      const subscription = await tx.workspaceSubscription.create({
        data: {
          id: dropid("sub"),
          workspaceId: workspace.id,
          tier: 'FREE',
          status: 'ACTIVE',
          monthlyPrice: freePlan.price,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      await tx.usageLog.create({
        data: {
          id: dropid("ulg"),
          workspaceId: workspace.id,
          service: "workspace_creation",
          month,
          currentSubscribers: 0,
          currentEmailsSent: 0,
          currentFilesUsed: 0,
          currentSmsSent: 0,
          currentOtpSent: 0,
          duration: 0,
          ipAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip"),
          userAgent: req.headers.get("user-agent"),
          metadata: {
            event: "workspace_created",
            createdBy: auth.userId,
            plan: "FREE",
          },
          createdAt: new Date(),
        },
      });

      return { workspace, subscription };
    });

    return ok(
      {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
        createdAt: result.workspace.createdAt.toISOString(),
        role: "OWNER",
        subscription: {
          id: result.subscription.id,
          tier: result.subscription.tier,
          status: result.subscription.status,
          monthlyPrice: Number(result.subscription.monthlyPrice),
          periodStart:
            result.subscription.currentPeriodStart.toISOString(),
          periodEnd: result.subscription.currentPeriodEnd.toISOString(),
        },
        features: freePlan.features,
      },
      "Workspace created successfully with FREE plan",
      201
    );
  } catch (error) {
    console.error("[CREATE_WORKSPACE]", error);
    return serverError();
  }
}