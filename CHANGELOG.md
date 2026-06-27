# CHANGELOG.md

## 2026-06-27 — Initial Project Setup

### Project Scaffolding
- Initialized Next.js 16 project with TypeScript strict mode
- Set up Tailwind CSS 4 with PostCSS plugin (`@tailwindcss/postcss`)
- Configured ESLint 9 with flat config (`eslint.config.mjs`)
- Created Prisma 7 schema with PostgreSQL provider
- Added `prisma.config.ts` for Prisma 7 datasource URL
- Configured NextAuth v5 beta with credentials provider

### Database
- Created Prisma schema with `User` and `Task` models + `TaskStatus` enum
- Set up `@prisma/adapter-pg` + `pg` for Prisma 7 direct PostgreSQL connection
- Wrote `lib/prisma.ts` singleton with PG adapter pool
- Created `prisma.config.ts` for migration CLI datasource URL
- Docker Compose configuration with PostgreSQL 16 Alpine

### Authentication
- Configured NextAuth v5 (`next-auth@5.0.0-beta.29`) with JWT strategy
- Created credentials provider with bcryptjs password hashing
- Protected `/dashboard` and `/api/tasks` routes via NextAuth middleware
- Built login and register pages with client-side validation
- Added NextAuth type augmentation for `Session.user.id`

### API Routes
- `POST /api/auth/register` — Zod-validated user registration with bcrypt hashing
- `GET /api/tasks?date=&status=&search=` — paginated task fetching scoped to user
- `POST /api/tasks` — create task with Zod validation
- `PUT /api/tasks/[id]` — update task with ownership verification
- `DELETE /api/tasks/[id]` — delete task with ownership verification
- All routes migrated to NextAuth v5 `auth()` from v4 `getServerSession()`
- Dynamic route params updated for Next.js 16 async params (`Promise<{ id }>`)

### Frontend
- Landing page at `/` with sign in / register links
- Login page at `/login` with credentials auth
- Register page at `/register` with name/email/password form
- Dashboard at `/dashboard` with:
  - Interactive calendar (react-calendar v5) with task-dot indicators
  - Task list with search and status filter
  - Status summary widget (Not Started / In Progress / Done) with progress bars
  - Create/edit task modal with title, description, date, status
  - Delete confirmation dialog
- Dark mode toggle via `class` strategy + ThemeProvider context
- Responsive grid layout (3-col on desktop, stacked on mobile)

### Components
- `Navbar` — session-aware nav with dark mode toggle and sign out
- `TaskCalendar` — react-calendar wrapper with task date highlighting
- `TaskCard` — task display card with status badge, edit/delete actions
- `TaskModal` — create/edit form modal
- `StatusSummary` — progress bar widget showing counts by status
- `DeleteConfirmDialog` — confirmation modal for task deletion
- `Providers` — SessionProvider + QueryClientProvider + ThemeProvider
- `ThemeProvider` — dark mode context with localStorage persistence

### Configuration
- `tsconfig.json` — strict mode, path aliases `@/*`, forceConsistentCasingInFileNames
- `next.config.js` — standalone output for Docker, `serverExternalPackages: ["bcryptjs"]`
- `tailwind.config.js` — REMOVED (migrated to CSS-based config in Tailwind 4)
- `postcss.config.js` — uses `@tailwindcss/postcss` plugin (Tailwind 4)
- `eslint.config.mjs` — flat config with `FlatCompat` for next/core-web-vitals
- `.env` / `.env.local` — DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- `jest.config.js` — Next.js + Jest integration with jsdom environment

### Docker
- `Dockerfile` — multi-stage build (builder → runner), node:20-alpine
- `docker-compose.yml` — PostgreSQL 16 + Next.js app, health checks, volume persistence
- `POSTGRES_HOST_AUTH_METHOD: trust` for local dev simplicity
- `.dockerignore` — excludes node_modules, .next, .git

