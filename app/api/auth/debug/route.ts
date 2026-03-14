// app/api/auth/debug/route.ts
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE, verifyRefreshToken } from "@/lib/auth/auth-server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE.REFRESH_TOKEN)?.value;
    
    console.log('🔍 ===== AUTH DEBUG =====');
    console.log('Access token present:', !!accessToken);
    console.log('Refresh token present:', !!refreshToken);
    
    const result: any = {
      cookies: {
        hasAccess: !!accessToken,
        hasRefresh: !!refreshToken,
      }
    };

    if (refreshToken) {
      console.log('Refresh token preview:', refreshToken.substring(0, 30) + '...');
      
      // Try to verify the token
      const payload = await verifyRefreshToken(refreshToken);
      console.log('Token valid:', !!payload);
      
      if (payload) {
        console.log('User ID from token:', payload.userId);
        result.userId = payload.userId;
        
        // Check if token exists in database
        const dbToken = await db.refreshToken.findFirst({
          where: { 
            token: refreshToken,
            userId: payload.userId 
          }
        });
        
        console.log('Token in database:', !!dbToken);
        result.tokenInDb = !!dbToken;
        
        if (dbToken) {
          console.log('DB token expires:', dbToken.expiresAt);
          console.log('Is expired:', dbToken.expiresAt < new Date());
          result.tokenExpires = dbToken.expiresAt;
          result.isExpired = dbToken.expiresAt < new Date();
        }
        
        // Count all tokens for this user
        const tokenCount = await db.refreshToken.count({
          where: { userId: payload.userId }
        });
        console.log(`User has ${tokenCount} total refresh tokens in DB`);
        result.totalUserTokens = tokenCount;
      }
    }
    
    console.log('🔍 ===== END DEBUG =====');
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({ error: 'Debug failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}