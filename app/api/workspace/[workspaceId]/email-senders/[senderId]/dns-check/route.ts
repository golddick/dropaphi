// app/api/email-senders/[senderId]/dns-check/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";
import { checkDKIMRecord, checkSPFRecord } from "@/lib/auth/dns-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ senderId: string }> }
) {
  try {
    const { senderId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const sender = await db.emailSender.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      return err("Sender not found", 404);
    }

    const domain = sender.isDomain ? sender.email : sender.email.split('@')[1];

    // Check DNS records
    const [spfRes, dkimRes] = await Promise.all([
      checkSPFRecord(domain, sender.spfRecord || undefined),
      checkDKIMRecord(domain, 'dropaphi', 'dkim.dropaphi.xyz'), 
    ]);

    // Update sender with DNS verification status
    const updated = await db.emailSender.update({
      where: { id: senderId },
      data: {
        spfVerified: spfRes.valid,
        dkimVerified: dkimRes.valid,
        domainVerified: spfRes.valid && dkimRes.valid,
      },
    });

    return ok({
      spf: spfRes.valid,
      dkim: dkimRes.valid,
      spfDetail: spfRes,
      dkimDetail: dkimRes,
      sender: updated,
    });
  } catch (error) {
    console.error("[DNS_CHECK]", error);
    return serverError();
  }
}