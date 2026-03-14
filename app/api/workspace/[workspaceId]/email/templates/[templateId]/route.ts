// app/api/workspace/[workspaceId]/email/templates/[templateId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";
import { generateEmailHTML } from "@/components/mail-builder/code-editor/html-generator";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  elements: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
  bodyBackgroundColor: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ========================================
// GET /api/workspace/[workspaceId]/email/templates/[templateId]
// Get single template
// ========================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const template = await db.emailTemplate.findFirst({
      where: {
        id: templateId,
        workspaceId,
      },
    });

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate preview HTML
    const previewHtml = generateEmailHTML(
      template.elements as any[], 
      template.subject,
      '#ffffff'
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          template: {
            ...template,
            previewHtml,
          }
        } 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[GET_TEMPLATE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ========================================
// PATCH /api/workspace/[workspaceId]/email/templates/[templateId]
// Update template
// ========================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation error", 
          details: parsed.error.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData: any = { ...parsed.data };

    // If elements are updated, regenerate HTML
    if (parsed.data.elements) {
      const subject = parsed.data.subject || (await db.emailTemplate.findUnique({
        where: { id: templateId },
        select: { subject: true }
      }))?.subject || '';

      updateData.bodyHtml = generateEmailHTML(
        parsed.data.elements, 
        subject,
        parsed.data.bodyBackgroundColor
      );
      updateData.bodyText = updateData.bodyHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    const template = await db.emailTemplate.update({
      where: {
        id: templateId,
        workspaceId,
      },
      data: updateData,
    });

    // Generate preview HTML
    const previewHtml = generateEmailHTML(
      template.elements as any[], 
      template.subject,
      '#ffffff'
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          template: {
            ...template,
            previewHtml,
          }
        },
        message: "Template updated successfully" 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[UPDATE_TEMPLATE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ========================================
// DELETE /api/workspace/[workspaceId]/email/templates/[templateId]
// Delete template (soft delete)
// ========================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete
    await db.emailTemplate.update({
      where: {
        id: templateId,
        workspaceId,
      },
      data: {
        isActive: false,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Template deleted successfully" 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[DELETE_TEMPLATE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ========================================
// POST /api/workspace/[workspaceId]/email/templates/[templateId]/duplicate
// Duplicate template
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const newName = body.name;

    if (!newName) {
      return new Response(
        JSON.stringify({ error: "New template name is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get original template
    const original = await db.emailTemplate.findFirst({
      where: {
        id: templateId,
        workspaceId,
      },
    });

    if (!original) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create duplicate
    const newTemplateId = dropid('tpl');
    const duplicate = await db.emailTemplate.create({
      data: {
        id: newTemplateId,
        workspaceId,
        name: newName,
        subject: original.subject,
        bodyHtml: original.bodyHtml,
        bodyText: original.bodyText,
        elements: original.elements ?? [],
        variables: original.variables ?? {},
        isActive: true,
      },
    });

    // Generate preview HTML
    const previewHtml = generateEmailHTML(
      duplicate.elements as any[], 
      duplicate.subject,
      '#ffffff'
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          template: {
            ...duplicate,
            previewHtml,
          }
        },
        message: "Template duplicated successfully" 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[DUPLICATE_TEMPLATE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}