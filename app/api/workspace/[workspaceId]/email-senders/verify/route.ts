// app/api/workspace/[workspaceId]/email-senders/verify/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { verifyOTP } from "@/lib/auth/email-utils";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Verify OTP
    const isValid = verifyOTP(`${workspaceId}-${parsed.data.email}`, parsed.data.code);
    
    if (!isValid) {
      return err("Invalid or expired verification code", 400);
    }

    // Update sender as verified
    const sender = await db.emailSender.update({
      where: { 
        id: parsed.data.senderId,
        workspaceId,
      },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    return ok({ sender }, "Email verified successfully");
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return serverError();
  }
}