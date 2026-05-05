import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, unauthorized } from "@/lib/respond/response";
import { emailSender } from "@/lib/email/service/email-sender.service";

const schema = z.object({
  senderId: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return serverError("Invalid sender ID");

    const sender = await db.emailSender.findFirst({
      where: { id: parsed.data.senderId, workspaceId }
    });

    if (!sender) return notFound("Sender not found");

    const result = await emailSender.initiateVerification(sender.id);
    
    if (!result.success) {
      return serverError(result.error);
    }

    return ok({ message: "Verification code sent" });
  } catch (error) {
    console.error("[INITIATE_VERIFY]", error);
    return serverError();
  }
}
