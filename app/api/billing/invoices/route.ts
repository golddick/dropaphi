// app/api/billing/invoices/route.ts
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
      return ok({ data: [] });
    }

    const invoices = await db.invoice.findMany({
      where: { workspaceId: member.workspaceId },
      include: {
        promoCode: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const formatted = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount.toNumber(),
      discount: inv.discount?.toNumber() || 0,
      finalAmount: inv.finalAmount?.toNumber() || inv.amount.toNumber(),
      status: inv.status,
      paidAt: inv.paidAt?.toISOString() || null,
      periodStart: inv.periodStart?.toISOString(),
      periodEnd: inv.periodEnd?.toISOString(),
      promoCode: inv.promoCode?.code,
      createdAt: inv.createdAt.toISOString(),
    }));

    return ok({ data: formatted });
  } catch (error) {
    console.error("[GET_INVOICES]", error);
    return serverError();
  }
}