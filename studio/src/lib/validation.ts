import { z, ZodError, type ZodType } from "zod";
import { jsonError } from "@/src/lib/http";

export function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

export function zodErrorResponse(error: ZodError) {
  return jsonError("Entrada no valida", 400, {
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const workspaceCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(500),
});

export const addMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["viewer", "editor", "manager", "owner"]),
  title: z.string().trim().min(2).max(80).default("Miembro"),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().max(1000).default(""),
  kind: z.enum(["document", "canvas"]).default("document"),
});

export const documentMetadataSchema = z.object({
  documentId: z.string().min(2),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().max(1000).default(""),
});

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export const commentInputSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  documentId: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const querySchema = z.object({
  q: z.string().trim().min(1).max(120),
});

export const aiActionSchema = z.object({
  action: z.enum(["summarize", "rewrite", "classify", "generate", "ask"]),
  documentId: z.string().nullable().optional(),
  text: z.string().trim().max(12000).default(""),
  instruction: z.string().trim().max(2000).default(""),
});

export async function validateBody<T>(request: Request, schema: ZodType<T>) {
  return schema.parse(await request.json());
}

export async function withParsedBody<T>(request: Request, schema: ZodType<T>) {
  return validateBody(request, schema);
}
