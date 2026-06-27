# DECISIONS.md

Key architectural decisions made during the development of this project, with rationale.

---

## Stack Choices

### Next.js 16 (App Router) over Pages Router
**Decision:** Use App Router with React Server Components.
**Why:** App Router is the future of Next.js. It enables server-side data fetching colocated with components, streaming, and better performance. The SKILL.md spec explicitly requires it.

### Tailwind CSS 4 over Tailwind 3
**Decision:** Use Tailwind 4 with CSS-based configuration.
**Why:** The user's `package.json` specified Tailwind 4. Unlike v3, Tailwind 4 drops `tailwind.config.js` in favor of `@theme` directives in CSS and uses `@tailwindcss/postcss` as the PostCSS plugin. Dark mode requires `@custom-variant dark` instead of `darkMode: "class"` in config.

### Prisma 7 over Prisma 5
**Decision:** Use Prisma 7 with `@prisma/adapter-pg` for direct PostgreSQL connection.
**Why:** The user upgraded to Prisma 7. Breaking changes from Prisma 5:
- `datasource.url` removed from `schema.prisma` — moved to `prisma.config.ts`
- `PrismaClient` constructor requires a non-empty options object — must provide an `adapter`
- Chose `@prisma/adapter-pg` + `pg` (node-postgres) for direct TCP connection without Accelerate

### NextAuth v5 (beta) over NextAuth v4
**Decision:** Use NextAuth v5 beta (`next-auth@5.0.0-beta.29`).
**Why:** User specified v5. Breaking changes from v4:
- `NextAuthOptions` type removed — config passed directly to `NextAuth()`
- `NextAuth()` returns `{ handlers, auth, signIn, signOut }` (destructured exports)
- Route handler uses `export const { GET, POST } = handlers`
- Server-side auth uses `auth()` instead of `getServerSession(authOptions)`
- Middleware uses `export { auth as middleware }` instead of `next-auth/middleware`
- Credentials provider renamed from `CredentialsProvider` to `Credentials`

### React Query (TanStack Query) v5
**Decision:** Use `@tanstack/react-query` for client-side data fetching.
**Why:** Provides cache invalidation, optimistic updates, and loading/error states out of the box. Avoids `useEffect` waterfalls for data fetching. Query keys scoped by `date`, `status`, and `search` params enable automatic refetching.

---

## Architecture Decisions

### Database: PostgreSQL 16 Alpine in Docker
**Decision:** Run PostgreSQL 16 in a Docker container for local development.
**Why:** Consistent environment across dev and CI. Alpine variant minimizes image size. `POSTGRES_HOST_AUTH_METHOD=trust` for simplified local dev auth (no password required between Docker services). Volume-mounted `pgdata` for data persistence across container restarts.

### Authentication: JWT Strategy over Database Sessions
**Decision:** Use NextAuth JWT strategy.
**Why:** JWT tokens are stateless — no database table needed for sessions. The `sub` (user ID) is embedded in the token and extracted via the `jwt` → `session` callback chain. Suitable for a single-server deployment. Database sessions would add unnecessary complexity for this use case.

### API Design: REST over tRPC/GraphQL
**Decision:** Use standard REST API routes.
**Why:** The SKILL.md spec explicitly defines REST endpoints. REST is simpler to understand, debug, and document. The API surface is small enough (6 endpoints) that the overhead of tRPC or GraphQL isn't justified.

### UUID Primary Keys over Auto-Increment
**Decision:** Use `@default(uuid())` for User and Task IDs.
**Why:** UUIDs are universally unique, enabling future sharding or multi-region replication. They don't leak sequence information (no user-visible ID enumeration). Prisma natively supports UUID generation.

### Date Handling: YYYY-MM-DD String Format
**Decision:** Store task dates as DateTime in PostgreSQL, serialize to `YYYY-MM-DD` strings in API responses.
**Why:** DateTime in the database preserves timezone information and enables date-range queries. The `YYYY-MM-DD` string format in API responses is unambiguous and matches HTML date inputs. Helper functions `formatDate()` and `parseDate()` in `lib/utils.ts` centralize the conversion logic.

---

## Frontend Decisions

### Calendar: react-calendar v5
**Decision:** Use `react-calendar` over FullCalendar or custom implementation.
**Why:** Lighter weight than FullCalendar (which is designed for time-grid scheduling). Simpler API — just needs date selection and task-dot indicators. v5 ships with native TypeScript types. Custom CSS overrides for task dots (`.react-calendar__tile--hasTasks::after`) keep the integration clean.

