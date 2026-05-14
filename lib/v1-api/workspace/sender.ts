// lib/billing/workspace.ts
import { BillingService } from "@/lib/billing/billing-service";
import { db } from "@/lib/db";
import { Services } from "@/lib/generated/prisma";

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
      email: process.env.MAIL_FROM || "mailby@dropaphi.xyz",
      name: process.env.NAME_FROM || "DropAphi",
      verified: false,
      replyTo: process.env.MAIL_FROM || "mailby@dropaphi.xyz",
    };
  } catch (error) {
    console.error("[WORKSPACE_SENDER_ERROR]", error);
    return null;
  }
}

/**
 * Check workspace OTP limit using BillingService
 */
export async function checkWorkspaceOTPLimit(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.OTP, 1);
    
    return {
      allowed: result.success,
      current: result.used,
      limit: result.limit,
      remaining: result.remaining,
      serviceCreditsAvailable: result.serviceCreditsAvailable,
      balanceAvailable: result.balanceAvailable,
    };
  } catch (error) {
    console.error("[WORKSPACE_OTP_LIMIT_ERROR]", error);
    return {
      allowed: false,
      current: 0,
      limit: 0,
      remaining: 0,
      serviceCreditsAvailable: 0,
      balanceAvailable: 0,
    };
  }
}

/**
 * Check workspace email limit using BillingService
 */
export async function checkWorkspaceEmailLimit(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.EMAIL, 1);
    
    return {
      allowed: result.success,
      current: result.used,
      limit: result.limit,
      remaining: result.remaining,
      serviceCreditsAvailable: result.serviceCreditsAvailable,
      balanceAvailable: result.balanceAvailable,
    };
  } catch (error) {
    console.error("[WORKSPACE_EMAIL_LIMIT_ERROR]", error);
    return {
      allowed: false,
      current: 0,
      limit: 0,
      remaining: 0,
      serviceCreditsAvailable: 0,
      balanceAvailable: 0,
    };
  }
}

/**
 * Check workspace SMS limit using BillingService
 */
export async function checkWorkspaceSMSLimit(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.SMS, 1);
    
    return {
      allowed: result.success,
      current: result.used,
      limit: result.limit,
      remaining: result.remaining,
      serviceCreditsAvailable: result.serviceCreditsAvailable,
      balanceAvailable: result.balanceAvailable,
    };
  } catch (error) {
    console.error("[WORKSPACE_SMS_LIMIT_ERROR]", error);
    return {
      allowed: false,
      current: 0,
      limit: 0,
      remaining: 0,
      serviceCreditsAvailable: 0,
      balanceAvailable: 0,
    };
  }
}

/**
 * Check workspace storage limit using BillingService
 */
export async function checkWorkspaceStorageLimit(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.STORAGE, units);
    
    return {
      allowed: result.success,
      current: result.used,
      limit: result.limit,
      remaining: result.remaining,
      serviceCreditsAvailable: result.serviceCreditsAvailable,
      balanceAvailable: result.balanceAvailable,
    };
  } catch (error) {
    console.error("[WORKSPACE_STORAGE_LIMIT_ERROR]", error);
    return {
      allowed: false,
      current: 0,
      limit: 0,
      remaining: 0,
      serviceCreditsAvailable: 0,
      balanceAvailable: 0,
    };
  }
}




// import { db } from "@/lib/db";
// import { UsageService } from "@/lib/billing/usage";

// export interface SenderInfo {
//   id: string;
//   email: string;
//   name: string;
//   verified: boolean;
//   replyTo?: string;
// }

// /**
//  * Get workspace email sender for OTP
//  */
// export async function getWorkspaceEmailSender(workspaceId: string): Promise<SenderInfo | null> {
//   try {
//     // First try to get verified email sender
//     const emailSender = await db.emailSender.findFirst({
//       where: {
//         workspaceId,
//         verified: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     if (emailSender) {
//       return {
//         id: emailSender.id,
//         email: emailSender.email,
//         name: emailSender.name,
//         verified: true,
//         replyTo: emailSender.email,
//       };
//     }

//     // Fallback to workspace email
//     const workspace = await db.workspace.findUnique({
//       where: { id: workspaceId },
//       select: { email: true, name: true },
//     });

//     if (workspace?.email) {
//       return {
//         id: "workspace",
//         email: workspace.email,
//         name: workspace.name || "Workspace",
//         verified: false,
//         replyTo: workspace.email,
//       };
//     }

//     // Final fallback to system defaults
//     return {
//       id: "system",
//       email: process.env.MAIL_FROM || "noreply@dropaphi.com",
//       name: process.env.NAME_FROM || "DropAphi",
//       verified: false,
//       replyTo: process.env.MAIL_FROM || "noreply@dropaphi.com",
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_SENDER_ERROR]", error);
//     return null;
//   }
// }

// /**
//  * Check workspace OTP limit
//  */
// export async function checkWorkspaceOTPLimit(workspaceId: string): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
// }> {
//   const status = await UsageService.checkUsage(workspaceId, "otp");
  
//   return {
//     allowed: status.allowed,
//     current: status.current,
//     limit: status.limit,
//     remaining: status.remaining,
//   };
// }


// /**
//  * Check workspace email limit
//  */
// export async function checkWorkspaceEmailLimit(workspaceId: string): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
// }> {
//   const status = await UsageService.checkUsage(workspaceId, "email");
  
//   return {
//     allowed: status.allowed,
//     current: status.current,
//     limit: status.limit,
//     remaining: status.remaining,
//   };
// }