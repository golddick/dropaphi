// app/api/billing/balance/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
    });

    if (!member) {
      return ok({ balance: 0 });
    }

    const balance = await db.creditBalance.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    return ok({ balance: balance?.balance.toNumber() || 0 });
  } catch (error) {
    console.error("[GET_BALANCE]", error);
    return serverError();
  }
}