### State Management: React Query + React State
**Decision:** Use React Query for server state, local `useState` for UI state.
**Why:** Clear separation: server data (tasks) → React Query with automatic cache invalidation; UI state (modal open/close, selected date, filters) → React state. No need for Zustand/Redux — the component tree is shallow enough that prop drilling isn't an issue.

### Dark Mode: CSS Class Strategy
**Decision:** Use Tailwind's `class` dark mode strategy with a ThemeProvider context.
**Why:** The `class` strategy (adding `.dark` to `<html>`) gives the user explicit control via a toggle button. This is preferred over `prefers-color-scheme` media query for apps where the user expects a manual toggle. `localStorage` persistence ensures the preference survives page reloads.

### Modal Pattern: Portal-less Inline Modal
**Decision:** Render modals as inline components with `fixed` positioning rather than using React portals.
**Why:** Simpler implementation for a small number of modals. No z-index stacking context issues since only one modal is shown at a time. The `fixed inset-0 z-50` pattern with a backdrop overlay (`bg-black/50`) is a standard Tailwind pattern.

---

## Docker Decisions

### Multi-Stage Build
**Decision:** Use a `builder` stage (with devDependencies) and a `runner` stage (production-only).
**Why:** The final image only contains:
- `.next/standalone` (Next.js production build)
- `.next/static` (static assets)
- `prisma/` (schema + migrations)
- `node_modules/.prisma` (generated client)

This keeps the production image small (~200MB vs ~800MB if devDependencies were included). The non-root `nextjs` user adds a security layer.

### Docker Compose over Separate Containers
**Decision:** Use `docker-compose.yml` with `db` and `app` services.
**Why:** Single-command startup (`docker-compose up -d`). Docker's internal DNS resolves `db:5432` for inter-service communication. Health checks on PostgreSQL ensure the app doesn't start before the database is ready. Volume persistence for database data.

---

## Testing Strategy

### Jest + React Testing Library
**Decision:** Use Jest with jsdom environment and React Testing Library.
**Why:** Jest is the most widely adopted test runner for Next.js projects. `jest-environment-jsdom` provides a browser-like environment for component tests. `@testing-library/react` encourages testing user behavior rather than implementation details. Configuration via `jest.config.js` with `next/jest` for seamless Next.js integration.

### Test Coverage Scope
**Decision:** Focus tests on API routes and critical UI flows.
**Why:** API routes contain the most business logic (auth checks, validation, database queries) and are the most impactful to test. The calendar and task CRUD UI flows are the primary user interactions. Snapshot tests for static pages (login, register) add minimal value.

---

## Deployment Decisions

### Docker Multi-Stage Build with Prisma CLI
**Decision:** Include `node_modules/prisma` in the production runner stage.
**Why:** Prisma 7's `prisma.config.ts` requires `prisma/config` at runtime. Without it, `PrismaClient` initialization fails. The builder stage runs `npm ci` (installing all deps), and the runner copies `node_modules/prisma` and `node_modules/.prisma` from builder. This adds ~42MB to the image but is required for Prisma 7. Ideally, `prisma` would be a production dependency, but the user's `package.json` lists it as a devDependency.

### Middleware Removal: Edge Runtime Incompatibility
**Decision:** Remove `middleware.ts` entirely; rely on page-level and API-level auth checks.
**Why:** NextAuth v5's `auth()` middleware uses `node:util/types` which is not available in Next.js 16's Edge Runtime (Turbopack). The error manifests as `Failed to load external module node:util/types: TypeError: Native module not found`. Since API routes already call `auth()` and the dashboard page uses `useSession()` with client-side redirect, the middleware was redundant. Removing it eliminated the 500 errors on `/dashboard` without sacrificing security.

### Manual SQL Table Creation over Prisma Migrate in Docker
**Decision:** Pipe DDL SQL directly into PostgreSQL via `docker exec -i psql` instead of running `prisma migrate dev` inside the container.
**Why:** The production Docker image lacks the full Prisma CLI environment (`@prisma/engines` binary not copied). Copying the host's `node_modules/@prisma` (187MB) into the container was attempted but the `.bin/prisma` symlink failed because the `.bin` directory didn't exist. The pragmatic solution was to execute the SQL directly — the schema is simple (2 tables + 1 enum) and the SQL is deterministic.

