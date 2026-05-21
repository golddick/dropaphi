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

export interface DeductResult {
  success: boolean;
  method?: string;
  cost?: number;
  remainingBalance?: number;
  remainingCredits?: number;
  message?: string;
  error?: string;
  code?: string;
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

// ==================== CHECK FUNCTIONS ====================

/**
 * Check workspace OTP limit using BillingService
 */
export async function checkWorkspaceOTPLimit(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.OTP, units);
    
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
export async function checkWorkspaceEmailLimit(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.EMAIL, units);
    
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
export async function checkWorkspaceSMSLimit(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.SMS, units);
    
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


/**
 * CHECK subscriber limit only (no deduction)
 */
export async function checkWorkspaceSubscriberLimit(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  serviceCreditsAvailable: number;
  balanceAvailable: number;
}> {
  try {
    const result = await BillingService.checkLimit(workspaceId, Services.SUBSCRIBERS, units);
    
    return {
      allowed: result.success,
      current: result.used,
      limit: result.limit,
      remaining: result.remaining,
      serviceCreditsAvailable: result.serviceCreditsAvailable,
      balanceAvailable: result.balanceAvailable,
    };
  } catch (error) {
    console.error("[WORKSPACE_SUBSCRIBER_LIMIT_ERROR]", error);
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


// ==================== DEDUCT FUNCTIONS ====================

/**
 * Deduct OTP credits from workspace
 */
export async function deductWorkspaceOTP(workspaceId: string, units: number = 1): Promise<DeductResult> {
  try {
    const result = await BillingService.deductCredits(workspaceId, Services.OTP, units);
    
    return {
      success: result.success,
      method: result.method,
      cost: result.cost,
      remainingBalance: result.remainingBalance,
      remainingCredits: result.remainingCredits,
      message: result.message,
      error: result.error,
      code: result.code,
    };
  } catch (error) {
    console.error("[WORKSPACE_OTP_DEDUCT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct OTP credits",
    };
  }
}

/**
 * Deduct Email credits from workspace
 */
export async function deductWorkspaceEmail(workspaceId: string, units: number = 1): Promise<DeductResult> {
  try {
    const result = await BillingService.deductCredits(workspaceId, Services.EMAIL, units);
    
    return {
      success: result.success,
      method: result.method,
      cost: result.cost,
      remainingBalance: result.remainingBalance,
      remainingCredits: result.remainingCredits,
      message: result.message,
      error: result.error,
      code: result.code,
    };
  } catch (error) {
    console.error("[WORKSPACE_EMAIL_DEDUCT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct email credits",
    };
  }
}

/**
 * Deduct SMS credits from workspace
 */
export async function deductWorkspaceSMS(workspaceId: string, units: number = 1): Promise<DeductResult> {
  try {
    const result = await BillingService.deductCredits(workspaceId, Services.SMS, units);
    
    return {
      success: result.success,
      method: result.method,
      cost: result.cost,
      remainingBalance: result.remainingBalance,
      remainingCredits: result.remainingCredits,
      message: result.message,
      error: result.error,
      code: result.code,
    };
  } catch (error) {
    console.error("[WORKSPACE_SMS_DEDUCT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct SMS credits",
    };
  }
}

/**
 * Deduct Storage credits from workspace
 */
export async function deductWorkspaceStorage(workspaceId: string, units: number = 1): Promise<DeductResult> {
  try {
    const result = await BillingService.deductCredits(workspaceId, Services.STORAGE, units);
    
    return {
      success: result.success,
      method: result.method,
      cost: result.cost,
      remainingBalance: result.remainingBalance,
      remainingCredits: result.remainingCredits,
      message: result.message,
      error: result.error,
      code: result.code,
    };
  } catch (error) {
    console.error("[WORKSPACE_STORAGE_DEDUCT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct storage credits",
    };
  }
}

/**
 * DEDUCT subscriber credits only (no check)
 */
export async function deductWorkspaceSubscriber(workspaceId: string, units: number = 1): Promise<{
  success: boolean;
  method?: string;
  cost?: number;
  remainingBalance?: number;
  remainingCredits?: number;
  message?: string;
  error?: string;
  code?: string;
}> {
  try {
    const result = await BillingService.deductCredits(workspaceId, Services.SUBSCRIBERS, units);
    
    return {
      success: result.success,
      method: result.method,
      cost: result.cost,
      remainingBalance: result.remainingBalance,
      remainingCredits: result.remainingCredits,
      message: result.message,
      error: result.error,
      code: result.code,
    };
  } catch (error) {
    console.error("[WORKSPACE_SUBSCRIBER_DEDUCT_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct subscriber credits",
    };
  }
}

// ==================== CHECK AND DEDUCT (ATOMIC) FUNCTIONS ====================

/**
 * Check and deduct OTP in one operation (atomic)
 */
export async function checkAndDeductOTP(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  unitsNeeded: number;
  limit: number;
  current: number;
  remaining: number;
  deductionResult?: DeductResult;
  error?: string;
}> {
  // First check
  const checkResult = await checkWorkspaceOTPLimit(workspaceId, units);
  
  if (!checkResult.allowed) {
    return {
      allowed: false,
      unitsNeeded: units,
      limit: checkResult.limit,
      current: checkResult.current,
      remaining: checkResult.remaining,
      error: `Insufficient OTP credits. Need ${units} unit(s), only ${checkResult.remaining} available.`
    };
  }
  
  // Then deduct
  const deductResult = await deductWorkspaceOTP(workspaceId, units);
  
  return {
    allowed: deductResult.success,
    unitsNeeded: units,
    limit: checkResult.limit,
    current: checkResult.current + units,
    remaining: checkResult.remaining - units,
    deductionResult: deductResult,
    error: deductResult.success ? undefined : deductResult.error
  };
}

/**
 * Check and deduct Email in one operation (atomic)
 */
export async function checkAndDeductEmail(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  unitsNeeded: number;
  limit: number;
  current: number;
  remaining: number;
  deductionResult?: DeductResult;
  error?: string;
}> {
  // First check
  const checkResult = await checkWorkspaceEmailLimit(workspaceId, units);
  
  if (!checkResult.allowed) {
    return {
      allowed: false,
      unitsNeeded: units,
      limit: checkResult.limit,
      current: checkResult.current,
      remaining: checkResult.remaining,
      error: `Insufficient email credits. Need ${units} unit(s), only ${checkResult.remaining} available.`
    };
  }
  
  // Then deduct
  const deductResult = await deductWorkspaceEmail(workspaceId, units);
  
  return {
    allowed: deductResult.success,
    unitsNeeded: units,
    limit: checkResult.limit,
    current: checkResult.current + units,
    remaining: checkResult.remaining - units,
    deductionResult: deductResult,
    error: deductResult.success ? undefined : deductResult.error
  };
}

/**
 * Check and deduct SMS in one operation (atomic)
 */
export async function checkAndDeductSMS(workspaceId: string, units: number = 1): Promise<{
  allowed: boolean;
  unitsNeeded: number;
  limit: number;
  current: number;
  remaining: number;
  deductionResult?: DeductResult;
  error?: string;
}> {
  // First check
  const checkResult = await checkWorkspaceSMSLimit(workspaceId, units);
  
  if (!checkResult.allowed) {
    return {
      allowed: false,
      unitsNeeded: units,
      limit: checkResult.limit,
      current: checkResult.current,
      remaining: checkResult.remaining,
      error: `Insufficient SMS credits. Need ${units} unit(s), only ${checkResult.remaining} available.`
    };
  }
  
  // Then deduct
  const deductResult = await deductWorkspaceSMS(workspaceId, units);
  
  return {
    allowed: deductResult.success,
    unitsNeeded: units,
    limit: checkResult.limit,
    current: checkResult.current + units,
    remaining: checkResult.remaining - units,
    deductionResult: deductResult,
    error: deductResult.success ? undefined : deductResult.error
  };
}

/**
 * Check and deduct Storage in one operation (atomic)
 */
export async function checkAndDeductStorage(workspaceId: string, fileSizeMB: number): Promise<{
  allowed: boolean;
  unitsNeeded: number;
  limit: number;
  current: number;
  remaining: number;
  deductionResult?: DeductResult;
  error?: string;
}> {
  const units = Math.max(1, Math.ceil(fileSizeMB));
  
  // First check
  const checkResult = await checkWorkspaceStorageLimit(workspaceId, units);
  
  if (!checkResult.allowed) {
    return {
      allowed: false,
      unitsNeeded: units,
      limit: checkResult.limit,
      current: checkResult.current,
      remaining: checkResult.remaining,
      error: `Insufficient storage. Need ${units} unit(s) (${fileSizeMB}MB), only ${checkResult.remaining} available.`
    };
  }
  
  // Then deduct
  const deductResult = await deductWorkspaceStorage(workspaceId, units);
  
  return {
    allowed: deductResult.success,
    unitsNeeded: units,
    limit: checkResult.limit,
    current: checkResult.current + units,
    remaining: checkResult.remaining - units,
    deductionResult: deductResult,
    error: deductResult.success ? undefined : deductResult.error
  };
}








// // lib/billing/workspace.ts
// import { BillingService } from "@/lib/billing/billing-service";
// import { db } from "@/lib/db";
// import { Services } from "@/lib/generated/prisma";

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
//       email: process.env.MAIL_FROM || "mailby@dropaphi.xyz",
//       name: process.env.NAME_FROM || "DropAphi",
//       verified: false,
//       replyTo: process.env.MAIL_FROM || "mailby@dropaphi.xyz",
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_SENDER_ERROR]", error);
//     return null;
//   }
// }

// /**
//  * Check workspace OTP limit using BillingService
//  */
// export async function checkWorkspaceOTPLimit(workspaceId: string): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
//   serviceCreditsAvailable: number;
//   balanceAvailable: number;
// }> {
//   try {
//     const result = await BillingService.checkLimit(workspaceId, Services.OTP, 1);
    
//     return {
//       allowed: result.success,
//       current: result.used,
//       limit: result.limit,
//       remaining: result.remaining,
//       serviceCreditsAvailable: result.serviceCreditsAvailable,
//       balanceAvailable: result.balanceAvailable,
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_OTP_LIMIT_ERROR]", error);
//     return {
//       allowed: false,
//       current: 0,
//       limit: 0,
//       remaining: 0,
//       serviceCreditsAvailable: 0,
//       balanceAvailable: 0,
//     };
//   }
// }

// /**
//  * Check workspace email limit using BillingService
//  */
// export async function checkWorkspaceEmailLimit(workspaceId: string): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
//   serviceCreditsAvailable: number;
//   balanceAvailable: number;
// }> {
//   try {
//     const result = await BillingService.checkLimit(workspaceId, Services.EMAIL, 1);
    
//     return {
//       allowed: result.success,
//       current: result.used,
//       limit: result.limit,
//       remaining: result.remaining,
//       serviceCreditsAvailable: result.serviceCreditsAvailable,
//       balanceAvailable: result.balanceAvailable,
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_EMAIL_LIMIT_ERROR]", error);
//     return {
//       allowed: false,
//       current: 0,
//       limit: 0,
//       remaining: 0,
//       serviceCreditsAvailable: 0,
//       balanceAvailable: 0,
//     };
//   }
// }