### Dependencies (final versions)
| Package | Version | Purpose |
|---|---|---|
| next | ^16.2.9 | Framework (App Router, Turbopack) |
| react / react-dom | ^19.1.0 | UI library |
| next-auth | ^5.0.0-beta.29 | Authentication |
| @prisma/client / prisma | ^7.8.0 | ORM |
| @prisma/adapter-pg + pg | latest | PostgreSQL driver for Prisma 7 |
| @tanstack/react-query | ^5.100.8 | Server state management |
| react-calendar | ^5.1.0 | Calendar UI |
| bcryptjs | ^3.0.2 | Password hashing |
| zod | ^3.24.4 | Request validation |
| tailwindcss | ^4.1.10 | CSS framework |
| @tailwindcss/postcss | latest | Tailwind 4 PostCSS plugin |
| typescript | ^6.0.0 | Type checking |
| eslint | ^9.29.0 | Linting |
| jest / ts-jest | ^29.7.0 / ^29.3.4 | Testing |

### Docker Deployment & Debugging (2026-06-27)
- Built multi-stage Docker image (builder + runner) with Node 20 Alpine
- Added `prisma` module to production image for CLI access
- Added `AUTH_TRUST_HOST=true` to resolve NextAuth v5 untrusted host error
- **Removed `middleware.ts`** — NextAuth v5 `auth()` middleware uses `node:util/types` which is incompatible with Next.js 16 Edge Runtime; auth is handled at API route and page level instead
- Created missing `public/` directory required by Dockerfile COPY step
- Resolved Prisma 7 breaking changes: `datasourceUrl` → `@prisma/adapter-pg` with `pg` Pool
- Host → container PostgreSQL auth fails on Docker Desktop Windows (SCRAM auth through port mapping); app runs fully inside Docker where `db:5432` resolves correctly
- Created database tables manually via SQL pipe (`docker exec -i psql`) after Prisma CLI couldn't run in production image
- Created `TaskStatus` PostgreSQL enum type and altered `Task.status` column from TEXT to enum
- Fixed `prisma.config.ts` to read `DATABASE_URL` from environment variable with localhost fallback

### Verified Working
- ✅ User registration at `/register` — user persisted to PostgreSQL
- ✅ User login at `/login` — NextAuth v5 credentials auth with JWT
- ✅ Dashboard at `/dashboard` — calendar, task list, status summary, search, dark mode
- ✅ Task creation — title, description, date, status saved to database
- ✅ Task editing, deletion with confirmation dialog
- ✅ Session persistence across page navigations
- ✅ Dark mode toggle with localStorage persistence

### UI Refinements (2026-06-27)
- Changed task listing from date-filtered to **"All Tasks"** view — shows every task grouped by date, sorted newest first
- Changed "+ Add Task for YYYY-MM-DD" button to just **"+ Add Task"** — date picker is inside the modal
- Search now works across **all tasks** instead of being scoped to the selected date
- Status filter applies to the full task list, not just a single day
- Calendar still highlights dates with tasks and clicking a date scrolls to / highlights that date's group

### Drag & Drop Board View (2026-06-28)
- Added **Kanban board view** with 3 columns: Not Started, In Progress, Done
- Implemented drag-and-drop using `@dnd-kit/core` + `@dnd-kit/sortable`
- **📋 List / 📌 Board** toggle in the task panel header — switch between views instantly
- Dragging a card between columns updates the task status via the existing PUT API
- Drag overlay shows card preview while dragging (rotated, semi-transparent)
- Column headers show task counts; empty columns display "Drop tasks here" placeholder
- Edit/Delete buttons inside cards stop event propagation — clicking them won't trigger drag
- Created `TaskBoard` component (3-column DndContext with SortableContext per column)
- Created `SortableTaskCard` component (useSortable hook, CSS transform transitions)
- Pointer sensor with 5px activation distance prevents accidental drags on click
