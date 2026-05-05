import { db } from "@/lib/db";
import { Services } from "@/lib/generated/prisma";
import { err, notFound } from "@/lib/respond/response";

/**
 * Checks if a specific service is active in the system.
 * @param service Name of the service to check
 * @returns An error response if the service is inactive, or null if it's active
 */
export async function checkServiceStatus(service: Services) {
  const serviceConfig = await db.serviceCost.findUnique({
    where: { service },
    select: { isActive: true },
  });

  // If service config doesn't exist, we assume it's active or not restricted
  if (serviceConfig && !serviceConfig.isActive) {
    return err(
      `${service} service is currently inactive. Please contact support.`,
      403,
      "SERVICE_INACTIVE"
    );
  }

  return null;
}

/**
 * Checks if a workspace is active.
 * @param workspaceId ID of the workspace to check
 * @returns An error response if the workspace is inactive or not found, or the workspace if it's active
 */
export async function checkWorkspaceStatus(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      subscriberLimit: true,
      currentSubscribers: true,
      isActive: true,
    }
  });

  if (!workspace) {
    return { errorResponse: notFound("Workspace not found") };
  }

  if (!workspace.isActive) {
    return {
      errorResponse: err(
        "This workspace is currently inactive. Please contact the administrator.",
        403,
        "WORKSPACE_INACTIVE"
      )
    };
  }

  return { workspace };
}

/**
 * Checks if a service is active and returns the boolean status.
 * Useful for non-API route contexts.
 */
export async function isServiceActive(service: Services): Promise<boolean> {
  const serviceConfig = await db.serviceCost.findUnique({
    where: { service },
    select: { isActive: true },
  });

  return serviceConfig ? serviceConfig.isActive : true;
}
