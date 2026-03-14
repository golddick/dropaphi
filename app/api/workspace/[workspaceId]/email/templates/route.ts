// // app/api/workspace/[workspaceId]/email/templates/route.ts
// import { NextRequest } from "next/server";
// import { db } from "@/lib/db";
// import { requireAuth } from "@/lib/auth/auth-server";
// import { dropid } from "dropid";
// import { z } from "zod";
// import { generateEmailHTML } from "@/components/mail-builder/code-editor/html-generator";

// // ========================================
// // Validation Schemas
// // ========================================

// const createTemplateSchema = z.object({
//   name: z.string().min(1, "Template name is required"),
//   subject: z.string().min(1, "Subject is required"),
//   elements: z.array(z.any()),
//   variables: z.record(z.any()).optional(),
//   bodyBackgroundColor: z.string().optional(),
// });

// const updateTemplateSchema = z.object({
//   name: z.string().min(1).optional(),
//   subject: z.string().min(1).optional(),
//   elements: z.array(z.any()).optional(),
//   variables: z.record(z.any()).optional(),
//   bodyBackgroundColor: z.string().optional(),
//   isActive: z.boolean().optional(),
// });

// // ========================================
// // GET /api/workspace/[workspaceId]/email/templates
// // List all templates
// // ========================================

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ workspaceId: string }> }
// ) {
//   try {
//     const { workspaceId } = await params;
    
//     const auth = await requireAuth();
//     if (auth instanceof Response) return auth;

//     const member = await db.workspaceMember.findFirst({
//       where: {
//         workspaceId,
//         userId: auth.userId,
//       },
//     });

//     if (!member) {
//       return new Response(
//         JSON.stringify({ error: "Unauthorized" }),
//         { status: 403, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     const templates = await db.emailTemplate.findMany({
//       where: { 
//         workspaceId, 
//         isActive: true 
//       },
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         name: true,
//         subject: true,
//         elements: true,
//         variables: true,
//         isActive: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     // Generate preview HTML for each template
//     const templatesWithPreview = templates.map(template => ({
//       ...template,
//       previewHtml: generateEmailHTML(
//         template.elements as any[], 
//         template.subject,
//         '#ffffff'
//       ),
//     }));

//     return new Response(
//       JSON.stringify({ 
//         success: true, 
//         data: { templates: templatesWithPreview } 
//       }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );

//   } catch (error) {
//     console.error("[GET_TEMPLATES_ERROR]", error);
//     return new Response(
//       JSON.stringify({ error: "Internal server error" }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }

// // ========================================
// // POST /api/workspace/[workspaceId]/email/templates
// // Create a new template from elements
// // ========================================

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ workspaceId: string }> }
// ) {
//   try {
//     const { workspaceId } = await params;
    
//     const auth = await requireAuth();
//     if (auth instanceof Response) return auth;

//     const member = await db.workspaceMember.findFirst({
//       where: {
//         workspaceId,
//         userId: auth.userId,
//         role: { in: ['OWNER', 'ADMIN'] },
//       },
//     });

//     if (!member) {
//       return new Response(
//         JSON.stringify({ error: "Admin access required" }),
//         { status: 403, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     const body = await req.json();
//     const parsed = createTemplateSchema.safeParse(body);

//     if (!parsed.success) {
//       return new Response(
//         JSON.stringify({ 
//           error: "Validation error", 
//           details: parsed.error.errors 
//         }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     const { name, subject, elements, variables, bodyBackgroundColor } = parsed.data;

//     // Generate HTML from elements
//     const generatedHTML = generateEmailHTML(elements, subject, bodyBackgroundColor);
    
//     // Generate plain text version
//     const plainText = generatedHTML.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

//     const templateId = dropid('tpl');
//     const template = await db.emailTemplate.create({
//       data: {
//         id: templateId,
//         workspaceId,
//         name,
//         subject,
//         bodyHtml: generatedHTML,
//         bodyText: plainText,
//         elements,
//         variables: variables || {},
//         isActive: true,
//       },
//     });

//     return new Response(
//       JSON.stringify({ 
//         success: true, 
//         data: { 
//           template: {
//             ...template,
//             previewHtml: generatedHTML,
//           }
//         },
//         message: "Template created successfully" 
//       }),
//       { status: 201, headers: { 'Content-Type': 'application/json' } }
//     );

