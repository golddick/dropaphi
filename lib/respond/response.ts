// ============================================================
// DROP API — API Response Helpers
// src/lib/respond/response.ts
// ============================================================

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
};

export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, ...(message && { message }) },
    { status }
  );
}

export function created<T>(data: T, message?: string) {
  return ok(data, message, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function err(
  error: string,
  status = 400,
  code?: string,
  details?: unknown
) {
  const errorObj: ApiError = { success: false, error };
  if (code) errorObj.code = code;
  if (details) errorObj.details = details;
  return NextResponse.json<ApiError>(errorObj, { status });
}

export function unauthorized(msg = "Unauthorized") {
  return err(msg, 401, "UNAUTHORIZED");
}

export function forbidden(msg = "Forbidden") {
  return err(msg, 403, "FORBIDDEN");
}

export function notFound(msg = "Not found") {
  return err(msg, 404, "NOT_FOUND");
}

export function conflict(msg: string, code = "CONFLICT") {
  return err(msg, 409, code);
}

export function validationError(zodError: ZodError) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: zodError.flatten().fieldErrors,
    },
    { status: 422 }
  );
}

export function serverError(msg = "Internal server error") {
  return err(msg, 500, "SERVER_ERROR");
}
