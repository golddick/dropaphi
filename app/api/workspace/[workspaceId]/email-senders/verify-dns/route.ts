import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, unauthorized } from "@/lib/respond/response";
import { checkSPFRecord, checkDKIMRecord, checkDMARCRecord, generateDNSRecords } from "@/lib/auth/dns-utils";

const schema = z.object({
  domain: z.string().min(3),
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
    if (!parsed.success) return serverError("Invalid domain");

    const domain = parsed.data.domain;

    const sender = await db.emailSender.findFirst({
      where: { workspaceId }
    });

    if (!sender) return notFound("Domain not found for this workspace");

    const [spf, dkim, dmarc] = await Promise.all([
      checkSPFRecord(domain, 'include:_spf.dropaphi.xyz'),
      checkDKIMRecord(domain, 'dropaphi'),
      checkDMARCRecord(domain)
    ]);

    const isFullyVerified = spf.valid && dkim.valid && dmarc.valid;

    const updatedSender = await db.emailSender.update({
      where: { id: sender.id },
      data: {
        spfVerified: spf.valid,
        dkimVerified: dkim.valid,
        domainVerified: isFullyVerified, // Using domainVerified as the aggregate flag
        verified: isFullyVerified,
        verifiedAt: isFullyVerified ? new Date() : sender.verifiedAt
      }
    });

    return ok({
      records: generateDNSRecords(domain),
      status: {
        spf: spf.valid,
        dkim: dkim.valid,
        dmarc: dmarc.valid,
        verified: isFullyVerified,
        details: {
          spf: spf.foundValue || spf.error,
          dkim: dkim.foundValue || dkim.error,
          dmarc: dmarc.foundValue || dmarc.error
        }
      }
    });
  } catch (error) {
    console.error("[VERIFY_DNS]", error);
    return serverError();
  }
}
