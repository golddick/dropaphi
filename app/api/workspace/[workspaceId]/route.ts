// app/api/workspace/[workspaceId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";

// GET /api/workspace/[workspaceId] - Get single workspace
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // ✅ CRITICAL: Await params first!
    const { workspaceId } = await params;
    
    console.log(`🚀 GET /api/workspace/${workspaceId} - Started`);
    
    // Authenticate user
    const auth = await requireAuth();
    console.log(`✅ Authenticated user: ${auth.userId}`);
    
    console.log(`🔍 Looking for workspace: ${workspaceId}`);

    // Check if user has access to workspace
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: auth.userId
        }
      },
      select: { role: true }
    });

    if (!member) {
      console.log(`❌ User ${auth.userId} is not a member of workspace ${workspaceId}`);
      return new Response(
        JSON.stringify({ error: "You don't have access to this workspace" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ User role in workspace: ${member.role}`);

    // Fetch workspace details
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        teamSize: true,
        description: true,
        logoUrl: true,
        timezone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!workspace) {
      console.log(`❌ Workspace ${workspaceId} not found`);
      return new Response(
        JSON.stringify({ error: "Workspace not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Workspace found: ${workspace.name}`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        data: { workspace } 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Error in GET /api/workspace/[workspaceId]:", error);
    
    // Check for unauthorized error
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PATCH /api/workspace/[workspaceId] - Update workspace
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // ✅ CRITICAL: Await params first!
    const { workspaceId } = await params;
    
    console.log(`🚀 PATCH /api/workspace/${workspaceId} - Started`);
    
    const auth = await requireAuth();
    const body = await req.json();
    
    console.log(`📦 Update data:`, body);

    // Check if user has access to workspace
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: auth.userId
        }
      },
      select: { role: true }
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "You don't have access to this workspace" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to update (OWNER or ADMIN)
    if (member.role !== "OWNER" && member.role !== "ADMIN") {
      return new Response(
        JSON.stringify({ error: "Only owners and admins can update workspace settings" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.teamSize !== undefined) updateData.teamSize = body.teamSize;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;

    // Update workspace
    const updatedWorkspace = await db.workspace.update({
      where: { id: workspaceId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        teamSize: true,
        description: true,
        logoUrl: true,
        timezone: true,
        updatedAt: true
      }
    });

    console.log(`✅ Workspace updated successfully: ${updatedWorkspace.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: { workspace: updatedWorkspace },
        message: "Workspace updated successfully"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Error in PATCH /api/workspace/[workspaceId]:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/workspace/[workspaceId] - Delete workspace
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // ✅ CRITICAL: Await params first!
    const { workspaceId } = await params;
    
    console.log(`🚀 DELETE /api/workspace/${workspaceId} - Started`);
    
    const auth = await requireAuth();

    // Check if user has access and is owner
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: auth.userId
        }
      },
      select: { role: true }
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "You don't have access to this workspace" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (member.role !== "OWNER") {
      return new Response(
        JSON.stringify({ error: "Only workspace owners can delete workspaces" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete workspace
    await db.workspace.delete({
      where: { id: workspaceId }
    });

    console.log(`✅ Workspace deleted successfully: ${workspaceId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Workspace deleted successfully"
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Error in DELETE /api/workspace/[workspaceId]:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


