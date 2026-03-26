import { and, desc, eq, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db, rawDb } from "@/src/lib/db";
import {
  activities,
  comments,
  documentPermissions,
  documentPresence,
  documents,
  files,
  notifications,
  tasks,
  workspaceEvents,
  workspaceMembers,
  workspaces,
} from "@/src/lib/schema";
import type { ActiveSession, WorkspaceRole } from "@/src/lib/auth";
import { AuthError, getWorkspaceMembership, requireMembershipRole } from "@/src/lib/auth";
import { roleRank } from "@/src/lib/constants";
import { createId, nowTs, safeJsonParse, slugify } from "@/src/lib/utils";
import { createDocumentBinaryFromHtml } from "@/src/lib/ydoc";

const commentSanitizeOptions = {
  allowedTags: ["p", "b", "i", "em", "strong", "a", "code", "ul", "ol", "li", "br"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, commentSanitizeOptions).trim();
}

function requireWorkspaceMember(session: ActiveSession, workspaceId: string) {
  const membership = getWorkspaceMembership(workspaceId, session.user.id);
  if (!membership) {
    throw new AuthError("No perteneces a este workspace", 403);
  }
  return membership;
}

function canAccessDocument(
  role: WorkspaceRole,
  accessLevel: string | undefined,
  needsWrite = false,
) {
  if (roleRank[role] >= roleRank.manager) return true;
  if (!accessLevel) return !needsWrite && roleRank[role] >= roleRank.viewer;

  const accessRank = {
    read: 0,
    comment: 1,
    write: 2,
    admin: 3,
  } as const;

  return needsWrite ? accessRank[accessLevel as keyof typeof accessRank] >= accessRank.write : true;
}

export function appendWorkspaceEvent(
  workspaceId: string,
  channel: string,
  eventType: string,
  payload: unknown,
) {
  db.insert(workspaceEvents)
    .values({
      workspaceId,
      kind: eventType,
      channel,
      eventType,
      payloadJson: JSON.stringify(payload),
      createdAt: nowTs(),
    })
    .run();
}

export function logActivity(
  workspaceId: string,
  action: string,
  entityType: string,
  entityId: string,
  actorId: string | null,
  metadata: Record<string, unknown> = {},
) {
  db.insert(activities)
    .values({
      id: createId("act"),
      workspaceId,
      actorId,
      action,
      entityType,
      entityId,
      metadataJson: JSON.stringify(metadata),
      createdAt: nowTs(),
    })
    .run();
}

export function listUserWorkspaces(session: ActiveSession) {
  return db
    .select({
      id: workspaces.id,
      slug: workspaces.slug,
      name: workspaces.name,
      description: workspaces.description,
      plan: workspaces.plan,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, session.user.id))
    .orderBy(workspaces.name)
    .all();
}

