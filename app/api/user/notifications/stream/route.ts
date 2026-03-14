// app/api/user/notifications/stream/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

        // Set up interval to check for new notifications
        const interval = setInterval(async () => {
          try {
            const unreadCount = await db.notification.count({
              where: {
                userId: auth.userId,
                status: 'UNREAD',
              },
            });

            const recentNotifications = await db.notification.findMany({
              where: {
                userId: auth.userId,
                createdAt: { gt: new Date(Date.now() - 60000) }, // Last minute
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
            });

            if (recentNotifications.length > 0 || unreadCount > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'update',
                    unreadCount,
                    notifications: recentNotifications,
                  })}\n\n`
                )
              );
            }
          } catch (error) {
            console.error("[SSE_ERROR]", error);
          }
        }, 30000); // Check every 30 seconds

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("[STREAM_ERROR]", error);
    return new Response('Unauthorized', { status: 401 });
  }
}