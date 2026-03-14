import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { z } from "zod";
import { 
  ok, 
  unauthorized, 
  validationError, 
  serverError,
  created,
  notFound,
  forbidden
} from "@/lib/respond/response";
import { dropid } from "dropid";

// ========================================
// Validation Schemas
// ========================================

const createSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional().nullable(),
  segments: z.array(z.string()).optional().default([]),
  customFields: z.record(z.any()).optional(),
  source: z.string().optional(),
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED']).optional().default('ACTIVE'),
});

const updateSubscriberSchema = z.object({
  name: z.string().optional().nullable(),
  segments: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED']).optional(),
});

const subscriberQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val ? Number(val) : 1),
    z.number().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => (val ? Number(val) : 20),
    z.number().min(1).max(1000).default(20)
  ),
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED']).optional(),
  segment: z.string().optional(),
  search: z.string().optional(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
});

// ========================================
// GET /api/workspace/[workspaceId]/subscribers
// Get paginated subscribers with filters
// ========================================

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
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const query = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || undefined,
      segment: searchParams.get('segment') || undefined,
      search: searchParams.get('search') || undefined,
    };

    console.log('Query params:', query); // Debug log

    const parsed = subscriberQuerySchema.safeParse(query);
    
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.errors);
      return validationError(parsed.error);
    }

    const { page, limit, status, segment, search } = parsed.data;

    // Build where clause
    const where: any = { workspaceId };

    if (status) where.status = status;
    if (segment) where.segments = { has: segment };
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalCount = await db.subscriber.count({ where });

    // Get subscribers
    const subscribers = await db.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Return in the expected format
    return ok({
      data: subscribers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, "Subscribers fetched successfully");

  } catch (error) {
    console.error("[SUBSCRIBERS_GET_ERROR]", error);
    return serverError();
  }
}

// ========================================
// POST /api/workspace/[workspaceId]/subscribers
// Create a new subscriber
// ========================================

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

    if (!member || !['OWNER', 'ADMIN', 'WRITER'].includes(member.role)) {
      return forbidden("Insufficient permissions");
    }

    const body = await req.json();
    const parsed = createSubscriberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { email, name, segments, customFields, source, status } = parsed.data;

    // Check if subscriber exists
    const existing = await db.subscriber.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
    });

    if (existing) {
      return ok(
        { subscriber: existing },
        "Subscriber already exists"
      );
    }

    // Create subscriber
    const subscriber = await db.subscriber.create({
      data: {
        id: dropid('sub'),
        workspaceId,
        email,
        name,
        status,
        segments: segments || [],
        customFields: customFields || {},
        source: source || 'manual',
        confirmedAt: status === 'ACTIVE' ? new Date() : null,
      },
    });

    return created({ subscriber }, "Subscriber created successfully");

  } catch (error) {
    console.error("[SUBSCRIBERS_POST_ERROR]", error);
    return serverError();
  }
}

// ========================================
// DELETE /api/workspace/[workspaceId]/subscribers
// Bulk delete subscribers
// ========================================

export async function DELETE(
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

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return forbidden("Only owners and admins can delete subscribers");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Single delete
    if (id) {
      const result = await db.subscriber.deleteMany({
        where: {
          id,
          workspaceId,
        },
      });

      if (result.count === 0) {
        return notFound("Subscriber not found");
      }

      return ok({ deleted: true }, "Subscriber deleted successfully");
    }

    // Bulk delete
    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { ids } = parsed.data;

    const result = await db.subscriber.deleteMany({
      where: {
        id: { in: ids },
        workspaceId,
      },
    });

    return ok(
      { deletedCount: result.count },
      `Successfully deleted ${result.count} subscriber(s)`
    );

  } catch (error) {
    console.error("[SUBSCRIBERS_DELETE_ERROR]", error);
    return serverError();
  }
}