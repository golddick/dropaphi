import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key/validate";
import { defaultTemplates } from "@/lib/v1-api/email/template";

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    // Return available templates
    return NextResponse.json({
      success: true,
      data: {
        templates: Object.keys(defaultTemplates).map(key => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          description: `Pre-built ${key} email template`,
          variables: getTemplateVariables(key),
        })),
      },
    });
  } catch (error) {
    console.error("[V1_EMAIL_TEMPLATES_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

function getTemplateVariables(template: string): string[] {
  switch (template) {
    case "welcome":
      return ["name", "company", "actionUrl"];
    case "newsletter":
      return ["title", "name", "articles", "articleTitle", "articleContent", "footerText", "unsubscribeUrl"];
    case "marketing":
      return ["headline", "subheadline", "message", "features", "ctaUrl", "ctaText", "expiryDate", "company"];
    case "notification":
      return ["type", "title", "icon", "message", "actionUrl", "actionText", "footer"];
    default:
      return [];
  }
}