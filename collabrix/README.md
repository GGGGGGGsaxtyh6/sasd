# Collabrix – AI-Native Collaborative Workspace

A full-stack, production-grade collaborative workspace platform with real-time document editing, task management, AI assistance, file uploads, activity tracking, and role-based access control.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS v4, Lucide icons |
| Auth | Auth.js v5 (Credentials provider, JWT sessions) |
| Database | SQLite + Drizzle ORM |
| AI | OpenAI API (streaming), fallback mode without API key |
| Testing | Vitest (unit), Playwright (E2E) |
| Runtime | Node.js 22 |

## Quick Start

```bash
# Install dependencies
npm install

# Set up database (create tables + seed demo data)
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@collabrix.dev | password123 | Admin |
| alice@collabrix.dev | password123 | Editor |
| bob@collabrix.dev | password123 | Editor |

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
AUTH_SECRET=your-secret-key-at-least-32-characters-long
AUTH_URL=http://localhost:3000
DATABASE_URL=./data/collabrix.db
OPENAI_API_KEY=sk-your-openai-api-key   # optional, fallback mode works without it
UPLOAD_DIR=./public/uploads
```

## Features

### Core Platform
- **Landing page** with feature showcase
- **User registration & login** with secure password hashing (bcrypt)
- **JWT-based sessions** with middleware route protection
- **Multi-workspace** support with onboarding flow
- **Role-based access control** (Owner, Admin, Editor, Viewer)

### Document Editor
- Rich text editing with auto-save (debounced)
- Document creation, editing, archiving
- Threaded comments per document
- Icon customization per document

### Task Management
- **Kanban board** with 5 status columns (Backlog, Todo, In Progress, In Review, Done)
- Priority levels (None, Low, Medium, High, Urgent) with color-coded badges
- Assignee management
- Task creation, editing, deletion (RBAC-enforced)

### AI Integration
- **Summarize** – Extract key points from content
- **Rewrite** – Improve clarity and flow
- **Generate** – Create content from prompts
- **Classify** – Analyze topics, sentiment, categories
- **Ask** – Context-aware Q&A about workspace content
- Works with OpenAI API (streaming) or fallback mode

### File Management
- File upload (up to 10MB) per workspace
- Stored on local filesystem under `/public/uploads`

### Activity & Notifications
- Activity timeline per workspace (created, edited, commented)
- Notification system with read/unread state

### Search
- Full-text search across documents and tasks within workspace

### Admin Panel
- Platform-wide statistics (users, workspaces, documents, tasks)
- User management table
- Admin-only access control

### UX/UI
- **Dark mode** toggle (persisted via class on `<html>`)
- **Responsive** design (mobile sidebar collapse)
- Skeleton loaders for async content
- Toast notifications for actions
- Breadcrumb navigation
- Empty states with helpful CTAs
- Consistent design system with CSS custom properties

## Project Structure

```
collabrix/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register pages
│   │   ├── (dashboard)/         # Dashboard, Workspace pages
│   │   │   ├── admin/           # Admin panel
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   └── workspace/[id]/  # Document editor, Tasks, Activity, Settings
│   │   ├── api/                 # REST API routes
│   │   │   ├── auth/            # NextAuth + Register
│   │   │   ├── ai/              # AI streaming endpoint
│   │   │   ├── documents/       # CRUD + single document
│   │   │   ├── tasks/           # CRUD
│   │   │   ├── comments/        # CRUD
│   │   │   ├── search/          # Full-text search
│   │   │   ├── upload/          # File upload
│   │   │   ├── activity/        # Activity log
│   │   │   ├── notifications/   # Notifications
│   │   │   ├── workspaces/      # CRUD + single workspace
│   │   │   └── admin/           # Admin stats
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   └── layout/              # Sidebar, TopBar, DashboardShell
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema (9 tables + relations)
│   │   ├── index.ts             # DB connection
│   │   ├── migrate.ts           # Migration runner
│   │   └── seed.ts              # Demo data seeder
│   ├── lib/
│   │   ├── utils.ts             # Helpers (cn, generateId, slugify, etc.)
│   │   └── validations.ts       # Zod schemas
│   ├── auth.ts                  # Auth.js configuration
│   └── middleware.ts            # Route protection
├── tests/
│   ├── e2e/                     # Playwright E2E tests (19 tests)
│   │   ├── auth.spec.ts
│   │   ├── documents.spec.ts
│   │   ├── tasks.spec.ts
│   │   └── workspace.spec.ts
│   └── unit/                    # Vitest unit tests (41 tests)
│       ├── utils.test.ts
│       └── validations.test.ts
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.ts
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:setup` | Push schema + seed (full setup) |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run setup` | Full setup (install + DB) |

## Database Schema

9 tables with full relational integrity:

- **users** – Authentication, roles (user/admin)
- **workspaces** – Multi-tenant workspaces
- **workspace_members** – Membership with RBAC (owner/admin/editor/viewer)
- **documents** – Rich documents with content, icons, archiving
- **tasks** – Kanban tasks with status, priority, assignees
- **comments** – Threaded comments on documents and tasks
- **files** – Uploaded file metadata
- **activity_log** – Audit trail per workspace
- **notifications** – User notifications with read state

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT-based sessions (Auth.js v5)
- Server-side input validation (Zod)
- Middleware-based route protection
- RBAC authorization on every API endpoint
- Secrets managed via environment variables
- No client-side secret exposure

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite over PostgreSQL | Zero-config, embeddable, ideal for dev/demo. Schema is Drizzle-based and trivially portable to PostgreSQL. |
| Auth.js v5 Credentials | Built-in session management, JWT, middleware support. Production would add OAuth providers. |
| Tailwind CSS v4 | Latest version with native CSS custom properties, zero-config PostCSS integration. |
| Server Components + Client Components | Server for layout/auth, Client for interactive pages. Follows Next.js best practices. |
| Fallback AI mode | App works without OpenAI key, using intelligent placeholder responses. |

## Testing

### Unit Tests (41 tests)
- Utility functions (cn, slugify, generateId, formatDate, truncate)
- Zod validation schemas (login, register, workspace, document, task, comment, AI)

### E2E Tests (19 tests)
- **Auth**: Landing page, register, login, wrong password, route protection, duplicate email
- **Workspace**: Dashboard view, workspace creation, navigation to tasks/activity/settings
- **Documents**: Create document, edit + auto-save, add comment, AI summarize
- **Tasks**: Kanban view, seeded tasks visibility, create new task, priority indicators

## Known Limitations & Future Work

- **Real-time collaboration**: Currently uses polling-based refresh. Production would use Yjs + WebSocket for CRDT-based collaborative editing.
- **File storage**: Local filesystem. Production would use S3-compatible storage.
- **Search**: SQL LIKE queries. Production would use full-text search (e.g., PostgreSQL tsvector or Meilisearch).
- **Notifications**: Stored in DB, polled on page load. Production would add WebSocket push notifications.
- **i18n**: Structure supports it but only English strings are provided.
- **Rate limiting**: Not implemented. Production would add API rate limiting middleware.
- **Email**: No email sending configured. Production would add magic link login and notification emails.
