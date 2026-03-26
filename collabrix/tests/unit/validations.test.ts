import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  workspaceSchema,
  documentSchema,
  taskSchema,
  commentSchema,
  aiSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "notanemail", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct registration data", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "test@test.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "invalid",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("workspaceSchema", () => {
  it("validates correct workspace data", () => {
    const result = workspaceSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
  });

  it("validates with description", () => {
    const result = workspaceSchema.safeParse({
      name: "My Workspace",
      description: "A test workspace",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = workspaceSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });
});

describe("documentSchema", () => {
  it("validates correct document data", () => {
    const result = documentSchema.safeParse({ title: "My Document" });
    expect(result.success).toBe(true);
  });

  it("validates with content and icon", () => {
    const result = documentSchema.safeParse({
      title: "Doc",
      content: "Some content",
      icon: "📝",
    });
    expect(result.success).toBe(true);
  });
});

describe("taskSchema", () => {
  it("validates correct task data", () => {
    const result = taskSchema.safeParse({ title: "My Task" });
    expect(result.success).toBe(true);
  });

  it("validates with all fields", () => {
    const result = taskSchema.safeParse({
      title: "My Task",
      description: "Description",
      status: "in_progress",
      priority: "high",
      assigneeId: "user-123",
      dueDate: "2026-12-31",
      labels: ["bug", "frontend"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = taskSchema.safeParse({
      title: "My Task",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = taskSchema.safeParse({
      title: "My Task",
      priority: "super_high",
    });
    expect(result.success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("validates correct comment data", () => {
    const result = commentSchema.safeParse({ content: "Great work!" });
    expect(result.success).toBe(true);
  });

  it("rejects empty comment", () => {
    const result = commentSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });
});

describe("aiSchema", () => {
  it("validates correct AI request", () => {
    const result = aiSchema.safeParse({
      action: "summarize",
      content: "Some text to summarize",
    });
    expect(result.success).toBe(true);
  });

  it("validates all action types", () => {
    const actions = ["summarize", "rewrite", "generate", "classify", "ask"];
    for (const action of actions) {
      const result = aiSchema.safeParse({ action, content: "test" });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid action", () => {
    const result = aiSchema.safeParse({ action: "invalid", content: "test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = aiSchema.safeParse({ action: "summarize", content: "" });
    expect(result.success).toBe(false);
  });
});
