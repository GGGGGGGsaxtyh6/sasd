import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const documentSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().optional(),
  icon: z.string().max(10).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
  parentId: z.string().optional().nullable(),
});

export const aiSchema = z.object({
  action: z.enum(["summarize", "rewrite", "generate", "classify", "ask"]),
  content: z.string().min(1).max(50000),
  context: z.string().max(50000).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type AIInput = z.infer<typeof aiSchema>;
