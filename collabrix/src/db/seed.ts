import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(path.join(dbDir, "collabrix.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  const now = new Date().toISOString();

  // Users
  const adminId = uuid();
  const user1Id = uuid();
  const user2Id = uuid();

  db.insert(schema.users).values([
    { id: adminId, name: "Admin User", email: "admin@collabrix.dev", password: hashSync("password123", 12), role: "admin", createdAt: now, updatedAt: now },
    { id: user1Id, name: "Alice Johnson", email: "alice@collabrix.dev", password: hashSync("password123", 12), role: "user", createdAt: now, updatedAt: now },
    { id: user2Id, name: "Bob Smith", email: "bob@collabrix.dev", password: hashSync("password123", 12), role: "user", createdAt: now, updatedAt: now },
  ]).run();

  console.log("✅ Users created");

  // Workspace
  const wsId = uuid();
  db.insert(schema.workspaces).values({
    id: wsId, name: "Collabrix Team", slug: "collabrix-team", description: "Main workspace for the Collabrix team", ownerId: adminId, createdAt: now, updatedAt: now,
  }).run();

  db.insert(schema.workspaceMembers).values([
    { id: uuid(), workspaceId: wsId, userId: adminId, role: "owner", joinedAt: now },
    { id: uuid(), workspaceId: wsId, userId: user1Id, role: "editor", joinedAt: now },
    { id: uuid(), workspaceId: wsId, userId: user2Id, role: "editor", joinedAt: now },
  ]).run();

  console.log("✅ Workspace created");

  // Documents
  const doc1Id = uuid();
  const doc2Id = uuid();
  const doc3Id = uuid();

  db.insert(schema.documents).values([
    {
      id: doc1Id, title: "Welcome to Collabrix", icon: "👋",
      content: "# Welcome to Collabrix\n\nThis is your collaborative workspace. Here you can create documents, manage tasks, and work together in real time.\n\n## Getting Started\n\n1. **Create a document** – Click the + button to start writing\n2. **Add tasks** – Track your work with the task board\n3. **Collaborate** – Invite team members and work together\n4. **Use AI** – Summarize, rewrite, or generate content with AI\n\n## Features\n\n- Real-time collaboration\n- Rich text editing\n- Task management\n- AI-powered assistance\n- File uploads\n- Activity tracking",
      workspaceId: wsId, createdById: adminId, createdAt: now, updatedAt: now,
    },
    {
      id: doc2Id, title: "Product Roadmap Q2 2026", icon: "🗺️",
      content: "# Product Roadmap Q2 2026\n\n## Goals\n\n- Launch v2.0 of the platform\n- Improve real-time collaboration\n- Add AI-powered features\n- Enhance mobile experience\n\n## Timeline\n\n### April\n- User research & feedback analysis\n- Design system updates\n- Performance audit\n\n### May\n- AI integration\n- Collaboration improvements\n- Mobile responsive overhaul\n\n### June\n- Beta testing\n- Bug fixes\n- Launch preparation\n- v2.0 release",
      workspaceId: wsId, createdById: user1Id, createdAt: now, updatedAt: now,
    },
    {
      id: doc3Id, title: "Technical Architecture", icon: "🏗️",
      content: "# Technical Architecture\n\n## Stack\n\n- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS\n- **Backend**: Next.js API Routes + Server Actions\n- **Database**: SQLite with Drizzle ORM\n- **Auth**: Auth.js v5\n- **AI**: OpenAI API with streaming\n\n## Database Schema\n\nThe application uses a relational database with the following core tables:\n- users\n- workspaces\n- workspace_members\n- documents\n- tasks\n- comments\n- files\n- activity_log\n- notifications\n\n## Security\n\n- JWT-based sessions\n- Role-based access control (RBAC)\n- Input validation with Zod\n- Server-side authorization checks",
      workspaceId: wsId, createdById: adminId, createdAt: now, updatedAt: now,
    },
  ]).run();

  console.log("✅ Documents created");

  // Tasks
  const taskStatuses = ["backlog", "todo", "in_progress", "in_review", "done"] as const;
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const taskData = [
    { title: "Set up CI/CD pipeline", status: "done", priority: "high", assignee: user1Id },
    { title: "Design landing page", status: "done", priority: "medium", assignee: user2Id },
    { title: "Implement user authentication", status: "done", priority: "urgent", assignee: adminId },
    { title: "Create database schema", status: "done", priority: "high", assignee: user1Id },
    { title: "Build document editor", status: "in_review", priority: "high", assignee: user1Id },
    { title: "Implement real-time collaboration", status: "in_progress", priority: "urgent", assignee: adminId },
    { title: "Add AI features", status: "in_progress", priority: "high", assignee: user2Id },
    { title: "Design task board UI", status: "in_progress", priority: "medium", assignee: user2Id },
    { title: "Implement file uploads", status: "todo", priority: "medium", assignee: user1Id },
    { title: "Add search functionality", status: "todo", priority: "medium", assignee: null },
    { title: "Write E2E tests", status: "todo", priority: "high", assignee: null },
    { title: "Performance optimization", status: "backlog", priority: "low", assignee: null },
    { title: "Mobile responsive design", status: "backlog", priority: "medium", assignee: null },
    { title: "Add keyboard shortcuts", status: "backlog", priority: "low", assignee: null },
    { title: "Internationalization setup", status: "backlog", priority: "low", assignee: null },
  ];

  for (const t of taskData) {
    db.insert(schema.tasks).values({
      id: uuid(),
      title: t.title,
      status: t.status as typeof taskStatuses[number],
      priority: t.priority as typeof priorities[number],
      assigneeId: t.assignee,
      workspaceId: wsId,
      createdById: adminId,
      labels: "[]",
      createdAt: now,
      updatedAt: now,
    }).run();
  }

  console.log("✅ Tasks created");

  // Comments
  db.insert(schema.comments).values([
    { id: uuid(), content: "Great progress on this document! Let's review it together.", documentId: doc1Id, userId: user1Id, createdAt: now, updatedAt: now },
    { id: uuid(), content: "I've added more details to the architecture section.", documentId: doc3Id, userId: adminId, createdAt: now, updatedAt: now },
    { id: uuid(), content: "Should we add a timeline to the roadmap?", documentId: doc2Id, userId: user2Id, createdAt: now, updatedAt: now },
  ]).run();

  console.log("✅ Comments created");

  // Activity log
  db.insert(schema.activityLog).values([
    { id: uuid(), action: "created", entityType: "workspace", entityId: wsId, entityTitle: "Collabrix Team", workspaceId: wsId, userId: adminId, createdAt: now },
    { id: uuid(), action: "created", entityType: "document", entityId: doc1Id, entityTitle: "Welcome to Collabrix", workspaceId: wsId, userId: adminId, createdAt: now },
    { id: uuid(), action: "created", entityType: "document", entityId: doc2Id, entityTitle: "Product Roadmap Q2 2026", workspaceId: wsId, userId: user1Id, createdAt: now },
    { id: uuid(), action: "created", entityType: "document", entityId: doc3Id, entityTitle: "Technical Architecture", workspaceId: wsId, userId: adminId, createdAt: now },
  ]).run();

  console.log("✅ Activity log created");

  // Notifications
  db.insert(schema.notifications).values([
    { id: uuid(), userId: user1Id, type: "mention", title: "You were mentioned", message: "Admin mentioned you in Welcome to Collabrix", link: `/workspace/${wsId}/documents/${doc1Id}`, createdAt: now },
    { id: uuid(), userId: user2Id, type: "assignment", title: "Task assigned", message: "You were assigned to 'Design landing page'", createdAt: now },
    { id: uuid(), userId: adminId, type: "comment", title: "New comment", message: "Alice commented on Welcome to Collabrix", link: `/workspace/${wsId}/documents/${doc1Id}`, createdAt: now },
  ]).run();

  console.log("✅ Notifications created");
  console.log("\n🎉 Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  admin@collabrix.dev / password123 (Admin)");
  console.log("  alice@collabrix.dev / password123 (Editor)");
  console.log("  bob@collabrix.dev   / password123 (Editor)");

  sqlite.close();
}

seed().catch(console.error);
