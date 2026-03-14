// app/api/workspace/[workspaceId]/email-senders/verify/send/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { generateOTP, sendEmailVerificationOTP, storeOTP } from "@/lib/auth/email-utils";
// import { generateOTP, storeOTP, sendEmailVerificationOTP } from "@/lib/auth/email-utils";

const sendSchema = z.object({
  email: z.string().email(),
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
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Check if sender exists
    const sender = await db.emailSender.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email: parsed.data.email,
        },
      },
    });

    if (!sender) {
      return err("Email sender not found", 404);
    }

    if (sender.verified) {
      return err("Email already verified", 400);
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(`${workspaceId}-${parsed.data.email}`, otp);

    // Send OTP
    await sendEmailVerificationOTP(parsed.data.email, otp, sender.name, 'Email Sender');

    return ok(null, "Verification code sent");
  } catch (error) {
    console.error("[SEND_VERIFICATION]", error);
    return serverError();
  }
}