import { and, desc, eq, sql } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db, rawDb } from "@/src/lib/db";
import { AuthError, getWorkspaceMembership, requireMembershipRole } from "@/src/lib/auth";
import { comments, documentSnapshots, documents } from "@/src/lib/schema";
import { createId, nowTs } from "@/src/lib/utils";
import { createDocumentBinaryFromHtml } from "@/src/lib/ydoc";

function ensureMembership(workspaceId: string, userId: string) {
  const membership = getWorkspaceMembership(workspaceId, userId);
  if (!membership) {
    throw new AuthError("No perteneces a este workspace", 403);
  }
  return membership;
}

export function listDocuments(workspaceId: string, userId: string) {
  ensureMembership(workspaceId, userId);

  return db
    .select({
      id: documents.id,
      title: documents.title,
      summary: documents.summary,
      kind: documents.kind,
      isArchived: documents.isArchived,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.workspaceId, workspaceId))
    .orderBy(desc(documents.updatedAt))
    .all();
}

export function getDocument(workspaceId: string, documentId: string, userId: string) {
  ensureMembership(workspaceId, userId);

  const document = db
    .select({
      id: documents.id,
      workspaceId: documents.workspaceId,
      title: documents.title,
      summary: documents.summary,
      kind: documents.kind,
      updatedAt: documents.updatedAt,
      createdAt: documents.createdAt,
      jsonPreview: documentSnapshots.jsonPreview,
    })
    .from(documents)
    .leftJoin(documentSnapshots, eq(documentSnapshots.documentId, documents.id))
    .where(and(eq(documents.workspaceId, workspaceId), eq(documents.id, documentId)))
    .get();

  if (!document) {
    throw new AuthError("Documento no encontrado", 404);
  }

  const commentThreads = db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      body: comments.body,
      authorId: comments.authorId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
    .from(comments)
    .where(and(eq(comments.workspaceId, workspaceId), eq(comments.documentId, documentId)))
    .orderBy(comments.createdAt)
    .all();

  return {
    ...document,
    commentThreads,
  };
}

export function createDocument(input: {
  workspaceId: string;
  userId: string;
  title: string;
  summary?: string;
  kind?: string;
}) {
  const membership = ensureMembership(input.workspaceId, input.userId);
  requireMembershipRole("editor", membership);

  const now = nowTs();
  const documentId = createId("doc");
  const title = input.title.trim();
  const summary = sanitizeHtml(input.summary ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
  const html = `<h1>${title}</h1><p>${summary || "Documento nuevo listo para colaborar."}</p>`;

  const tx = rawDb.transaction(() => {
    rawDb
      .prepare(
        `INSERT INTO documents (id, workspace_id, title, summary, kind, is_archived, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        documentId,
        input.workspaceId,
        title,
        summary,
        input.kind ?? "document",
        0,
        input.userId,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        createId("snap"),
        documentId,
        createDocumentBinaryFromHtml(html),
        JSON.stringify({ html }),
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO document_permissions (id, document_id, subject_type, subject_id, access_level, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("dpr"), documentId, "member", input.userId, "admin", now);

    rawDb
      .prepare(
        `INSERT INTO workspace_events (workspace_id, channel, event_type, payload_json, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        input.workspaceId,
        "documents",
        "document.created",
        JSON.stringify({ id: documentId, title, summary }),
        now,
      );
  });

  tx();

  return getDocument(input.workspaceId, documentId, input.userId);
}

export function updateDocumentMetadata(input: {
  workspaceId: string;
  documentId: string;
  userId: string;
  title: string;
  summary: string;
}) {
  const membership = ensureMembership(input.workspaceId, input.userId);
  requireMembershipRole("editor", membership);

  const existing = db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.workspaceId, input.workspaceId), eq(documents.id, input.documentId)))
    .get();

  if (!existing) {
    throw new AuthError("Documento no encontrado", 404);
  }

  const title = input.title.trim();
  const summary = sanitizeHtml(input.summary, { allowedTags: [], allowedAttributes: {} }).trim();
  const now = nowTs();

  db.update(documents)
    .set({ title, summary, updatedAt: now })
    .where(eq(documents.id, input.documentId))
    .run();

  db.update(documentSnapshots)
    .set({
      jsonPreview: sql`json_set(coalesce(${documentSnapshots.jsonPreview}, '{}'), '$.title', ${title}, '$.summary', ${summary})`,
      updatedAt: now,
    })
    .where(eq(documentSnapshots.documentId, input.documentId))
    .run();

  rawDb
    .prepare(
      `INSERT INTO workspace_events (workspace_id, channel, event_type, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.workspaceId,
      "documents",
      "document.updated",
      JSON.stringify({ id: input.documentId, title, summary }),
      now,
    );

  return getDocument(input.workspaceId, input.documentId, input.userId);
}

export function getDocumentBinary(documentId: string) {
  const row = db
    .select({
      ydoc: documentSnapshots.ydoc,
    })
    .from(documentSnapshots)
    .where(eq(documentSnapshots.documentId, documentId))
    .get();

  return row?.ydoc ?? null;
}

export function storeDocumentBinary(documentId: string, ydoc: Buffer, jsonPreview: string) {
  const now = nowTs();
  rawDb
    .prepare(
      `INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(document_id) DO UPDATE SET
         ydoc = excluded.ydoc,
         json_preview = excluded.json_preview,
         updated_at = excluded.updated_at`,
    )
    .run(createId("snap"), documentId, ydoc, jsonPreview, now);

  db.update(documents).set({ updatedAt: now }).where(eq(documents.id, documentId)).run();
}
