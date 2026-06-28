# SKILL.md — Project Context for AI Assistants

## Project Overview

A To-Do List & Calendar Web Application where authenticated users can manage daily tasks via an interactive calendar interface. Features a drag-and-drop Kanban board, modern frosted-glass UI, and 31 demo tasks across the year.

**Live demo:** https://taskflow-rho-roan.vercel.app  
**Demo account:** `demo@example.com` / `password123`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript 6 |
| Styling | Tailwind CSS 4 (CSS-first config, no `tailwind.config.js`) |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma 7 ORM (`@prisma/adapter-pg`) |
| Authentication | NextAuth v5 (`next-auth@5.0.0-beta.29`) — JWT strategy |
| Validation | Zod 3 |
| Data Fetching | TanStack React Query v5 |
| Calendar UI | react-calendar v5 |
| Drag & Drop | @dnd-kit/core v6 + @dnd-kit/sortable v10 |
| Testing | Jest 29 + React Testing Library |
| Containerization | Docker + docker-compose (Node 22 Alpine, Postgres 16 Alpine) |
| CI/CD | GitHub Actions (4 jobs: lint, typecheck, test, build) |
| Deployment | Vercel (hosting) + Supabase (managed PostgreSQL) |

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts         # POST: create user (Zod + bcrypt)
│   │   │   └── [...nextauth]/route.ts    # NextAuth v5 handler (Credentials)
│   │   └── tasks/
│   │       ├── route.ts                  # GET (all tasks), POST
│   │       └── [id]/route.ts             # PUT, DELETE (ownership verified)
│   ├── dashboard/page.tsx                # Main dashboard (client component)
│   ├── login/page.tsx                    # Login page
│   ├── register/page.tsx                 # Register page
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page (hero + features)
│   └── globals.css                       # Tailwind 4 + design tokens + animations
├── components/
│   ├── Navbar.tsx                        # Frosted-glass nav, dark toggle, user menu
│   ├── TaskCalendar.tsx                  # react-calendar wrapper with dot indicators
│   ├── TaskCard.tsx                      # Task card with icon actions, hover elevation
│   ├── TaskBoard.tsx                     # Kanban board: DndContext + 3 SortableContexts
│   ├── SortableTaskCard.tsx              # useSortable draggable card
│   ├── TaskModal.tsx                     # Create/edit form modal (frosted glass)
│   ├── StatusSummary.tsx                 # Completion % + progress bars by status
│   ├── DeleteConfirmDialog.tsx           # Confirmation modal for deletion
│   ├── providers.tsx                     # SessionProvider + QueryClientProvider + ThemeProvider
│   └── theme-provider.tsx               # Dark mode context (class strategy + localStorage)
├── lib/
│   ├── prisma.ts                         # Prisma singleton with @prisma/adapter-pg + ssl workaround
│   ├── auth.ts                           # NextAuth v5 config (Credentials provider, JWT callbacks)
│   └── utils.ts                          # formatDate, parseDate, statusLabel helpers
├── prisma/
│   ├── schema.prisma                     # User + Task models, TaskStatus enum
│   └── seed.ts                           # Demo data seeder (31 tasks across 2026)
├── tests/
│   ├── api/
│   │   ├── register.test.ts              # Register route structure + Prisma mock checks
│   │   └── tasks.test.ts                 # Tasks CRUD route exports + auth checks
│   └── components/
│       ├── TaskCard.test.tsx             # Render, click handlers, null description
│       └── StatusSummary.test.tsx        # Labels, percentage, zero case
├── types/
│   ├── index.ts                          # Shared types: TaskResponse, TaskCreateInput, etc.
│   └── next-auth.d.ts                    # Augments Session.user.id
├── tmp/                                  # Raw SQL seed scripts for production use
├── prisma.config.ts                      # Prisma 7 datasource URL for CLI
├── eslint.config.mjs                     # ESLint 9 flat config (typescript-eslint, react, react-hooks)
├── jest.config.js                        # Jest + next/jest + jsdom
├── Dockerfile                            # Multi-stage build (Node 22 Alpine)
├── docker-compose.yml                    # PostgreSQL 16 + App services
└── .github/workflows/ci.yml              # CI: lint → typecheck → test → build
```

---

## Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  date        DateTime
  status      TaskStatus @default(NOT_STARTED)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum TaskStatus {
  NOT_STARTED
  IN_PROGRESS
  DONE
}
```