// /**
//  * Check workspace SMS limit using BillingService
//  */
// export async function checkWorkspaceSMSLimit(workspaceId: string): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
//   serviceCreditsAvailable: number;
//   balanceAvailable: number;
// }> {
//   try {
//     const result = await BillingService.checkLimit(workspaceId, Services.SMS, 1);
    
//     return {
//       allowed: result.success,
//       current: result.used,
//       limit: result.limit,
//       remaining: result.remaining,
//       serviceCreditsAvailable: result.serviceCreditsAvailable,
//       balanceAvailable: result.balanceAvailable,
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_SMS_LIMIT_ERROR]", error);
//     return {
//       allowed: false,
//       current: 0,
//       limit: 0,
//       remaining: 0,
//       serviceCreditsAvailable: 0,
//       balanceAvailable: 0,
//     };
//   }
// }

// /**
//  * Check workspace storage limit using BillingService
//  */
// export async function checkWorkspaceStorageLimit(workspaceId: string, units: number = 1): Promise<{
//   allowed: boolean;
//   current: number;
//   limit: number;
//   remaining: number;
//   serviceCreditsAvailable: number;
//   balanceAvailable: number;
// }> {
//   try {
//     const result = await BillingService.checkLimit(workspaceId, Services.STORAGE, units);
    
//     return {
//       allowed: result.success,
//       current: result.used,
//       limit: result.limit,
//       remaining: result.remaining,
//       serviceCreditsAvailable: result.serviceCreditsAvailable,
//       balanceAvailable: result.balanceAvailable,
//     };
//   } catch (error) {
//     console.error("[WORKSPACE_STORAGE_LIMIT_ERROR]", error);
//     return {
//       allowed: false,
//       current: 0,
//       limit: 0,
//       remaining: 0,
//       serviceCreditsAvailable: 0,
//       balanceAvailable: 0,
//     };
//   }
// }