//   } catch (error) {
//     console.error("[CREATE_TEMPLATE_ERROR]", error);
//     return new Response(
//       JSON.stringify({ error: "Internal server error" }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }






















// app/api/workspace/[workspaceId]/email/templates/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { generateEmailHTML } from "@/lib/email/generator/email-renderer-server";

// ========================================
// Validation Schemas
// ========================================

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  elements: z.array(z.any()),
  variables: z.record(z.any()).optional().default({}),
  bodyBackgroundColor: z.string().optional().default('#ffffff'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  elements: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
  bodyBackgroundColor: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ========================================
// GET /api/workspace/[workspaceId]/email/templates
// List all templates
// ========================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace membership
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = { workspaceId };
    if (!includeInactive) {
      where.isActive = true;
    }

    // Get templates with pagination
    const [templates, total] = await Promise.all([
      db.emailTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          subject: true,
          elements: true,
          variables: true,
          // bodyBackgroundColor: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              emails: true,
              // campaigns: true,
            },
          },
        },
      }),
      db.emailTemplate.count({ where }),
    ]);

    // Generate preview HTML for each template
    const templatesWithPreview = templates.map(template => ({
      ...template,
      previewHtml: generateEmailHTML(
        (template.elements as any[]) || [], 
        template.subject,
        '#ffffff'
      ),
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          templates: templatesWithPreview,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + templates.length < total,
          },
        } 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[GET_TEMPLATES_ERROR]", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response(
        JSON.stringify({ 
          error: "Database error", 
          code: error.code,
          message: error.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ========================================
// POST /api/workspace/[workspaceId]/email/templates
// Create a new template from elements
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    console.log('[CREATE_TEMPLATE] Starting for workspace:', workspaceId);
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    console.log('[CREATE_TEMPLATE] User authenticated:', auth.userId);

    // Check admin access
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      console.log('[CREATE_TEMPLATE] Unauthorized - not admin');
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[CREATE_TEMPLATE] Member authorized:', member.role);

    // Parse request body
    const body = await req.json();
    console.log('[CREATE_TEMPLATE] Request body:', body);

    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[CREATE_TEMPLATE] Validation failed:', parsed.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Validation error", 
          details: parsed.error.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, subject, elements, variables, bodyBackgroundColor } = parsed.data;
    console.log('[CREATE_TEMPLATE] Parsed data:', { name, subject, elementsCount: elements.length });

    // Generate HTML from elements
    const generatedHTML = generateEmailHTML(elements, subject, bodyBackgroundColor || '#ffffff');
    
    // Generate plain text version
    const plainText = generatedHTML.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    const templateId = dropid('tpl');
    console.log('[CREATE_TEMPLATE] Generated template ID:', templateId);

    // Create template
    const template = await db.emailTemplate.create({
      data: {
        id: templateId,
        workspaceId,
        name,
        subject,
        bodyHtml: generatedHTML,
        bodyText: plainText,
        elements: elements as any, // Store the elements array as JSON
        variables: variables || {},
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    });

    console.log('[CREATE_TEMPLATE] Template created successfully:', template.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          template: {
            ...template,
            previewHtml: generatedHTML,
          }
        },
        message: "Template created successfully" 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[CREATE_TEMPLATE_ERROR]", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[CREATE_TEMPLATE] Prisma error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });

      if (error.code === 'P2002') {
        return new Response(
          JSON.stringify({ 
            error: "A template with this name already exists in your workspace" 
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (error.code === 'P2003') {
        return new Response(
          JSON.stringify({ 
            error: "Invalid workspace ID" 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Validation error", 
          details: error.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ========================================
// DELETE /api/workspace/[workspaceId]/email/templates
// Bulk delete templates (optional)
// ========================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check admin access
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

    const { searchParams } = req.nextUrl;
    const templateIds = searchParams.get('ids')?.split(',');

    if (!templateIds || templateIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No template IDs provided" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete by setting isActive to false
    const result = await db.emailTemplate.updateMany({
      where: {
        id: { in: templateIds },
        workspaceId,
      },
      data: {
        isActive: false,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { deletedCount: result.count },
        message: `${result.count} templates deleted successfully` 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[BULK_DELETE_TEMPLATES_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}