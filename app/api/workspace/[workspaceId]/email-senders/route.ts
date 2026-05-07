// app/api/workspace/[workspaceId]/email-senders/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { err, ok, serverError, validationError } from "@/lib/respond/response";

const createSenderSchema = z.object({
  email: z.string().min(1), // Can be email or domain
  name: z.string().min(1).max(100),
  isDomain: z.boolean().default(false),
});

// GET /api/workspace/[workspaceId]/email-senders - List all senders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace access
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId,
        },
      },
    });

    if (!member) {
      return err("Workspace not found or access denied", 404);
    }

    const senders = await db.emailSender.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ senders });
  } catch (error) {
    console.error("[LIST_EMAIL_SENDERS]", error);
    return serverError();
  }
}

// POST /api/workspace/[workspaceId]/email-senders - Create new sender
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace access (only owners/admins can add senders)
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId,
        },
      },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return err("Only owners and admins can add email senders", 403);
    }

    const body = await req.json();
    const parsed = createSenderSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const isDomain = parsed.data.isDomain || !parsed.data.email.includes('@');
    const emailValue = isDomain ? parsed.data.email : parsed.data.email.toLowerCase();

    // Check if sender already exists
    const existing = await db.emailSender.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email: emailValue,
        },
      },
    });

    if (existing) {
      return err("Email sender already exists", 400);
    }

    const sender = await db.emailSender.create({
      data: {
        id: dropid('esd'),
        workspaceId,
        email: emailValue,
        name: parsed.data.name,
        verified: false,
        isDomain: isDomain,
        // If it's a domain, we might want to pre-fill the tokens/records
        dkimTokens: isDomain ? ['dropaphi'] : [], 
        spfRecord: isDomain ? 'v=spf1 include:_spf.dropaphi.xyz ~all' : null,
      },
    });

    return ok({ sender }, "Email sender created successfully");
  } catch (error) {
    console.error("[CREATE_EMAIL_SENDER]", error);
    return serverError();
  }
}