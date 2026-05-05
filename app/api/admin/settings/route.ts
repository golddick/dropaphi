import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { dropid } from "@/lib/utils";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const settings = await db.systemSetting.findMany({
      orderBy: { group: 'asc' }
    });

    return ok(settings);
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error);
    return serverError('Failed to fetch settings');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { key, value, group } = body;

    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value, group },
      create: {
        id: dropid('set'),
        key,
        value,
        group
      }
    });

    return ok(setting);
  } catch (error) {
    console.error('[ADMIN_SETTINGS_POST]', error);
    return serverError('Failed to save setting');
  }
}
