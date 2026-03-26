import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  ownerId: text("owner_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "editor", "viewer"] }).notNull().default("editor"),
  joinedAt: text("joined_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  content: text("content").notNull().default(""),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdById: text("created_by_id").notNull().references(() => users.id),
  parentId: text("parent_id"),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  icon: text("icon"),
  coverImage: text("cover_image"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["backlog", "todo", "in_progress", "in_review", "done", "cancelled"] }).notNull().default("todo"),
  priority: text("priority", { enum: ["none", "low", "medium", "high", "urgent"] }).notNull().default("none"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id").references(() => users.id),
  createdById: text("created_by_id").notNull().references(() => users.id),
  documentId: text("document_id").references(() => documents.id),
  dueDate: text("due_date"),
  labels: text("labels").notNull().default("[]"),
  order: real("order").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  documentId: text("document_id").references(() => documents.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  parentId: text("parent_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  uploadedById: text("uploaded_by_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  entityTitle: text("entity_title"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaceMembers),
  documents: many(documents),
  tasks: many(tasks),
  comments: many(comments),
  notifications: many(notifications),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  members: many(workspaceMembers),
  documents: many(documents),
  tasks: many(tasks),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [documents.workspaceId], references: [workspaces.id] }),
  createdBy: one(users, { fields: [documents.createdById], references: [users.id] }),
  comments: many(comments),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [tasks.workspaceId], references: [workspaces.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  document: one(documents, { fields: [comments.documentId], references: [documents.id] }),
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, { fields: [activityLog.userId], references: [users.id] }),
  workspace: one(workspaces, { fields: [activityLog.workspaceId], references: [workspaces.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
