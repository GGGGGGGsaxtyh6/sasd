import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const membershipRoles = {
  enumValues: ["viewer", "editor", "manager", "owner"] as const,
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarColor: text("avatar_color").notNull(),
    locale: text("locale").notNull().default("es"),
    isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "number" }).notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    lastSeenAt: integer("last_seen_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_idx").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const workspaces = sqliteTable(
  "workspaces",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    plan: text("plan").notNull().default("pro"),
    locale: text("locale").notNull().default("es"),
    createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("workspaces_slug_idx").on(table.slug)],
);

export const workspaceMembers = sqliteTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    title: text("title").notNull().default("Miembro"),
    joinedAt: integer("joined_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_idx").on(table.workspaceId, table.userId),
    index("workspace_members_workspace_idx").on(table.workspaceId),
  ],
);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    kind: text("kind").notNull().default("doc"),
    isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
    createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("documents_workspace_idx").on(table.workspaceId)],
);

export const documentPermissions = sqliteTable(
  "document_permissions",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    accessLevel: text("access_level").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("document_permissions_unique_idx").on(table.documentId, table.subjectType, table.subjectId)],
);

export const documentSnapshots = sqliteTable(
  "document_snapshots",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    ydoc: blob("ydoc", { mode: "buffer" }).notNull(),
    jsonPreview: text("json_preview").notNull(),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("document_snapshots_document_idx").on(table.documentId)],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull(),
    priority: text("priority").notNull(),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    reporterId: text("reporter_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    dueAt: integer("due_at", { mode: "number" }),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("tasks_workspace_idx").on(table.workspaceId)],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    documentId: text("document_id").references(() => documents.id, { onDelete: "cascade" }),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("comments_workspace_idx").on(table.workspaceId)],
);

export const files = sqliteTable(
  "files",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    uploadedBy: text("uploaded_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size", { mode: "number" }).notNull(),
    storagePath: text("storage_path").notNull(),
    documentId: text("document_id").references(() => documents.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("files_workspace_idx").on(table.workspaceId)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    kind: text("kind").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
);

export const activities = sqliteTable(
  "activities",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    metadataJson: text("metadata_json").notNull().default("{}"),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("activities_workspace_idx").on(table.workspaceId)],
);

export const aiGenerations = sqliteTable(
  "ai_generations",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    prompt: text("prompt").notNull(),
    output: text("output").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("ai_generations_workspace_idx").on(table.workspaceId)],
);

export const workspaceEvents = sqliteTable(
  "workspace_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("workspace.event"),
    channel: text("channel").notNull(),
    eventType: text("event_type").notNull(),
    payloadJson: text("payload_json").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("workspace_events_workspace_id_id_idx").on(table.workspaceId, table.id)],
);

export const documentPresence = sqliteTable(
  "document_presence",
  {
    documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastSeenAt: integer("last_seen_at", { mode: "number" }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex("document_presence_pk").on(table.documentId, table.userId)],
);

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type TaskRow = typeof tasks.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
