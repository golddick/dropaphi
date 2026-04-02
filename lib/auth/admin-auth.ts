// lib/auth/admin-auth.ts
import { requireAuth } from './auth-server';
import { db } from '@/lib/db';

export async function requireAdmin() {
  try {
    const result = await requireAuth(); 
    
    // If requireAuth returned a Response (error), return it
    if (result instanceof Response) {
      console.log('[requireAdmin] Auth failed, returning response');
      return result;
    }
    
    // At this point, result is the session object
    const session = result;
    
    // Check if user exists and has admin role
    if (!session || !session.userId) {
      console.log('[requireAdmin] No valid session');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true, email: true }
    });

    if (!user) {
      console.log('[requireAdmin] User not found:', session.userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      console.log('[requireAdmin] User is not admin:', session.userId, 'Role:', user.role);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[requireAdmin] Admin authenticated:', session.userId);
    return { user: { id: session.userId, email: session.email || user.email }, session };
  } catch (error) {
    console.error('[requireAdmin] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}