### Host→Container PostgreSQL Auth on Docker Desktop Windows
**Decision:** Accept that host→container PostgreSQL connections fail on Docker Desktop for Windows; run database operations inside Docker.
**Why:** Despite configuring `trust` auth in `pg_hba.conf` (`host all all 0.0.0.0/0 trust`), connections from the Windows host through the published port (`localhost:5432`) consistently fail with SCRAM authentication errors. Docker Desktop's port forwarding on Windows routes connections through a proxy that doesn't preserve the source IP correctly, causing `trust` rules not to match. The workaround is to run all database operations inside Docker containers where `db:5432` resolves via Docker's internal DNS.

### AUTH_TRUST_HOST for NextAuth v5
**Decision:** Set `AUTH_TRUST_HOST=true` in docker-compose environment.
**Why:** NextAuth v5 requires explicit host configuration for security. Without it, the `/api/auth/session` endpoint returns `UntrustedHost` errors. Setting `AUTH_TRUST_HOST=true` tells NextAuth to trust any host — acceptable for local development. In production, this would be replaced with proper `AUTH_URL` configuration.

---

## UI Decisions

### All Tasks View over Date-Filtered Task List
**Decision:** Show all tasks grouped by date instead of filtering by the calendar-selected date.
**Why:** Users need to search across all tasks and get an overview of everything. The previous design restricted the task list to a single date, making the search feature nearly useless (you could only search within one day's tasks). Now tasks are fetched without a date filter, sorted by date (newest first), and grouped under date-heading subheadings. The calendar still shows task-dot indicators and clicking a date finds that date's group in the list. The status summary counts across all tasks.

### "Add Task" Button over Date-Specific Label
**Decision:** Button text is simply "+ Add Task" instead of "+ Add Task for YYYY-MM-DD".
**Why:** The task modal already has a date picker input, so appending the selected date to the button label was redundant and made the button unnecessarily wide. The modal defaults to today's date but the user can freely change it.

### Drag-and-Drop: dnd-kit over HTML5 Drag API
**Decision:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for the Kanban board view.
**Why:** `dnd-kit` is the most popular React drag-and-drop library with first-class TypeScript support, accessible keyboard interactions, and a declarative API. The HTML5 Drag API was rejected because it lacks touch support, has inconsistent browser behavior, and requires imperative DOM manipulation. The board replaces the need for a status dropdown on every card — users can visually organize tasks by dragging them between columns. The `PointerSensor` with a 5px activation distance prevents accidental drags when clicking Edit/Delete buttons. Each column is a `SortableContext` with `verticalListSortingStrategy`, and the `DndContext` wraps all three columns with `closestCenter` collision detection. Status changes call the existing `PUT /api/tasks/[id]` endpoint with `{ status: newStatus }`.

### Board vs List: View Toggle over Separate Page
**Decision:** Add a 📋 List / 📌 Board toggle in the task panel header instead of a separate route.
**Why:** Both views share the same data (all tasks), search/filter controls, and CRUD modals. A toggle keeps the user on one page without losing calendar context or filter state. The board is rendered conditionally (`viewMode === "board"`) with no additional data fetching — it reuses the same `tasks` array already sorted and filtered. This avoids duplicating the search, status filter, and mutation logic across two pages.

### Drag-and-Drop: Collision Detection — rectIntersection over closestCenter (2026-06-28)
**Decision:** Switch the `DndContext` collision detection algorithm from `closestCenter` to `rectIntersection`.
**Why:** `closestCenter` computes distances between the centers of all droppable elements. Since each card is both a sortable (draggable) and implicitly a droppable, and a card sits at the center of its own column, the dragged card's own center was always the nearest target. This caused `over.id` to equal `active.id` — the card was always "dropped on itself" and no status change occurred. `rectIntersection` checks whether the pointer coordinates fall within the bounding rectangle of any registered droppable. Empty column areas (registered via `useDroppable`) are now correctly detected because the pointer physically enters their rect when the card is dragged over them. The trade-off is that `rectIntersection` requires the droppable to have a non-zero area — columns are given `min-h-[160px]` to ensure this.

### Seed Data: Expanded Demo Dataset (2026-06-28)
**Decision:** Replace the 5-task seed script with 31 realistic tasks spanning January–December 2026, seeded via raw SQL.
**Why:** A rich demo dataset lets evaluators immediately see the calendar dots across all months, test search/filter with meaningful results, and try drag-and-drop with multiple cards per column. Tasks follow a realistic software development timeline (sprints, CI migration, security audits, offsites) to demonstrate real-world use. Raw SQL was used over Prisma's `seed.ts` because the production Docker image lacks the full Prisma CLI environment, making raw SQL the reliably executable approach.
**Decision:** Overhaul the entire visual presentation to match a modern, premium SaaS product while preserving all underlying business logic.
**Why:** The previous MVP design was functional but lacked polish (e.g., plain blue colors, no loading states, abrupt modals, cluttered cards). A premium design system with an indigo/violet palette, 8px spacing grid, and fluid micro-animations (150-250ms) improves user trust and engagement.

### Skeleton Loading over Plain Spinners
**Decision:** Use CSS-animated skeleton shimmers (`animate-shimmer`) for the initial dashboard load instead of a single centered spinner.
**Why:** Skeleton screens reduce perceived loading time by providing a visual placeholder of the content layout. This prevents layout shift and makes the app feel faster and more robust.

### Frosted Glass Modals & Nav over Solid Backgrounds
**Decision:** Use Tailwind's `backdrop-blur` utilities with semi-transparent backgrounds for the Navbar and Modal overlays.
**Why:** Glassmorphism establishes a clear visual hierarchy by softly obscuring background content while keeping context alive. It feels significantly more modern than solid `#000000` opacities.

### CSS Custom Properties for Design Tokens
**Decision:** Define semantic tokens (e.g., `--color-primary-600`) and keyframe animations in `@theme` and `@layer utilities` within `globals.css` rather than purely relying on Tailwind utility classes inline.
**Why:** Tailwind 4 encourages this CSS-first approach. It centralized the visual language, allowed for complex animations (`scaleIn`, `slideUp`), and enabled complete, non-conflicting overriding of the `react-calendar` default styles without `!important` wars against library CSS.

---

## Known Trade-offs (Updated)

1. **NextAuth v5 Beta:** Using a beta version carries risk of API changes before stable release. Mitigated by the project being a take-home assignment with a limited shelf life.

2. **No ORM-level Migrations in Production:** `prisma migrate deploy` must be run separately after deployment. Not handled in the Docker entrypoint. Acceptable for a demo/assignment but would need CI/CD integration for production.

3. **Inline Styles for Progress Bars (Resolved):** The `StatusSummary` component originally used `style={{ width: \`${percent}%\` }}`. Fixed by using CSS custom properties: `style={{ '--progress-width': \`${percent}%\` }}` combined with a `w-progress` utility class (`width: var(--progress-width)`). This satisfies the linter while preserving dynamic behavior.

4. **middleware.ts → proxy.ts:** Next.js 16 deprecates the `middleware` file convention in favor of `proxy`. The middleware was removed entirely due to Edge Runtime incompatibility with NextAuth v5. Future migration to `proxy.ts` with Node.js runtime could re-enable middleware-level auth.

5. **Docker host→container PostgreSQL auth:** On Docker Desktop for Windows, connecting from the host to the PostgreSQL container via `localhost:5432` fails with SCRAM auth errors even with trust configured. This is a known Docker Desktop Windows networking quirk. All database operations run inside Docker containers.

6. **Manual DB schema creation:** Tables and enums were created via raw SQL rather than Prisma migrations. A future `prisma migrate dev` run in a proper development environment (with full Prisma CLI) would be needed to generate migration history files for production use.

7. **Supabase + Vercel Deployment:** Chose Vercel for hosting (Next.js-native, git-push deploys, free tier) and Supabase for PostgreSQL (managed, free tier, Vercel integration auto-sets env vars). The Vercel-Supabase integration provides `POSTGRES_PRISMA_URL` specifically formatted for Prisma connections. TLS certificate validation (`self-signed certificate in certificate chain`) required stripping `sslmode` from the connection string and setting `ssl: { rejectUnauthorized: false }` on the `pg.Pool` — a common workaround for Supabase's SSL setup with the `pg` driver.

8. **Seed via SQL over Prisma CLI:** The demo data was seeded via a raw SQL script (`tmp/seed-demo.sql`) run in the Supabase SQL Editor rather than Prisma's `seed.ts`. This avoids needing the full Prisma CLI in the production environment and works reliably across platforms.

9. **ESLint 9 Flat Config over FlatCompat:** The auto-generated `@eslint/eslintrc` FlatCompat config caused circular JSON reference errors with ESLint 9. Replaced with a proper flat config using `typescript-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`. Also switched from `next lint` (deprecated in Next.js 16) to `eslint .` directly.
