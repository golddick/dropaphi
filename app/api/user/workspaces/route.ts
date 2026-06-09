// app/api/user/workspaces/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, validationError } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";
import { SubscriptionStatus, SubscriptionTier } from "@/lib/generated/prisma";

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
        storageLimit: true,
        smsLimit: true,
        otpLimit: true,
        blogLimit: true,
        pushLimit: true,
        aiLimit: true,
        currentSubscribers: true,
        currentEmailsSent: true,
        currentStorageUsed: true,
        currentSmsSent: true,
        currentOtpSent: true,
        currentAiCalls: true,
        currentBlogsCount: true,
        currentPushSent: true,
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
        storage: {
          limit: w.storageLimit,
          used: w.currentStorageUsed,
          remaining: Math.max(0, w.storageLimit - w.currentStorageUsed),
          percentage:
            w.storageLimit > 0
              ? (w.currentStorageUsed / w.storageLimit) * 100
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
        blog: {
          limit: w.blogLimit,
          used: w.currentBlogsCount,
          remaining: Math.max(0, w.blogLimit - w.currentBlogsCount),
          percentage:
            w.blogLimit > 0
              ? (w.currentBlogsCount / w.blogLimit) * 100
              : 0,
        },
        push: {
          limit: w.pushLimit,
          used: w.currentPushSent,
          remaining: Math.max(0, w.pushLimit - w.currentPushSent),
          percentage:
            w.pushLimit > 0
              ? (w.currentPushSent / w.pushLimit) * 100
              : 0,
        },
        ai: {
          limit: w.aiLimit,
          used: w.currentAiCalls,
          remaining: Math.max(0, w.aiLimit - w.currentAiCalls),
          percentage:
            w.aiLimit > 0
              ? (w.currentAiCalls / w.aiLimit) * 100
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

    // Fetch FREE plan from database instead of hardcoded function
    const freePlan = await db.plan.findFirst({
      where: {
        tier: SubscriptionTier.FREE,
        isActive: true,
        isArchived: false,
      },
    });

    if (!freePlan) {
      console.error("[CREATE_WORKSPACE] FREE plan not found in database");
      return serverError("FREE plan configuration missing. Please contact support.");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const result = await db.$transaction(async (tx) => {
      // Create workspace with limits from database plan
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
          plan: SubscriptionTier.FREE,
          planSubscriptionStatus: "INACTIVE",

          // Set limits from FREE plan in database
          subscriberLimit: freePlan.subscriberLimit,
          emailLimit: freePlan.emailLimit,
          storageLimit: freePlan.storageLimit,
          smsLimit: freePlan.smsLimit,
          otpLimit: freePlan.otpLimit,
          blogLimit: freePlan.blogLimit,
          pushLimit: freePlan.pushLimit,
          aiLimit: freePlan.aiLimit,

          // Initialize current usage counters
          currentSubscribers: 0,
          currentEmailsSent: 0,
          currentStorageUsed: 0,
          currentSmsSent: 0,
          currentOtpSent: 0,
          currentAiCalls: 0,
          currentBlogsCount: 0,
          currentPushSent: 0,
        },
      });

      // Add user as workspace owner
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

      // Create workspace subscription
      const subscription = await tx.workspaceSubscription.create({
        data: {
          id: dropid("sub"),
          workspaceId: workspace.id,
          tier: SubscriptionTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: freePlan.price,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          planId: freePlan.id,
        },
      });

      // Create monthly usage records for each service
      const services = [
        { service: "SUBSCRIBERS", limit: freePlan.subscriberLimit, field: "subscriberLimit" },
        { service: "EMAIL", limit: freePlan.emailLimit, field: "emailLimit" },
        { service: "STORAGE", limit: freePlan.storageLimit, field: "storageLimit" },
        { service: "SMS", limit: freePlan.smsLimit, field: "smsLimit" },
        { service: "OTP", limit: freePlan.otpLimit, field: "otpLimit" },
        { service: "BLOG", limit: freePlan.blogLimit, field: "blogLimit" },
        { service: "PUSH", limit: freePlan.pushLimit, field: "pushLimit" },
        { service: "AI", limit: freePlan.aiLimit, field: "aiLimit" },
      ];

      for (const { service, limit } of services) {
        await tx.monthlyUsage.upsert({
          where: {
            workspaceId_service_month: {
              workspaceId: workspace.id,
              service: service as any,
              month: month,
            },
          },
          update: {
            updatedAt: new Date(),
            // Set the appropriate limit field based on service
            ...(service === "SUBSCRIBERS" && { subscriberLimit: limit }),
            ...(service === "EMAIL" && { emailLimit: limit }),
            ...(service === "STORAGE" && { storageLimit: limit }),
            ...(service === "SMS" && { smsLimit: limit }),
            ...(service === "OTP" && { otpLimit: limit }),
            ...(service === "BLOG" && { blogLimit: limit }),
            ...(service === "PUSH" && { pushLimit: limit }),
            ...(service === "AI" && { aiLimit: limit }),
          },
          create: {
            id: dropid("musg"),
            workspaceId: workspace.id,
            service: service as any,
            month: month,
            subscriberLimit: service === "SUBSCRIBERS" ? limit : 0,
            emailLimit: service === "EMAIL" ? limit : 0,
            storageLimit: service === "STORAGE" ? limit : 0,
            smsLimit: service === "SMS" ? limit : 0,
            otpLimit: service === "OTP" ? limit : 0,
            blogLimit: service === "BLOG" ? limit : 0,
            pushLimit: service === "PUSH" ? limit : 0,
            aiLimit: service === "AI" ? limit : 0,
            currentSubscribers: 0,
            currentEmailsSent: 0,
            currentStorageUsed: 0,
            currentSmsSent: 0,
            currentOtpSent: 0,
            currentAiCalls: 0,
            currentBlogsCount: 0,
            currentPushSent: 0,
            topUpUnitsUsed: 0,
            topUpCost: 0,
          },
        });
      }

      // Create wallet for workspace
      await tx.wallet.create({
        data: {
          id: dropid("wlt"),
          workspaceId: workspace.id,
          balance: 0,
          emailCredits: 0,
          smsCredits: 0,
          otpCredits: 0,
          blogCredits: 0,
          pushCredits: 0,
          aiCredits: 0,
          storageCredits: 0,
        },
      });

      // Log workspace creation
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
          currentApiCalls: 0,
          currentBlogsCount: 0,
          currentPushSent: 0,
          duration: 0,
          ipAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip"),
          userAgent: req.headers.get("user-agent"),
          metadata: {
            event: "workspace_created",
            createdBy: auth.userId,
            plan: "FREE",
            planId: freePlan.id,
          },
          createdAt: new Date(),
        },
      });

      return { workspace, subscription, freePlan };
    });

    // Format features from the plan's JSON field
    const features = result.freePlan.features as any || {
      api_access: true,
      email_support: true,
      community_access: true,
    };

    return ok(
      {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
        createdAt: result.workspace.createdAt.toISOString(),
        role: "OWNER",
        limits: { 
          subscribers: result.workspace.subscriberLimit,
          emails: result.workspace.emailLimit,
          storage: result.workspace.storageLimit,
          sms: result.workspace.smsLimit,
          otp: result.workspace.otpLimit,
          blog: result.workspace.blogLimit,
          push: result.workspace.pushLimit,
          ai: result.workspace.aiLimit,
        },
        subscription: {
          id: result.subscription.id,
          tier: result.subscription.tier,
          status: result.subscription.status,
          monthlyPrice: Number(result.subscription.monthlyPrice),
          periodStart: result.subscription.currentPeriodStart.toISOString(),
          periodEnd: result.subscription.currentPeriodEnd.toISOString(),
        },
        features: features,
      },
      "Workspace created successfully with FREE plan",
      201
    );
  } catch (error) {
    console.error("[CREATE_WORKSPACE]", error);
    return serverError();
  }
}