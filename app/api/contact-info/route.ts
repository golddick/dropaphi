// app/api/contact-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { ok, created, serverError, err } from "@/lib/respond/response";

// GET - Fetch all contact info (public)
export async function GET(req: NextRequest) {
  try {
    const contactInfo = await db.contactInfo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return ok({ contactInfo });
  } catch (error) {
    console.error("[CONTACT_INFO_GET]", error);
    return serverError();
  }
}

// POST - Create contact info (admin only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    if (!auth) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }

    const body = await req.json();
    const { type, label, value, href, description, icon, sortOrder } = body;
 
    if (!type || !label || !value || !href) {
      return err("Missing required fields", 400, "MISSING_FIELDS");
    }

    const contactInfo = await db.contactInfo.create({
      data: {
        id: dropid("ctc"),
        type,
        label,
        value,
        href,
        description: description || "",
        icon: icon || null,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return created({ contactInfo });
  } catch (error) {
    console.error("[CONTACT_INFO_POST]", error);
    return serverError();
  }
}

// PUT - Update contact info (admin only)
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const isAdmin = auth.role === "ADMIN" || auth.role === "OWNER";
    if (!isAdmin) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }

    const body = await req.json();
    const { id, type, label, value, href, description, icon, sortOrder, isActive } = body;

    if (!id) {
      return err("ID required", 400, "MISSING_ID");
    }

    const existing = await db.contactInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return err("Contact info not found", 404, "NOT_FOUND");
    }

    const updated = await db.contactInfo.update({
      where: { id },
      data: {
        type: type || existing.type,
        label: label || existing.label,
        value: value || existing.value,
        href: href || existing.href,
        description: description !== undefined ? description : existing.description,
        icon: icon !== undefined ? icon : existing.icon,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return ok({ contactInfo: updated });
  } catch (error) {
    console.error("[CONTACT_INFO_PUT]", error);
    return serverError();
  }
}

// DELETE - Delete contact info (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const isAdmin = auth.role === "ADMIN" || auth.role === "OWNER";
    if (!isAdmin) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return err("ID required", 400, "MISSING_ID");
    }

    await db.contactInfo.delete({
      where: { id },
    });

    return ok({ message: "Contact info deleted successfully" });
  } catch (error) {
    console.error("[CONTACT_INFO_DELETE]", error);
    return serverError();
  }
}