// lib/api-key/validate.ts
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { isValidKeyFormat, getKeyEnvironment } from "./utils";

export interface ApiKeyInfo {
  id: string;
  workspaceId: string;
  userId?: string | null;
  name: string;
  tier: string;
  isTest: boolean;
}

export async function validateApiKey(req: NextRequest): Promise<{ 
  valid: boolean; 
  keyInfo?: ApiKeyInfo; 
  error?: string;
  status?: number;
}> {
  try {
    // Get API key from X-API-Key header
    const apiKey = req.headers.get("x-api-key");
    
    if (!apiKey) {
      return { 
        valid: false, 
        error: "Missing API key. Provide via X-API-Key header",
        status: 401
      };
    }

    // Validate key format first
    if (!isValidKeyFormat(apiKey)) {
      return { 
        valid: false, 
        error: "Invalid API key format. Key should start with da_live_ or da_test_",
        status: 401
      };
    }

    // Get environment from key
    const environment = getKeyEnvironment(apiKey);
    if (!environment) {
      return { 
        valid: false, 
        error: "Invalid API key prefix",
        status: 401
      };
    }

    // Find the API key in database with workspace and subscription
    const keyRecord = await db.apiKey.findFirst({
      where: { 
        key: apiKey,
        status: 'ACTIVE'
      },
      include: {
        workspace: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });

    if (!keyRecord) {
      return { 
        valid: false, 
        error: "Invalid API key",
        status: 401
      };
    }

    // Verify environment matches
    if ((environment === 'live' && keyRecord.isTest) || 
        (environment === 'test' && !keyRecord.isTest)) {
      return { 
        valid: false, 
        error: "API key environment mismatch",
        status: 403
      };
    }

    // Check if key has expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      await db.apiKey.update({
        where: { id: keyRecord.id },
        data: { status: 'EXPIRED' }
      });
      
      return { 
        valid: false, 
        error: "API key has expired",
        status: 403
      };
    }

    // 1. Check workspace subscription status
    if (!keyRecord.workspace.subscription || keyRecord.workspace.subscription.status !== 'ACTIVE') {
      return { 
        valid: false, 
        error: "Workspace subscription is not active",
        status: 403
      };
    }

    // 2. Check if plan allows API access
    const plan = keyRecord.workspace.subscription.plan;
    if (!plan || !plan.devApiAccess) {
      return {
        valid: false,
        error: "Your current plan does not include API access. Please upgrade to a plan that includes API access.",
        status: 403
      };
    }

    // 3. Update API key last used timestamp
    await db.apiKey.update({
      where: { id: keyRecord.id },
      data: { 
        lastUsedAt: new Date(),
        usageCount: { increment: 1 }
      }
    });

    return {
      valid: true,
      keyInfo: {
        id: keyRecord.id,
        workspaceId: keyRecord.workspaceId,
        name: keyRecord.name,
        tier: keyRecord.workspace.subscription?.tier || 'FREE',
        isTest: keyRecord.isTest,
      }
    };

  } catch (error) {
    console.error("[API_KEY_VALIDATION_ERROR]", error);
    return { 
      valid: false, 
      error: "Internal server error during validation",
      status: 500
    };
  }
}