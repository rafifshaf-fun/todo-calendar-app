# Copilot Instructions — Todo Calendar App

## Context Files
Before starting any task, read these files for full project context:
- `SKILL.md` — tech stack, architecture, DB schema, API contract, coding standards
- `DECISIONS.md` — why key architectural choices were made (read before proposing alternatives)
- `CHANGELOG.md` — what has already been built (read to avoid duplicating work)

After completing any task, append a concise bullet entry to `CHANGELOG.md`.

***

## Stack (Quick Reference)
- **Framework:** Next.js 16 (App Router) + TypeScript 6
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma 7 ORM
- **Auth:** Auth.js v5 (`next-auth@5.0.0-beta`) — use `auth()`, NOT `getServerSession()`
- **Validation:** Zod
- **Data Fetching:** TanStack React Query v5
- **Testing:** Jest + React Testing Library
- **Runtime:** Node.js 22 (required by Prisma 7)

***

## Project Structure
```
/app
  /api
    /auth/[...nextauth]/route.ts   ← Auth.js handler
    /auth/register/route.ts        ← POST: create user
    /tasks/route.ts                ← GET (by ?date=), POST
    /tasks/[id]/route.ts           ← PUT, DELETE
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /dashboard/page.tsx              ← Calendar + task list + status summary
  /layout.tsx
  /middleware.ts                   ← Protects /dashboard/**
/components
  /calendar/
  /tasks/
  /ui/
/lib
  /prisma.ts                       ← Prisma client singleton
  /auth.ts                         ← Auth.js config
  /utils.ts
/prisma
  /schema.prisma
/types/index.ts
/prompts/                          ← Reusable prompt templates
```

***

## Non-Negotiable Coding Rules
1. **Auth on every API route** — call `auth()` from Auth.js v5 and verify `session.user.id` exists before any DB operation. Return `401` if not authenticated.
2. **Zod validation first** — parse and validate ALL request bodies with a Zod schema before touching Prisma. Return `400` with validation errors if parsing fails.
3. **Scope all DB queries to the current user** — every Prisma query on `Task` must include `where: { userId: session.user.id }`.
4. **TypeScript strict mode** — always define `interface` for component props and API request/response shapes. No `any`.
5. **Tailwind only** — no inline styles, no CSS modules unless absolutely necessary.
6. **Error response shape** — `{ error: string }` with the appropriate HTTP status code (`400`, `401`, `403`, `404`, `500`).
7. **Async/await only** — never `.then()` chains.
8. **Never hardcode secrets** — all env vars come from `.env.local`.

***

## Auth.js v5 Usage Pattern
```ts
// In API routes — use auth() not getServerSession()
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

***

## Prisma Client Singleton
```ts
// lib/prisma.ts — always import from here
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

***

## Task Status Enum
```ts
// Always use these exact string values
type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE'
```

***

## API Contract (Quick Reference)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| GET | `/api/tasks?date=YYYY-MM-DD` | Yes | Get tasks by date for current user |
| POST | `/api/tasks` | Yes | Create a task |
| PUT | `/api/tasks/[id]` | Yes | Update a task (verify ownership) |
| DELETE | `/api/tasks/[id]` | Yes | Delete a task (verify ownership) |

***

## Naming Conventions
- **Files/folders:** `kebab-case` (e.g., `task-card.tsx`, `use-tasks.ts`)
- **Components:** `PascalCase` exports (e.g., `export function TaskCard`)
- **Hooks:** `camelCase` prefixed with `use` (e.g., `useTasks`, `useCalendar`)
- **API route handlers:** named exports `GET`, `POST`, `PUT`, `DELETE`
- **Types/Interfaces:** `PascalCase` (e.g., `interface Task`, `type ApiResponse`)

***

## Prompt Templates
For recurring tasks, use the templates in `/prompts/`:
- `prompts/new-api-route.md` — generating a new API route
- `prompts/new-component.md` — generating a React component
- `prompts/write-test.md` — writing Jest tests

***

## Docker & Environment
- Base image: `node:22-alpine` (required — Prisma 7 needs Node ≥ 22)
- Run migrations after deploy: `docker compose exec app npx prisma migrate deploy`
- Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

***