---

## Authentication Rules

- **No middleware.ts** — NextAuth v5 `auth()` middleware is incompatible with Next.js 16's Edge Runtime (`node:util/types` not available).
- **Page-level protection:** Dashboard uses `useSession()` from `next-auth/react` with a redirect to `/login` when `status === "unauthenticated"`.
- **API-level protection:** Every API route calls `auth()` from `@/lib/auth` and returns `401` if `session.user.id` is missing.
- **Ownership scoping:** Every Prisma query on `Task` includes `where: { userId: session.user.id }`.
- Passwords are hashed with `bcryptjs` (salt rounds: 12) before storing.

---

## API Contract

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (sign in, session, etc.) | — |
| GET | `/api/tasks?search=&status=` | Get all tasks for current user | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PUT | `/api/tasks/[id]` | Update a task (ownership verified) | Yes |
| DELETE | `/api/tasks/[id]` | Delete a task (ownership verified) | Yes |

### Query Parameters for `GET /api/tasks`
- `status` — Filter by `NOT_STARTED`, `IN_PROGRESS`, or `DONE`
- `search` — Search in title and description (case-insensitive, `contains` mode)
- `date` — (Optional) Filter by YYYY-MM-DD

---

## Key Features

### Required
1. User registration, login, logout
2. Interactive calendar (react-calendar) with task-dot indicators
3. Full CRUD on tasks (title, description, date, status)
4. Dashboard: calendar + **all tasks grouped by date** + status summary
5. Tasks scoped to authenticated user only

### Bonus
- Task filtering by status dropdown
- Search across all tasks by title/description
- Dark mode toggle (CSS class strategy + localStorage persistence)
- Responsive/mobile-friendly layout (3-col grid → stacked)
- **Kanban board** with drag-and-drop between Not Started / In Progress / Done columns (@dnd-kit)
- **Frosted glass UI** with design tokens, skeleton loading, micro-animations
- Docker support (Node 22 Alpine, multi-stage build)
- GitHub Actions CI pipeline (lint → typecheck → test → build)
- Deployed on Vercel + Supabase
- 20 passing unit/integration tests

---

## Coding Standards

- **Always use TypeScript** with strict mode enabled (`"strict": true` in tsconfig). No `any`.
- **Use Prisma** for all database queries — never raw SQL in application code.
- **Validate all request bodies** with Zod schemas before any DB operation. Return `400` on failure.
- **Check auth on every API route** using `auth()` from NextAuth v5 (NOT `getServerSession`).
- **Use Tailwind 4** for all styling — no inline styles, no CSS modules. Use `@theme` tokens.
- **Always define TypeScript `interface`** for React component props and API request/response shapes.
- **Error responses** follow: `{ error: string }` with appropriate HTTP status code.
- **Async/await only** — never `.then()` chains.
- **Environment variables** are never hardcoded — always use `.env.local` / Vercel env vars.
- **Kebab-case** for files, **PascalCase** for components, **camelCase** for hooks/functions.

---

## Prisma Client Singleton (Adapter Pattern)

```ts
// lib/prisma.ts — uses @prisma/adapter-pg for direct PostgreSQL
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const createPrismaClient = () => {
  const url = new URL(process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/todoapp");
  url.searchParams.delete("sslmode"); // Supabase self-signed cert workaround
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## NextAuth v5 Usage

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ ... })],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) { if (user) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user) session.user.id = token.sub!; return session; },
  },
});

// In API routes:
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"    # Required by NextAuth v5 on Vercel / Docker
```

