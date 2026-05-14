import { z } from "zod";
import { WorkspaceRole } from "../generated/prisma";


export const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),
  industry: z.string().max(500).optional().nullable(),
  teamSize: z.string().optional().nullable(),
  timezone: z.string().default("Africa/Lagos"),
});

export const updateWorkspaceSchema = workspaceSchema.partial();

export const workspaceMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.DEVELOPER),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.nativeEnum(WorkspaceRole),
});

export const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  isTest: z.boolean().default(false),
  permissions: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const subscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "UNSUBSCRIBED", "BOUNCED"]).default("ACTIVE"),
  segments: z.array(z.string()).default([]),
  customFields: z.record(z.any()).optional().nullable(),
});

export const updateSubscriberSchema = subscriberSchema.partial();
