// ============================================================
// DROP API — GET  /api/auth/me  → get current user
//            PATCH /api/auth/me → update profile
//            DELETE /api/auth/me → delete account
// src/app/api/auth/me/route.ts
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
// import { requireAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { verifyPassword } from "@/lib/auth/auth-client";
import { requireAuth } from "@/lib/auth/auth-server";

// ---- Selectable user fields --------------------------------
const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  phone: true,
  bio: true,
  location: true,
  phoneVerified: true,
  emailVerified: true,
  status: true,
  timezone: true,
  language: true,
  twoFactorEnabled: true,
  notifyEmail: true,
  notifySms: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ---- GET /api/auth/me --------------------------------------
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: USER_SELECT,
    });

    console.log('[GET_ME] Fetched user:', user);

    if (!user) return err("User not found", 404, "NOT_FOUND");

    // Include workspace memberships
    const memberships = await db.workspaceMember.findMany({
      where: { userId: auth.userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            industry: true,
          },
        },
      },
    });

    return ok({ ...user, workspaces: memberships });
  } catch (error) {
    console.error("[GET_ME]", error);
    return serverError();
  }
}

// ---- PATCH /api/auth/me ------------------------------------
const updateSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  phone: z.string().optional().nullable(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  notifyEmail: z.boolean().optional(),
  notifySms: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const updated = await db.user.update({
      where: { id: auth.userId },
      data: parsed.data,
      select: USER_SELECT,
    });

    return ok(updated, "Profile updated successfully");
  } catch (error) {
    console.error("[UPDATE_ME]", error);
    return serverError();
  }
}

// ---- DELETE /api/auth/me -----------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) return err("Password required to delete account", 400);

    const user = await db.user.findUnique({ where: { id: auth.userId } });
    if (!user?.passwordHash) return err("Cannot verify identity", 400);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return err("Incorrect password", 401, "INVALID_PASSWORD");

    // Soft delete: mark as INACTIVE
    await db.user.update({
      where: { id: auth.userId },
      data: { status: "INACTIVE", email: `deleted_${Date.now()}_${user.email}` },
    });

    return ok(null, "Account deleted successfully");
  } catch (error) {
    console.error("[DELETE_ME]", error);
    return serverError();
  }
}
