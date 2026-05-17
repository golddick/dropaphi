// app/api/complaints/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { ok, created, serverError, unauthorized, err } from "@/lib/respond/response";

// GET - Fetch complaints (with filtering)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Check if user is admin
    const isAdmin = auth.role === "ADMIN" || auth.role === "OWNER";

    const where: any = {};
    
    if (!isAdmin) {
      where.userId = auth.userId;
    }
    
    if (status && status !== "all") {
      where.status = status;
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.complaint.count({ where }),
    ]);

    // Parse replies JSON for each complaint
    const parsedComplaints = complaints.map(c => ({
      ...c,
      replies: typeof c.replies === 'string' ? JSON.parse(c.replies) : c.replies,
    }));

    return ok({
      complaints: parsedComplaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[COMPLAINTS_GET]", error);
    return serverError();
  }
}

// POST - Create new complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, subject, message } = body;

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return err("Missing required fields", 400, "MISSING_FIELDS");
    }

    // Optional: Get user if authenticated
    let userId = null;
    try {
      const auth = await requireAuth();
      if (!(auth instanceof Response) && auth.userId) {
        userId = auth.userId;
      }
    } catch {
      // User not authenticated, continue with null userId
    }

    const complaint = await db.complaint.create({
      data: {
        id: dropid("cmp"),
        userId,
        name,
        email,
        category,
        subject,
        message,
        status: "OPEN",
        replies: "[]",
      },
    });

    return created({
      complaint: {
        ...complaint,
        replies: [],
      },
    });
  } catch (error) {
    console.error("[COMPLAINTS_POST]", error);
    return serverError();
  }
}