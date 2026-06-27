# CHANGELOG.md

## 2026-06-28 — Production Deployment

### Supabase + Vercel Deployment
- Deployed app to Vercel at **https://taskflow-rho-roan.vercel.app**
- Connected Supabase PostgreSQL via Vercel integration (`POSTGRES_PRISMA_URL`)
- Created database schema via Supabase MCP: `TaskStatus` enum, `User` table, `Task` table
- Seeded demo data: `demo@example.com` / `password123` with 31 tasks across Jan–Dec 2026
- Set environment variables: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`

### SSL/TLS Fix
- Stripped `sslmode` from connection string to prevent conflict with manual SSL config
- Added `ssl: { rejectUnauthorized: false }` to `pg.Pool` for Supabase self-signed certs

### CI/CD Pipeline Fixes
- **Lint**: Replaced `@eslint/eslintrc` FlatCompat with ESLint 9 flat config using `typescript-eslint`
- **Lint**: Switched from deprecated `next lint` to `eslint .`
- **Test**: Fixed `TaskCard` tests to use `getByTitle()` for icon-only buttons
- **Type Check**: Removed unused `@ts-expect-error` directives in `jest.setup.ts`
- **Build**: Added `pg` to `serverExternalPackages`
- **All 4 CI jobs now pass**: Lint ✅, Type Check ✅, Test (20/20) ✅, Build ✅

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

### Modern SaaS UI Refactor (2026-06-28)
- **Design System**: Established a comprehensive custom design system in `globals.css` with a new Indigo/Violet color palette, 8px spacing grid, semantic variables, and keyframe animations (`fadeIn`, `scaleIn`, `slideUp`).
- **Landing Page**: Completely redesigned with an animated gradient mesh background, clear value propositions (Kanban, Status Tracking), and strong CTA hierarchy.
- **Navigation**: Upgraded to a frosted glass layout (`backdrop-blur`), featuring a custom SVG logo, user initials avatar pill, and animated Sun/Moon toggle for dark mode.
- **Auth Pages**: Transformed basic forms into split-screen layouts featuring a prominent brand panel. Added inline button spinners, a live password strength meter, and an animated error banner.
- **Dashboard Layout**: Introduced a sticky left sidebar on large screens, improving navigation on dense lists. Task lists are now grouped with human-readable relative dates ("Today", "Yesterday").
- **Task Cards**: Implemented a more compact design with icon-only action buttons (pencil/trash) that reveal on hover, reducing visual clutter. Added subtle hover elevation.
- **Board View**: Refined Kanban column aesthetics by reducing background heaviness and adding semantic SVG icons (circle, clock, checkmark). Added a dashed dropzone for empty columns.
- **Status Summary**: Elevated the component to feature a prominent completion percentage headline, alongside a stacked RGB progress bar and detailed legend rows.

### Drag & Drop Fix — Collision Detection (2026-06-28)
- Fixed non-working drag-and-drop by switching collision detection from `closestCenter` to `rectIntersection`
- Root cause: `closestCenter` always detected the dragged card itself as the nearest droppable (centered within its column), so `over.id` never resolved to a different target
- `rectIntersection` checks if the pointer is physically within a droppable's bounding rectangle — empty column areas are correctly detected as drop targets
- Added `DroppableColumn` component using `useDroppable` hook to register columns with dnd-kit
- Columns highlight with an indigo ring (`ring-2 ring-indigo-400`) when a card is dragged over them
- Added `useDroppable` and `rectIntersection` imports from `@dnd-kit/core`

### Expanded Seed Data (2026-06-28)
- Replaced 5-sample seed script with **31 realistic tasks** spanning January–December 2026
- Tasks distributed across statuses: 16 DONE (historical), 5 IN_PROGRESS (current), 10 NOT_STARTED (future)
- Task descriptions reflect real-world development workflows (sprints, CI migration, security audits, etc.)
- Seed SQL file saved at `tmp/seed.sql` for reproducible database seeding
- Calendar dots now appear across all 12 months of 2026
- **Modals & Dialogs**: Replaced abrupt overlays with frosted glass backdrops and 150ms scale-in animations for a much smoother user experience.
- **Loading States**: Replaced plain spinners with page-level skeleton shimmer animations for better perceived performance.

### CI/CD Pipeline Fixes (2026-06-28)
- **Lint**: Replaced `@eslint/eslintrc` FlatCompat with ESLint 9 flat config using `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`. Switched lint script from deprecated `next lint` to `eslint .` (Next.js 16 removed `next lint` — it now interprets "lint" as a directory name). Added ignore patterns for `.venv`, config files, `prisma/`.
- **Type Check**: Removed unused `@ts-expect-error` directives in `jest.setup.ts` — TypeScript no longer errors on `globalThis.Request/Response/Headers` polyfill assignments.
- **Test**: Fixed `TaskCard` tests to use `screen.getByTitle("Edit")` / `screen.getByTitle("Delete")` instead of `screen.getByText("Edit")` / `screen.getByText("Delete")` — buttons are now icon-only (`title` attribute exposes text).
- **CI Configuration**: Added `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST` env vars to CI workflow for typecheck and build jobs. PostgreSQL service container for test job.
- **All 4 CI jobs now pass**: Lint ✅, Type Check ✅, Test (20/20) ✅, Build ✅
