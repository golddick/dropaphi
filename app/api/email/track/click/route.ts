// app/api/email/track/click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { dropid } from 'dropid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailId = searchParams.get('emailId');
  const campaignId = searchParams.get('campaignId');
  const encodedUrl = searchParams.get('url');

  if (!emailId || !encodedUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Decode the original URL
    const originalUrl = decodeURIComponent(encodedUrl);
    
    // Get tracking info
    const headersList = headers();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const country = request.headers.get('x-vercel-ip-country') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;

    // Parse user agent
    const device = parseUserAgent(userAgent);

    // Update email click count and create tracking event
    await db.$transaction([
      db.email.update({
        where: { id: emailId },
        data: {
          clickCount: { increment: 1 },
          clickedAt: new Date(),
          status: 'CLICKED',
        },
      }),
      db.emailTrackingEvent.create({
        data: {
          id: dropid('tev'),
          emailId,
          event: 'CLICK',
          url: originalUrl,
          ipAddress,
          userAgent,
          country,
        },
      }),
    ]);

    // Update campaign stats
    // if (campaignId) {
    //   await db.emailCampaign.update({
    //     where: { id: campaignId },
    //     data: {
    //       emailsClicked: { increment: 1 },
    //     },
    //   });
    // }

    // Redirect to original URL
    return NextResponse.redirect(originalUrl);
  } catch (error) {
    console.error('Error tracking click:', error);
    // Redirect to original URL even if tracking fails
    const originalUrl = decodeURIComponent(encodedUrl);
    return NextResponse.redirect(originalUrl);
  }
}

function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();
  
  let browser = 'unknown';
  if (uaLower.includes('chrome')) browser = 'chrome';
  else if (uaLower.includes('firefox')) browser = 'firefox';
  else if (uaLower.includes('safari')) browser = 'safari';
  else if (uaLower.includes('edge')) browser = 'edge';
  else if (uaLower.includes('opera')) browser = 'opera';
  
  let os = 'unknown';
  if (uaLower.includes('windows')) os = 'windows';
  else if (uaLower.includes('mac')) os = 'macos';
  else if (uaLower.includes('linux')) os = 'linux';
  else if (uaLower.includes('android')) os = 'android';
  else if (uaLower.includes('ios')) os = 'ios';
  
  let device = 'desktop';
  if (uaLower.includes('mobile')) device = 'mobile';
  else if (uaLower.includes('tablet')) device = 'tablet';
  
  return { browser, os, device };
}