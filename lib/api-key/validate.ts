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
    // Get API key from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { 
        valid: false, 
        error: "Missing or invalid authorization header. Use: Bearer YOUR_API_KEY",
        status: 401
      };
    }

    const apiKey = authHeader.split(" ")[1];
    if (!apiKey) {
      return { 
        valid: false, 
        error: "API key is required",
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

    // Find the API key in database using the raw key field
    const keyRecord = await db.apiKey.findFirst({
      where: { 
        key: apiKey, // Look up by raw key
        status: 'ACTIVE'
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            fileLimit: true,
            currentFilesUsed: true,
            subscription: {
              select: {
                tier: true,
                status: true,
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

    // Check workspace subscription status
    if (!keyRecord.workspace.subscription || keyRecord.workspace.subscription.status !== 'ACTIVE') {
      return { 
        valid: false, 
        error: "Workspace subscription is not active",
        status: 403
      };
    }

    // Update last used timestamp and increment usage count
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
        // userId: keyRecord.userId || '',
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