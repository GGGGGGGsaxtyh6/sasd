# Nebula Workspace

Plataforma colaborativa AI-native con documentos en tiempo real, tareas, comentarios, búsqueda full-text, uploads, RBAC, actividad y panel admin.

## Qué incluye

- Next.js 16 + React 19 + TypeScript.
- SQLite real con migraciones SQL y seed demo.
- Auth propia con sesiones HttpOnly y hashing `scrypt`.
- Colaboración CRDT con Tiptap + Yjs + Hocuspocus.
- Comentarios, notificaciones y eventos del workspace por SSE.
- IA integrada con OpenAI Responses API y fallback local si falta `OPENAI_API_KEY`.
- Upload de archivos a disco local.
- Dark mode, toasts y layout responsive.
- Tests unitarios con Vitest y E2E con Playwright.

## Estructura

- `app/`: rutas, páginas y route handlers.
- `src/components/`: UI, auth, layout y workspace.
- `src/lib/`: auth, DB, esquema, entorno, métricas y helpers.
- `src/services/`: lógica de dominio.
- `scripts/`: migraciones, seed y servidor realtime.
- `drizzle/`: migraciones SQL versionadas.
- `tests/`: unit y e2e.

## Requisitos

- Node.js 22+.
- npm 10+.

## Variables de entorno

Copia `.env.example` a `.env.local` si quieres cambiar valores. Por defecto el proyecto funciona localmente sin secretos externos, salvo la parte de IA remota.

Variables principales:

- `APP_URL=http://127.0.0.1:3000`
- `COLLAB_URL=ws://127.0.0.1:3001`
- `DATABASE_PATH=./data/app.db`
- `UPLOAD_DIR=./storage/uploads`
- `JWT_SECRET=...`
- `OPENAI_API_KEY=...` opcional
- `OPENAI_MODEL=gpt-4.1-mini`

## Arranque local

1. Instala dependencias:
   - `npm install`
2. Prepara base de datos y datos demo:
   - `npm run db:prepare`
3. Arranca web + realtime:
   - `npm run dev`

Servicios:

- Web: `http://127.0.0.1:3000`
- Realtime collaboration: `ws://127.0.0.1:3001/collaboration`

## Credenciales demo

- Admin:
  - `admin@example.com`
  - `Admin123456!`
- Usuario demo seed:
  - `maria@example.com`
  - `Admin123456!`

## Scripts

- `npm run dev`: web + realtime en desarrollo.
- `npm run build`: build Next.js.
- `npm run start`: runtime producción local.
- `npm run db:migrate`: aplica migraciones.
- `npm run db:seed`: carga seed demo.
- `npm run db:prepare`: migra + seed.
- `npm run lint`: ESLint.
- `npm run typecheck`: TypeScript.
- `npm test`: unit tests Vitest.
- `npm run test:e2e`: E2E Playwright.

## Flujos implementados

- Landing.
- Registro, login y logout.
- Onboarding de workspace.
- Dashboard.
- Overview del workspace.
- Documento colaborativo con Tiptap/Yjs/Hocuspocus.
- Vista de tareas.
- Comentarios.
- Presencia básica.
- Búsqueda FTS5.
- Ajustes de miembros.
- Admin básico.
- Upload de archivos.
- Actividad reciente.
- IA con streaming/fallback.

## Notas de arquitectura

- Se usa SQLite para mantener la instalación reproducible sin Docker.
- `workspace_events` persiste eventos ligeros para SSE.
- Los documentos colaborativos se guardan como binario Yjs en `document_snapshots`.
- Los uploads van a disco local, pero la abstracción permite migrar a S3 compatible.
- El servidor de colaboración corre en proceso aparte para evitar fricción de HMR en Next.

## Testing ejecutado

- Vitest: utilidades.
- Playwright: registro/dashboard y login/workspace demo.
- Validación manual del flujo de login/dashboard/workspace con evidencia visual.

## Pendientes razonables

- Más cobertura E2E multiusuario real sobre edición CRDT y presencia.
- Más formularios de creación dentro del workspace (tareas/documentos desde UI).
- Panel admin más profundo y métricas exportables completas.
- Hardening adicional de rate limiting y auditado fino por recurso.
