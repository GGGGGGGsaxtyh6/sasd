import { ZodError } from "zod";
import { AuthError } from "@/src/lib/auth";

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return json(data, init);
}

export function ok(data: unknown, init?: ResponseInit) {
  return json(data, init);
}

export function created(data: unknown) {
  return json(data, { status: 201 });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return json(data, init);
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error: message, ...(extra ?? {}) }, { status });
}

export function badRequest(message: string, extra?: Record<string, unknown>) {
  return jsonError(message, 400, extra);
}

export function successResponse(data: unknown, init?: ResponseInit) {
  return json(data, init);
}

export function errorResponse(error: unknown, status?: number) {
  if (typeof error === "string") {
    return json({ error }, { status: status ?? 400 });
  }

  if (error instanceof AuthError) {
    return json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return json(
      {
        error: "Validacion fallida",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  return json(
    {
      error: error instanceof Error ? error.message : "Error interno",
    },
    { status: 500 },
  );
}

export function createErrorResponse(error: unknown, status?: number) {
  return errorResponse(error, status);
}

export function createJsonResponse(data: unknown, init?: ResponseInit) {
  return json(data, init);
}

export function handleRouteError(error: unknown) {
  return errorResponse(error);
}

export function handleApiError(error: unknown) {
  return errorResponse(error);
}

export async function parseJson(request: Request) {
  return request.json();
}
