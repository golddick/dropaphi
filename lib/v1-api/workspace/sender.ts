import { db } from "@/lib/db";

export interface SenderInfo {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  replyTo?: string;
}

/**
 * Get workspace email sender for OTP
 */
export async function getWorkspaceEmailSender(workspaceId: string): Promise<SenderInfo | null> {
  try {
    // First try to get verified email sender
    const emailSender = await db.emailSender.findFirst({
      where: {
        workspaceId,
        verified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (emailSender) {
      return {
        id: emailSender.id,
        email: emailSender.email,
        name: emailSender.name,
        verified: true,
        replyTo: emailSender.email,
      };
    }

    // Fallback to workspace email
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { email: true, name: true },
    });

    if (workspace?.email) {
      return {
        id: "workspace",
        email: workspace.email,
        name: workspace.name || "Workspace",
        verified: false,
        replyTo: workspace.email,
      };
    }

    // Final fallback to system defaults
    return {
      id: "system",
      email: process.env.MAIL_FROM || "noreply@dropapi.com",
      name: process.env.NAME_FROM || "DropAPI",
      verified: false,
      replyTo: process.env.MAIL_FROM || "noreply@dropapi.com",
    };
  } catch (error) {
    console.error("[WORKSPACE_SENDER_ERROR]", error);
    return null;
  }
}

/**
 * Check workspace OTP limit
 */
export async function checkWorkspaceOTPLimit(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      otpLimit: true,
      currentOtpSent: true,
    },
  });

  if (!workspace) {
    return { allowed: false, current: 0, limit: 0, remaining: 0 };
  }

  const remaining = workspace.otpLimit - workspace.currentOtpSent;
  
  return {
    allowed: remaining > 0,
    current: workspace.currentOtpSent,
    limit: workspace.otpLimit,
    remaining: Math.max(0, remaining),
  };
}


/**
 * Check workspace email limit
 */
export async function checkWorkspaceEmailLimit(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      emailLimit: true,
      currentEmailsSent: true,
    },
  });

  if (!workspace) {
    return { allowed: false, current: 0, limit: 0, remaining: 0 };
  }

  const remaining = workspace.emailLimit - workspace.currentEmailsSent;
  
  return {
    allowed: remaining > 0,
    current: workspace.currentEmailsSent,
    limit: workspace.emailLimit,
    remaining: Math.max(0, remaining),
  };
}