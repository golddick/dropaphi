import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;
    const body = await req.json();
    const { 
      balance, 
      emailCredits,
      smsCredits, 
      otpCredits,
      blogCredits,
      pushCredits,
      apiCredits,
      storageCredits
    } = body;

    const wallet = await db.wallet.upsert({
      where: { workspaceId },
      update: {
        balance: balance !== undefined ? balance : undefined,
        emailCredits: emailCredits !== undefined ? emailCredits : undefined,
        smsCredits: smsCredits !== undefined ? smsCredits : undefined,
        otpCredits: otpCredits !== undefined ? otpCredits : undefined,
        blogCredits: blogCredits !== undefined ? blogCredits : undefined,
        pushCredits: pushCredits !== undefined ? pushCredits : undefined,
        apiCredits: apiCredits !== undefined ? apiCredits : undefined,
        storageCredits: storageCredits !== undefined ? storageCredits : undefined,
      },
      create: {
        workspaceId,
        balance: balance || 0,
        emailCredits: emailCredits || 0,
        smsCredits: smsCredits || 0,
        otpCredits: otpCredits || 0,
        blogCredits: blogCredits || 0,
        pushCredits: pushCredits || 0,
        apiCredits: apiCredits || 0,
        storageCredits: storageCredits || 0,
      }
    });

    return ok(wallet);
  } catch (error) {
    console.error('[ADMIN_WALLET_PATCH]', error);
    return serverError('Failed to update wallet');
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    const wallet = await db.wallet.findUnique({
      where: { workspaceId }
    });

    if (!wallet) {
       // Return default wallet state if not created yet
       return ok({ 
         workspaceId, 
         balance: 0, 
         emailCredits: 0,
         smsCredits: 0, 
         otpCredits: 0,
         blogCredits: 0,
         pushCredits: 0,
         apiCredits: 0,
         storageCredits: 0
        });
    }

    return ok(wallet);
  } catch (error) {
    console.error('[ADMIN_WALLET_GET]', error);
    return serverError('Failed to fetch wallet');
  }
}
