// app/api/email/track/open/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { dropid } from 'dropid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailId = searchParams.get('emailId');
  const campaignId = searchParams.get('campaignId');

  if (!emailId) {
    return new NextResponse('Missing emailId', { status: 400 });
  }

  try {
    // Get IP and user agent
    const headersList = headers();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Simple geo-location (you can integrate with a proper geo-IP service)
    const country = request.headers.get('x-vercel-ip-country') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;

    // Parse user agent for device info
    const device = parseUserAgent(userAgent);

    // Update email open count and create tracking event in a transaction
    const email = await db.email.findUnique({
      where: { id: emailId },
      select: { campaignId: true }
    });

    const effectiveCampaignId = campaignId || email?.campaignId;

    await db.$transaction(async (tx) => {
      await tx.email.update({
        where: { id: emailId },
        data: {
          openCount: { increment: 1 },
          openedAt: new Date(),
          status: 'OPENED',
        },
      });

      await tx.emailTrackingEvent.create({
        data: {
          id: dropid('tev'),
          emailId,
          event: 'OPEN',
          ipAddress,
          userAgent,
          country,
        },
      });

      if (effectiveCampaignId) {
        // We first need to check if the campaign exists to avoid errors
        const campaign = await tx.emailCampaign.findUnique({
          where: { id: effectiveCampaignId },
          select: { id: true, emailsSent: true }
        });

        if (campaign) {
          // Note: The schema doesn't have 'emailsOpened', but it has 'openRate'.
          // We'll update the campaign's openRate calculation if possible, or just skip if field missing.
          // Based on the schema provided, there is no emailsOpened field in EmailCampaign.
          // However, the instructions say "Uncomment and fix campaign statistics update logic".
          // If the user meant adding it, I should have seen it in schema.
          // Let's check schema again. EmailCampaign has: emailsSent, openRate, clickRate.
          
          const totalOpened = await tx.email.count({
            where: { campaignId: effectiveCampaignId, openCount: { gt: 0 } }
          });
          
          const openRate = campaign.emailsSent > 0 ? (totalOpened / campaign.emailsSent) * 100 : 0;
          
          await tx.emailCampaign.update({
            where: { id: effectiveCampaignId },
            data: {
              openRate
            }
          });
        }
      }
    });

    // Return a 1x1 transparent GIF
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(transparentGif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error tracking open:', error);
    // Still return the GIF to not break the email
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(transparentGif, {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}

function parseUserAgent(ua: string) {
  // Simple parsing - you can use a library like 'ua-parser-js'
  const uaLower = ua.toLowerCase();
  
  let browser = 'unknown';
  if (uaLower.includes('chrome')) browser = 'chrome';
  else if (uaLower.includes('firefox')) browser = 'firefox';
  else if (uaLower.includes('safari')) browser = 'safari';
  else if (uaLower.includes('edge')) browser = 'edge';
  else if (uaLower.includes('opera')) browser = 'opera';
  
  return { browser,  };
}