import http from "node:http";
import { Hocuspocus } from "@hocuspocus/server";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import { getWorkspaceMembership, validateSessionToken } from "@/src/lib/auth";
import { DOCUMENT_WS_PATH } from "@/src/lib/constants";
import { rawDb } from "@/src/lib/db";
import { env } from "@/src/lib/env";
import { logger } from "@/src/lib/logger";

function extractWorkspaceId(documentName: string) {
  const [workspaceId] = documentName.split(":");
  return workspaceId;
}

function loadDocumentBinary(documentId: string) {
  const row = rawDb
    .prepare("SELECT ydoc FROM document_snapshots WHERE document_id = ?")
    .get(documentId) as { ydoc?: Buffer } | undefined;

  return row?.ydoc ? new Uint8Array(row.ydoc) : null;
}

function saveDocumentBinary(documentId: string, state: Buffer) {
  const now = Date.now();
  const existing = rawDb
    .prepare("SELECT json_preview FROM document_snapshots WHERE document_id = ?")
    .get(documentId) as { json_preview?: string } | undefined;

  rawDb
    .prepare(
      `
        INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(document_id) DO UPDATE SET
          ydoc = excluded.ydoc,
          json_preview = excluded.json_preview,
          updated_at = excluded.updated_at
      `,
    )
    .run(
      `snap_${documentId}`,
      documentId,
      state,
      existing?.json_preview ?? JSON.stringify({ syncedAt: now }),
      now,
    );

  rawDb
    .prepare("UPDATE documents SET updated_at = ? WHERE id = ?")
    .run(now, documentId);
}

const hocuspocus = new Hocuspocus({
  name: "nebula-collab",
  async onAuthenticate(data) {
    const token =
      typeof data.token === "string"
        ? data.token
        : Array.isArray(data.token)
          ? data.token[0]
          : undefined;

    const userAgent = data.requestHeaders["user-agent"];
    const forwardedFor = data.requestHeaders["x-forwarded-for"];
    const session = await validateSessionToken(token, {
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
      forwardedFor: Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor,
    });

    if (!session) {
      throw new Error("No autenticado");
    }

    const workspaceId = extractWorkspaceId(data.documentName);
    const membership = getWorkspaceMembership(workspaceId, session.user.id);
    if (!membership) {
      throw new Error("Sin acceso al workspace");
    }

    return {
      user: session.user,
      workspaceId,
      role: membership.role,
    };
  },
  async onLoadDocument(data) {
    const binary = loadDocumentBinary(data.documentName);
    if (!binary) {
      return new Y.Doc();
    }

    const doc = new Y.Doc();
    Y.applyUpdate(doc, binary);
    return doc;
  },
  async onStoreDocument(data) {
    const state = Buffer.from(Y.encodeStateAsUpdate(data.document));
    saveDocumentBinary(data.documentName, state);
  },
});

const server = http.createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "collab" }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "", `http://${request.headers.host ?? "127.0.0.1"}`);
  if (url.pathname !== DOCUMENT_WS_PATH) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    hocuspocus.handleConnection(ws, request);
  });
});

server.listen(env.COLLAB_PORT, () => {
  logger.info({ port: env.COLLAB_PORT }, "Servidor de colaboracion listo");
});
