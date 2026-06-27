# SKILL.md — Project Context for AI Assistants

## Project Overview

A To-Do List & Calendar Web Application where authenticated users can manage daily tasks via an interactive calendar interface.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js (JWT strategy) |
| Validation | Zod |
| Data Fetching | React Query (TanStack Query) |
| Calendar UI | react-calendar or FullCalendar |
| Testing | Jest + React Testing Library |
| Containerization | Docker + docker-compose |

---

## Project Structure

```
/app
  /api
    /auth
      /register/route.ts     → POST: create new user
      /[...nextauth]/route.ts → NextAuth handler
    /tasks
      /route.ts              → GET (by date), POST
      /[id]/route.ts         → PUT, DELETE
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /dashboard
    /page.tsx                → Main calendar + task list view
  /layout.tsx
  /middleware.ts             → Protect /dashboard routes

/components
  /calendar/
  /tasks/
  /ui/                       → Shared UI primitives

/lib
  /prisma.ts                 → Prisma client singleton
  /auth.ts                   → NextAuth config
  /utils.ts

/prisma
  /schema.prisma             → DB schema
  /migrations/

/types
  /index.ts                  → Shared TypeScript types

/tests
  /api/
  /components/
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

- All `/dashboard` routes are protected — redirect unauthenticated users to `/login`.
- `middleware.ts` uses NextAuth's `withAuth` to guard routes automatically.
- Every API route calls `getServerSession()` and scopes all DB queries to the current `userId`.
- Passwords are hashed with `bcryptjs` (salt rounds: 12) before storing.

---

## API Contract

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/signin` | NextAuth login | No |
| GET | `/api/tasks?date=YYYY-MM-DD` | Get tasks by date | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PUT | `/api/tasks/[id]` | Update a task | Yes |
| DELETE | `/api/tasks/[id]` | Delete a task | Yes |

---

## Key Features

### Required
1. User registration, login, logout
2. Interactive calendar — click a date to view/create tasks for that day
3. Full CRUD on tasks (title, description, date, status)
4. Dashboard: calendar + task list panel + status summary (Not Started / In Progress / Done)
5. Tasks scoped to authenticated user only

### Bonus
- Task filtering by status
- Search tasks by title/description
- Dark mode toggle
- Responsive/mobile-friendly layout
- Drag-and-drop task rescheduling (dnd-kit)
- Swagger/OpenAPI documentation
- Unit & integration tests
- Docker support
- Deployment (Vercel + Supabase)

---

## Coding Standards

- **Always use TypeScript** with strict mode enabled (`"strict": true` in tsconfig).
- **Use Prisma** for all database queries — never raw SQL unless explicitly requested.
- **Validate all request bodies** with Zod schemas before any DB operation.
- **Check auth on every API route** using `getServerSession(authOptions)`.
- **Use Tailwind CSS** for all styling — no inline styles, no CSS modules unless necessary.
- **Always define TypeScript `interface`** for React component props.
- **Error responses** should follow: `{ error: string, status: number }`.
- **Environment variables** are never hardcoded — always use `.env.local`.

---

## Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Copilot / DeepSeek Prompt Templates

Use these in VSCode Copilot Chat or DeepSeek to get accurate, context-aware code:

**Generate an API route:**
> "Refer to SKILL.md. Write the `GET /api/tasks` route that fetches tasks by `?date=` query param for the authenticated user using Prisma and Zod."

**Generate a component:**
> "Refer to SKILL.md. Create a `TaskCard` React component with a TypeScript props interface that displays title, description, date, and a status badge."

**Generate the Prisma schema:**
> "Refer to SKILL.md. Write the full Prisma schema for User and Task models with the TaskStatus enum."

**Generate a test:**
> "Refer to SKILL.md. Write a Jest integration test for the `POST /api/tasks` API route."

---

## To-Do Checklist

### 🛠 Setup
- [ ] `npx create-next-app@latest --typescript --tailwind`
- [ ] Install dependencies: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `zod`, `react-query`
- [ ] Configure `prisma/schema.prisma` and run `npx prisma migrate dev`
- [ ] Set up `.env.local` with DB URL and NextAuth secret

### 🔐 Authentication
- [ ] `POST /api/auth/register` — hash password, create user
- [ ] Configure NextAuth credentials provider in `/api/auth/[...nextauth]`
- [ ] Login page (`/login`) with form
- [ ] Register page (`/register`) with form
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
