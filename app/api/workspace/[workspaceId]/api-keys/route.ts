import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";
import { ApiKeyStatus } from "@/lib/generated/prisma/enums";
import { generateApiKey, maskApiKey } from "@/lib/api-key/utils";
import { canCreateProductionKey } from "@/lib/api-key/queries";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createKeySchema = z.object({
  name: z.string().min(1, "Key name is required").max(100, "Key name too long"), 
  environment: z.enum(['live', 'test']),
  expiresIn: z.number().min(1).max(3650).optional(),
  permissions: z.record(z.any()).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
}).refine(
  (data) => {
    if (data.environment === 'live' && (!data.expiresIn || data.expiresIn < 90)) {
      return false;
    }
    return true;
  },
  {
    message: "Live keys must expire in at least 90 days",
    path: ["expiresIn"],
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
  });
}

function errorResponse(message: string, status: number = 400, details?: any) {
  return jsonResponse({ 
    success: false, 
    error: message,
    details 
  }, status);
}

// ============================================================================
// GET /api/workspace/[workspaceId]/api-keys
// List all API keys for a workspace (masked versions)
// ============================================================================

export async function GET( 
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> } 
) {
  try {
    console.log("=== GET API KEYS START ===");
    
    // 1. Await params (Next.js 15 requirement)
    const { workspaceId } = await context.params;
    console.log("Workspace ID:", workspaceId);

    // 2. Authenticate user
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // 3. Validate workspace ID
    if (!workspaceId || workspaceId === "undefined") {
      return errorResponse("Workspace ID is required", 400);
    }

    // 4. Check workspace membership
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return errorResponse("Unauthorized access to workspace", 403);
    }

    // 5. Fetch API keys (without sensitive data)
    const apiKeys = await db.apiKey.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastFourChars: true,
        status: true,
        isTest: true,
        permissions: true,
        rateLimitPerMin: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        // IMPORTANT: Never select key or keyHash here!
      },
    });

    console.log(`Found ${apiKeys.length} API keys`);

    // 6. Add masked versions for display
    const apiKeysWithDisplay = apiKeys.map((key) => {
      // Create masked key: prefix + 8 dots + last 4 chars
      const maskedKey = `${key.keyPrefix}••••••••${key.lastFourChars}`;
      
      return {
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        lastFourChars: key.lastFourChars,
        maskedKey, // e.g., "da_live_••••••••xK9m"
        status: key.status,
        isTest: key.isTest,
        permissions: key.permissions,
        rateLimitPerMin: key.rateLimitPerMin,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      };
    });

    // 7. Return success response
    return jsonResponse({
      success: true,
      data: {
        apiKeys: apiKeysWithDisplay
      }
    }, 200);
    
  } catch (error) {
    console.error("[GET_API_KEYS_ERROR]", error);
    return errorResponse(
      "Internal server error", 
      500, 
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// ============================================================================
// POST /api/workspace/[workspaceId]/api-keys
// Create a new API key (returns the full key - ONLY TIME IT'S SHOWN)
// ============================================================================

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> } 
) {
  try {
    console.log("=== POST API KEY START ===");
    
    // 1. Await params
    const { workspaceId } = await context.params;
    console.log("Workspace ID:", workspaceId);

    // 2. Authenticate user
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // 3. Validate workspace ID
    if (!workspaceId || workspaceId === "undefined") {
      return errorResponse("Workspace ID is required", 400);
    }

    console.log(`User ${auth.userId} creating key for workspace ${workspaceId}`);

    // 4. Verify user has admin access (only OWNER or ADMIN can create keys)
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return errorResponse("You need admin privileges to create API keys", 403);
    }

    // 5. Verify workspace exists
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return errorResponse("Workspace not found", 404);
    }

    // 6. Parse and validate request body
    const body = await req.json();
    console.log("Request body:", body);

    const parsed = createKeySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation error", 400, parsed.error.errors);
    }

    const { name, environment, expiresIn, permissions, rateLimit } = parsed.data;

    // 7. Check if production key creation is allowed
    if (environment === 'live') {
      const productionCheck = await canCreateProductionKey(workspaceId);
      if (!productionCheck.allowed) {
        return errorResponse(productionCheck.reason || "Cannot create live key", 403);
      }
    }

    // 8. Generate a unique ID for the API key
    const keyId = dropid('key');

    // 9. Generate user-friendly API key
    //    Returns: { key: "da_live_xK9mPq2rT5", encryptedKey, prefix, lastFour, jwt }
    const { key: rawKey, encryptedKey, prefix, lastFour, jwt } = generateApiKey(
      workspaceId, 
      keyId, 
      environment
    );

    console.log(`Generated key with prefix: ${prefix}, lastFour: ${lastFour}`);

    // 10. Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    } else if (environment === 'live') {
      // Live keys default to 90 days
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
    // Test keys can have no expiration if not specified

    // 11. Create API key in database (store ENCRYPTED version in keyHash, and raw key in key field)
    const apiKey = await db.apiKey.create({
      data: {
        id: keyId,
        workspaceId: workspaceId,
        name,
        jwt: jwt,
        key: rawKey, // Store raw key for validation (can be encrypted if needed)
        // keyHash: encryptedKey, // Store encrypted version
        keyPrefix: prefix,
        lastFourChars: lastFour,
        status: ApiKeyStatus.ACTIVE,
        isTest: environment === 'test', // Set isTest based on environment
        permissions: permissions || {},
        rateLimitPerMin: rateLimit || (environment === 'live' ? 100 : 60),
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastFourChars: true,
        status: true,
        isTest: true,
        permissions: true,
        rateLimitPerMin: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    console.log(`Successfully created key ${apiKey.id}`);

    // 12. Create masked version for display
    const maskedKey = maskApiKey(rawKey); // "da_live_••••••••xK9m"

    // 13. Return success with the RAW key (ONLY TIME IT'S SHOWN)
    return jsonResponse({
      success: true,
      data: {
        apiKey: {
          ...apiKey,
          key: rawKey,           // USER SEES THIS: "da_live_xK9mPq2rT5"
          maskedKey,             // "da_live_••••••••xK9m"
        }
      },
      message: "API Key created successfully. Make sure to copy it now - you won't be able to see it again!"
    }, 201);

  } catch (error) {
    console.error("[POST_API_KEY_ERROR]", error);
    return errorResponse(
      "Internal server error", 
      500, 
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}