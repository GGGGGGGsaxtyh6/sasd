import fs from "node:fs";
import path from "node:path";
import { env } from "@/src/lib/env";
import { hashPassword } from "@/src/lib/auth";
import { rawDb } from "@/src/lib/db";
import { logger } from "@/src/lib/logger";
import {
  DEFAULT_USER_AVATARS,
  MEMBER_ROLES,
  PROJECT_STATUS,
  TASK_PRIORITY,
  TASK_STATUS,
  WORKSPACE_PLAN,
} from "@/src/lib/constants";
import { createId, nowTs, slugify } from "@/src/lib/utils";
import { createDocumentBinaryFromHtml } from "@/src/lib/ydoc";

async function seed() {
  fs.mkdirSync(path.dirname(env.DATABASE_PATH), { recursive: true });
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

  const existingUsers = rawDb
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  if (existingUsers.count > 0) {
    logger.info("Seed omitido porque la base ya contiene datos");
    return;
  }

  const now = nowTs();
  const adminId = createId("usr");
  const memberId = createId("usr");
  const viewerId = createId("usr");
  const workspaceId = createId("ws");
  const projectId = createId("prj");
  const strategyDocId = createId("doc");
  const canvasDocId = createId("doc");
  const taskOneId = createId("tsk");
  const taskTwoId = createId("tsk");
  const commentRootId = createId("cmt");
  const commentReplyId = createId("cmt");
  const fileId = createId("fil");

  const adminHash = await hashPassword("Admin123456!");
  const memberHash = await hashPassword("Admin123456!");
  const viewerHash = await hashPassword("Admin123456!");

  const strategyHtml = `
    <h1>Estrategia Q2</h1>
    <p>Unificar documentos, tablero y tareas bajo un workspace AI-native con colaboración en tiempo real.</p>
    <p>Priorizar permisos por recurso, búsqueda full-text y automatizaciones útiles dentro del contexto del equipo.</p>
  `;

  const canvasHtml = `
    <h1>Canvas de lanzamiento</h1>
    <p>Hipótesis principal: el equipo adopta más rápido si todo ocurre en el mismo lugar.</p>
    <p>Bloques: posicionamiento, activación, feedback loop e insights de IA.</p>
  `;

  const strategyBinary = createDocumentBinaryFromHtml(strategyHtml);
  const canvasBinary = createDocumentBinaryFromHtml(canvasHtml);

  const tx = rawDb.transaction(() => {
    rawDb
      .prepare(
        `INSERT INTO users (id, email, name, password_hash, avatar_color, locale, is_admin, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        adminId,
        env.ADMIN_EMAIL,
        "Admin Demo",
        adminHash,
        DEFAULT_USER_AVATARS[0],
        "es",
        1,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO users (id, email, name, password_hash, avatar_color, locale, is_admin, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        memberId,
        "maria@example.com",
        "Maria Producto",
        memberHash,
        DEFAULT_USER_AVATARS[1],
        "es",
        0,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO users (id, email, name, password_hash, avatar_color, locale, is_admin, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        viewerId,
        "diego@example.com",
        "Diego Stakeholder",
        viewerHash,
        DEFAULT_USER_AVATARS[2],
        "es",
        0,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO workspaces (id, slug, name, description, plan, locale, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        workspaceId,
        slugify("Nebula Studio"),
        "Nebula Studio",
        "Workspace colaborativo para estrategia, specs, tareas y automatizaciones con IA.",
        WORKSPACE_PLAN.PRO,
        "es",
        adminId,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, title, joined_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("mem"), workspaceId, adminId, MEMBER_ROLES.OWNER, "Founder", now);
    rawDb
      .prepare(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, title, joined_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("mem"), workspaceId, memberId, MEMBER_ROLES.EDITOR, "Product Lead", now);
    rawDb
      .prepare(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, title, joined_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("mem"), workspaceId, viewerId, MEMBER_ROLES.VIEWER, "Stakeholder", now);

    rawDb
      .prepare(
        `INSERT INTO projects (id, workspace_id, name, description, status, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        projectId,
        workspaceId,
        "Lanzamiento Alpha",
        "Coordinación transversal entre producto, diseño, contenido y ejecución del lanzamiento.",
        PROJECT_STATUS.ACTIVE,
        adminId,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO documents (id, workspace_id, project_id, title, summary, kind, is_archived, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        strategyDocId,
        workspaceId,
        projectId,
        "Estrategia Q2",
        "Documento vivo con foco de producto, riesgos y prioridades del trimestre.",
        "document",
        0,
        adminId,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO documents (id, workspace_id, project_id, title, summary, kind, is_archived, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        canvasDocId,
        workspaceId,
        projectId,
        "Canvas de lanzamiento",
        "Lienzo estructurado con hipótesis, bloques y narrativa de lanzamiento.",
        "canvas",
        0,
        memberId,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO document_permissions (id, document_id, subject_type, subject_id, access_level, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("dpr"), strategyDocId, "member", adminId, "admin", now);
    rawDb
      .prepare(
        `INSERT INTO document_permissions (id, document_id, subject_type, subject_id, access_level, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("dpr"), strategyDocId, "member", memberId, "write", now);
    rawDb
      .prepare(
        `INSERT INTO document_permissions (id, document_id, subject_type, subject_id, access_level, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(createId("dpr"), strategyDocId, "member", viewerId, "comment", now);

    rawDb
      .prepare(
        `INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        createId("snap"),
        strategyDocId,
        strategyBinary,
        JSON.stringify({ title: "Estrategia Q2", html: strategyHtml }),
        now,
      );
    rawDb
      .prepare(
        `INSERT INTO document_snapshots (id, document_id, ydoc, json_preview, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        createId("snap"),
        canvasDocId,
        canvasBinary,
        JSON.stringify({ title: "Canvas de lanzamiento", html: canvasHtml }),
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO tasks (id, workspace_id, project_id, title, description, status, priority, assignee_id, reporter_id, due_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        taskOneId,
        workspaceId,
        projectId,
        "Definir arquitectura de tiempo real",
        "Cerrar la estrategia CRDT, persistencia y presencia multiusuario antes del lanzamiento interno.",
        TASK_STATUS.IN_PROGRESS,
        TASK_PRIORITY.LOW,
        memberId,
        adminId,
        now + 86_400_000,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO tasks (id, workspace_id, project_id, title, description, status, priority, assignee_id, reporter_id, due_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        taskTwoId,
        workspaceId,
        projectId,
        "Preparar demo con IA",
        "Conectar acciones de resumen, reescritura y clasificación al contexto del workspace.",
        TASK_STATUS.TODO,
        TASK_PRIORITY.MEDIUM,
        adminId,
        memberId,
        now + 172_800_000,
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO comments (id, workspace_id, document_id, task_id, parent_id, author_id, body, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        commentRootId,
        workspaceId,
        strategyDocId,
        null,
        null,
        memberId,
        "Necesitamos explicitar mejor el riesgo de permisos por documento antes de abrir invitados.",
        now,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO comments (id, workspace_id, document_id, task_id, parent_id, author_id, body, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        commentReplyId,
        workspaceId,
        strategyDocId,
        null,
        commentRootId,
        adminId,
        "De acuerdo; lo conecto con el modelo de roles y el panel admin.",
        now,
        now,
      );

    const storagePath = path.join(env.UPLOAD_DIR, `${fileId}-brief.txt`);
    fs.writeFileSync(
      storagePath,
      "Documento de apoyo para el lanzamiento alpha del workspace.\n",
      "utf8",
    );

    rawDb
      .prepare(
        `INSERT INTO files (id, workspace_id, uploaded_by, filename, mime_type, size, storage_path, document_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        fileId,
        workspaceId,
        adminId,
        "brief.txt",
        "text/plain",
        fs.statSync(storagePath).size,
        storagePath,
        strategyDocId,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO notifications (id, user_id, workspace_id, title, body, kind, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        createId("ntf"),
        adminId,
        workspaceId,
        "Bienvenido al workspace demo",
        "Tienes documentos colaborativos, tareas y comentarios listos para explorar.",
        "system",
        0,
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO activities (id, workspace_id, actor_id, entity_type, entity_id, action, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        createId("act"),
        workspaceId,
        adminId,
        "workspace",
        workspaceId,
        "workspace.created",
        JSON.stringify({ plan: WORKSPACE_PLAN.PRO }),
        now,
      );

    rawDb
      .prepare(
        `INSERT INTO activities (id, workspace_id, actor_id, entity_type, entity_id, action, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        createId("act"),
        workspaceId,
        memberId,
        "document",
        strategyDocId,
        "document.comment.created",
        JSON.stringify({ commentId: commentRootId }),
        now,
      );
  });

  tx();
  logger.info("Datos demo cargados");
}

void seed();