On Vercel with Supabase integration, `POSTGRES_PRISMA_URL` is auto-provided and takes precedence.

---

## Drag & Drop Architecture

- **Library:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Collision detection:** `rectIntersection` (checks if pointer is within a droppable's bounding rect)
- **Sensors:** `PointerSensor` with 5px activation distance (prevents accidental drags on click)
- **Components:**
  - `TaskBoard` — `DndContext` wraps three `SortableContext` columns (vertical list strategy)
  - `SortableTaskCard` — `useSortable` hook with CSS transform transitions
  - `DroppableColumn` — `useDroppable` hook registers column areas as drop targets
- **On drop:** Dragging a card to a different column calls `PUT /api/tasks/[id]` with `{ status: newStatus }`
- **View toggle:** 📋 List / 📌 Board toggle in task panel header — no additional data fetching

---

## Design System (globals.css)

- **Color palette:** Indigo primary (`#6366f1`), violet accent (`#8b5cf6`)
- **Dark mode:** `@custom-variant dark (&:where(.dark, .dark *))` — toggled via class on `<html>`
- **Animations:** `fadeIn`, `slideUp`, `scaleIn` keyframes (150–300ms, spring easing)
- **Skeleton loading:** `animate-shimmer` with gradient background
- **Frosted glass:** `backdrop-blur` on navbar and modal overlays
- **Done via `@theme` tokens** — no `tailwind.config.js`
- **react-calendar overrides** — custom tile styles via CSS (no `!important`)

---

## Testing

| File | Tests | Scope |
|---|---|---|
| `tests/api/register.test.ts` | 4 | Route exports, Prisma mock existence |
| `tests/api/tasks.test.ts` | 9 | Auth module, Prisma ops, route exports |
| `tests/components/TaskCard.test.tsx` | 5 | Render title/desc, edit/delete click, null desc |
| `tests/components/StatusSummary.test.tsx` | 3 | Status labels, percentage calc, zero case |
| **Total** | **20** | ✅ All passing in CI |

Run: `npm test` or `npm run test:watch`
- [ ] Logout button in navbar
- [ ] `middleware.ts` protecting `/dashboard`

### 🗄 Database
- [ ] `User` model (id, email, password, name, createdAt)
- [ ] `Task` model (id, title, description, date, status, userId, timestamps)
- [ ] `TaskStatus` enum (NOT_STARTED, IN_PROGRESS, DONE)
- [ ] Run and verify migration

### 🔌 API Routes
- [ ] `GET /api/tasks?date=YYYY-MM-DD` — scoped to current user
- [ ] `POST /api/tasks` — create with Zod validation
- [ ] `PUT /api/tasks/[id]` — update, verify ownership
- [ ] `DELETE /api/tasks/[id]` — delete, verify ownership

### 📅 Calendar & Dashboard
- [ ] Calendar component with month navigation
- [ ] Highlight dates that have tasks
- [ ] Task list panel for selected date
- [ ] Status summary widget (count per status)
- [ ] "Add Task" button pre-filled with selected date

### ✅ Task Management
- [ ] Create task modal (title, description, date, status)
- [ ] Edit task modal
- [ ] Delete task with confirmation dialog
- [ ] View task detail

### ⭐ Bonus Features
- [ ] Filter tasks by status
- [ ] Search tasks
- [ ] Dark mode
- [ ] Responsive layout (mobile/tablet)
- [ ] Drag-and-drop rescheduling
- [ ] Swagger API docs
- [ ] Jest unit/integration tests
- [ ] `Dockerfile` + `docker-compose.yml`
- [ ] Deploy to Vercel + Supabase

### 📦 Submission
- [ ] Write `README.md` (overview, setup, env vars, how to run, stack)
- [ ] Add demo credentials to README
- [ ] Push to **public** GitHub repository
- [ ] Email repo link to `admin@aidece.ai`
- [ ] **Deadline: June 30, 2026 — 12:00 PM WIB**