export function createWorkspace(session: ActiveSession, input: { name: string; description: string }) {
  const id = createId("ws");
  const baseSlug = slugify(input.name) || createId("ws");
  const existingCount = Number(
    (
      rawDb
        .prepare("SELECT COUNT(*) AS count FROM workspaces WHERE slug = ? OR slug LIKE ?")
        .get(baseSlug, `${baseSlug}-%`) as { count: number }
    ).count,
  );
  const slug = existingCount === 0 ? baseSlug : `${baseSlug}-${existingCount + 1}`;
  const now = nowTs();

  db.insert(workspaces)
    .values({
      id,
      slug,
      name: input.name,
      description: input.description,
      plan: "pro",
      locale: "es",
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  db.insert(workspaceMembers)
    .values({
      id: createId("mem"),
      workspaceId: id,
      userId: session.user.id,
      role: "owner",
      title: "Owner",
      joinedAt: now,
    })
    .run();

  logActivity(id, "workspace.created", "workspace", id, session.user.id, {
    name: input.name,
  });
  appendWorkspaceEvent(id, "workspace", "workspace.created", {
    workspaceId: id,
    name: input.name,
  });

  return { id, slug };
}

export function getWorkspaceOverview(session: ActiveSession, workspaceId: string) {
  const membership = requireWorkspaceMember(session, workspaceId);

  const workspace = db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .get();

  if (!workspace) {
    throw new AuthError("Workspace no encontrado", 404);
  }

  const memberCount = Number(
    (
      rawDb
        .prepare("SELECT COUNT(*) AS count FROM workspace_members WHERE workspace_id = ?")
        .get(workspaceId) as { count: number }
    ).count,
  );

  const documentCount = Number(
    (
      rawDb
        .prepare("SELECT COUNT(*) AS count FROM documents WHERE workspace_id = ?")
        .get(workspaceId) as { count: number }
    ).count,
  );

  const taskCount = Number(
    (
      rawDb.prepare("SELECT COUNT(*) AS count FROM tasks WHERE workspace_id = ?").get(workspaceId) as {
        count: number;
      }
    ).count,
  );

  const recentActivity = db
    .select()
    .from(activities)
    .where(eq(activities.workspaceId, workspaceId))
    .orderBy(desc(activities.createdAt))
    .limit(8)
    .all()
    .map((entry) => ({
      ...entry,
      metadata: safeJsonParse(entry.metadataJson, {}),
    }));

  const recentDocuments = db
    .select({
      id: documents.id,
      title: documents.title,
      summary: documents.summary,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.workspaceId, workspaceId))
    .orderBy(desc(documents.updatedAt))
    .limit(4)
    .all();

  return {
    workspace,
    membership,
    stats: {
      memberCount,
      documentCount,
      taskCount,
    },
    recentActivity,
    recentDocuments,
  };
}

export function listWorkspaceDocuments(session: ActiveSession, workspaceId: string) {
  requireWorkspaceMember(session, workspaceId);

  return rawDb
    .prepare(
      `
        SELECT d.*, dp.access_level as accessLevel
        FROM documents d
        LEFT JOIN document_permissions dp
          ON dp.document_id = d.id AND dp.subject_type = 'member' AND dp.subject_id = ?
        WHERE d.workspace_id = ?
        ORDER BY d.updated_at DESC
      `,
    )
    .all(session.user.id, workspaceId);
}

export function createDocument(
  session: ActiveSession,
  workspaceId: string,
  input: { title: string; summary: string; kind: string; projectId?: string | null },
) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("editor", membership);

  const id = createId("doc");
  const now = nowTs();
  const html = `<h1>${sanitizeHtml(input.title)}</h1><p>${sanitizeHtml(input.summary)}</p>`;
  const binary = createDocumentBinaryFromHtml(html);

  db.insert(documents)
    .values({
      id,
      workspaceId,
      projectId: input.projectId ?? null,
      title: input.title,
      summary: input.summary,
      kind: input.kind,
      isArchived: false,
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  db.insert(documentPermissions)
    .values([
      {
        id: createId("dpr"),
        documentId: id,
        subjectType: "member",
        subjectId: session.user.id,
        accessLevel: "admin",
        createdAt: now,
      },
      {
        id: createId("dpr"),
        documentId: id,
        subjectType: "workspace_role",
        subjectId: "editor",
        accessLevel: "write",
        createdAt: now,
      },
    ])
    .run();

  rawDb
    .prepare(
      `
        INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(createId("snap"), id, binary, JSON.stringify({ title: input.title, html }), now);

  logActivity(workspaceId, "document.created", "document", id, session.user.id, {
    title: input.title,
    kind: input.kind,
  });
  appendWorkspaceEvent(workspaceId, "documents", "document.created", {
    documentId: id,
    title: input.title,
  });

  return { id };
}

export function getDocumentDetail(session: ActiveSession, workspaceId: string, documentId: string) {
  const membership = requireWorkspaceMember(session, workspaceId);

  const row = rawDb
    .prepare(
      `
        SELECT d.*, dp.access_level AS accessLevel
        FROM documents d
        LEFT JOIN document_permissions dp
          ON dp.document_id = d.id AND dp.subject_type = 'member' AND dp.subject_id = ?
        WHERE d.id = ? AND d.workspace_id = ?
      `,
    )
    .get(session.user.id, documentId, workspaceId) as
    | (Record<string, unknown> & { accessLevel?: string; role?: string })
    | undefined;

  if (!row) {
    throw new AuthError("Documento no encontrado", 404);
  }

  const role = membership.role as WorkspaceRole;
  if (!canAccessDocument(role, row.accessLevel, false)) {
    throw new AuthError("No tienes acceso al documento", 403);
  }

  const snapshot = db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .get();

  const commentsList = db
    .select()
    .from(comments)
    .where(and(eq(comments.workspaceId, workspaceId), eq(comments.documentId, documentId)))
    .orderBy(comments.createdAt)
    .all();

  const presence = db
    .select()
    .from(documentPresence)
    .where(eq(documentPresence.documentId, documentId))
    .all();

  return {
    document: snapshot,
    comments: commentsList,
    presence,
    canWrite: canAccessDocument(role, row.accessLevel, true),
  };
}

export function listWorkspaceTasks(session: ActiveSession, workspaceId: string) {
  requireWorkspaceMember(session, workspaceId);

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId))
    .orderBy(desc(tasks.updatedAt))
    .all();
}

export function createTask(
  session: ActiveSession,
  workspaceId: string,
  input: {
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeId?: string | null;
    projectId?: string | null;
  },
) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("editor", membership);

  const id = createId("tsk");
  const now = nowTs();

  db.insert(tasks)
    .values({
      id,
      workspaceId,
      projectId: input.projectId ?? null,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId ?? null,
      reporterId: session.user.id,
      dueAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  logActivity(workspaceId, "task.created", "task", id, session.user.id, {
    title: input.title,
  });
  appendWorkspaceEvent(workspaceId, "tasks", "task.created", { taskId: id, title: input.title });

  return { id };
}

export function createComment(
  session: ActiveSession,
  workspaceId: string,
  input: {
    body: string;
    documentId?: string | null;
    taskId?: string | null;
    parentId?: string | null;
  },
) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("viewer", membership);

  const body = sanitizeRichText(input.body);
  if (!body) {
    throw new AuthError("El comentario no puede estar vacio", 400);
  }

  const id = createId("cmt");
  const now = nowTs();

  db.insert(comments)
    .values({
      id,
      workspaceId,
      documentId: input.documentId ?? null,
      taskId: input.taskId ?? null,
      parentId: input.parentId ?? null,
      authorId: session.user.id,
      body,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  appendWorkspaceEvent(workspaceId, "comments", "comment.created", {
    commentId: id,
    documentId: input.documentId,
    taskId: input.taskId,
    body,
    authorId: session.user.id,
  });
  logActivity(workspaceId, "comment.created", input.documentId ? "document" : "task", input.documentId ?? input.taskId ?? id, session.user.id, {
    commentId: id,
  });

  return { id, body };
}

export function searchWorkspace(session: ActiveSession, workspaceId: string, query: string) {
  requireWorkspaceMember(session, workspaceId);

  if (!query.trim()) return [];

  return rawDb
    .prepare(
      `
        SELECT entity_type, entity_id, title, body,
               snippet(search_index, 3, '<mark>', '</mark>', '...', 12) AS snippet
        FROM search_index
        WHERE workspace_id = ? AND search_index MATCH ?
        LIMIT 20
      `,
    )
    .all(workspaceId, query.trim());
}

export function createNotification(
  userId: string,
  workspaceId: string | null,
  title: string,
  body: string,
  kind = "system",
) {
  db.insert(notifications)
    .values({
      id: createId("ntf"),
      userId,
      workspaceId,
      title,
      body,
      kind,
      isRead: false,
      createdAt: nowTs(),
    })
    .run();
}

export function listNotifications(session: ActiveSession) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20)
    .all();
}

export function listWorkspaceMembers(session: ActiveSession, workspaceId: string) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("viewer", membership);

  return rawDb
    .prepare(
      `
        SELECT wm.id, wm.role, wm.title, wm.joined_at, u.id as userId, u.email, u.name, u.avatar_color as avatarColor, u.is_admin as isAdmin
        FROM workspace_members wm
        INNER JOIN users u ON u.id = wm.user_id
        WHERE wm.workspace_id = ?
        ORDER BY wm.joined_at ASC
      `,
    )
    .all(workspaceId);
}

export function addWorkspaceMember(
  session: ActiveSession,
  workspaceId: string,
  input: { email: string; role: WorkspaceRole; title: string },
) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("manager", membership);

  const user = db.select().from(workspaceMembers).limit(1).all(); // keep db typed import used
  void user;

  const userRow = rawDb
    .prepare("SELECT id, name FROM users WHERE email = ?")
    .get(input.email) as { id: string; name: string } | undefined;

  if (!userRow) {
    throw new AuthError("No existe un usuario con ese email", 404);
  }

  rawDb
    .prepare(
      `
        INSERT OR REPLACE INTO workspace_members (id, workspace_id, user_id, role, title, joined_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(createId("mem"), workspaceId, userRow.id, input.role, input.title, nowTs());

  appendWorkspaceEvent(workspaceId, "members", "member.upserted", {
    email: input.email,
    role: input.role,
  });
  createNotification(userRow.id, workspaceId, "Te unieron a un workspace", `Ahora formas parte de ${workspaceId}.`, "membership");
}

export function registerFile(
  session: ActiveSession,
  workspaceId: string,
  input: { filename: string; mimeType: string; size: number; storagePath: string; documentId?: string | null },
) {
  const membership = requireWorkspaceMember(session, workspaceId);
  requireMembershipRole("editor", membership);

  const id = createId("fil");

  db.insert(files)
    .values({
      id,
      workspaceId,
      uploadedBy: session.user.id,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      storagePath: input.storagePath,
      documentId: input.documentId ?? null,
      createdAt: nowTs(),
    })
    .run();

  appendWorkspaceEvent(workspaceId, "files", "file.uploaded", {
    fileId: id,
    filename: input.filename,
  });

  return { id };
}

export function getWorkspaceEvents(workspaceId: string, afterId = 0) {
  return db
    .select()
    .from(workspaceEvents)
    .where(and(eq(workspaceEvents.workspaceId, workspaceId), sql`${workspaceEvents.id} > ${afterId}`))
    .orderBy(workspaceEvents.id)
    .limit(100)
    .all();
}
