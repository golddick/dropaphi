import { Services } from "@/lib/generated/prisma";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { z } from "zod";
import { dropid } from "dropid";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const costs = await db.serviceCost.findMany({
      orderBy: { service: 'asc' }
    });

    return ok(costs);
  } catch (error) {
    console.error('[ADMIN_SERVICE_COSTS_GET]', error);
    return serverError('Failed to fetch service costs');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const itemSchema = z.object({
      service: z.nativeEnum(Services),
      cost: z.union([z.string(), z.number()]).transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error('Invalid cost value');
        return Math.max(0, num);
      }),
      usageRate: z.union([z.string(), z.number()]).transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error('Invalid usageRate value');
        return Math.max(0, num);
      }),
      minPurchase: z.union([z.string(), z.number()]).transform((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) throw new Error('Invalid minPurchase value');
        return Math.max(0, num);
      }),
      isActive: z.boolean().optional().default(true),
      description: z.string().optional().nullable().default(null),
    });

    // Safely parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('[JSON_PARSE_ERROR]', error);
      return serverError('Invalid JSON in request body');
    }

    // Validate body exists
    if (!body || typeof body !== 'object') {
      return serverError('Empty or invalid request body');
    }

    // Handle both single object and array
    const items = Array.isArray(body) ? body : [body];

    if (items.length === 0) {
      return serverError('No items provided');
    }

    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Skip null/undefined items
      if (!item || typeof item !== 'object') {
        console.error(`[SERVICE_COST_ITEM_SKIP] Item at index ${i} is invalid:`, item);
        continue;
      }

      // Validate service field exists
      if (!item.service) {
        console.error(`[SERVICE_COST_MISSING_SERVICE] Item at index ${i} missing service field:`, item);
        continue;
      }

      try {
        // Parse and validate with Zod
        const parsed = itemSchema.parse(item);
        const { service, cost, usageRate, minPurchase, isActive, description } = parsed;

        // Convert numbers to proper types
        const costValue = Number(cost);
        const usageRateValue = Number(usageRate);
        const minPurchaseValue = Number(minPurchase);

        // Additional validation
        if (isNaN(costValue) || isNaN(usageRateValue) || isNaN(minPurchaseValue)) {
          console.error(`[SERVICE_COST_INVALID_NUMBER] Service ${service}:`, { cost, usageRate, minPurchase });
          continue;
        }

        // Upsert the service cost
        const serviceCost = await db.serviceCost.upsert({
          where: { service },
          update: {
            cost: costValue,
            usageRate: usageRateValue,
            minPurchase: minPurchaseValue,
            isActive: isActive ?? true,
            description: description || null,
          },
          create: {
            id: dropid('serv'),
            service,
            cost: costValue,
            usageRate: usageRateValue,
            minPurchase: minPurchaseValue,
            isActive: isActive ?? true,
            description: description || null,
          }
        });

        results.push(serviceCost);
        console.log(`[SERVICE_COST_SUCCESS] Successfully processed ${service}`);

      } catch (itemError) {
        // Detailed error logging
        console.error(`[SERVICE_COST_ITEM_ERROR] Service: ${item.service || 'unknown'}`, {
          item: JSON.stringify(item, null, 2),
          error: itemError instanceof Error ? itemError.message : itemError
        });
        // Continue processing other items
      }
    }

    // Check if any items were successfully processed
    if (results.length === 0) {
      return serverError('No valid service costs to save. Please check your input data.');
    }

    // Return single object if input was single object, otherwise return array
    return ok(Array.isArray(body) ? results : results[0]);

  } catch (error: any) {
    console.error('[ADMIN_SERVICE_COSTS_POST] Fatal error:', error);
    return serverError('Failed to save service cost: ' + (error.message || 'Unknown error'));
  }
}