# 📅 To-Do Calendar App

A full-stack To-Do List & Calendar Web Application where authenticated users can manage daily tasks via an interactive calendar interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma 7 ORM |
| Authentication | NextAuth v5 (Auth.js) — JWT strategy |
| Validation | Zod |
| Data Fetching | React Query (TanStack Query v5) |
| Calendar UI | react-calendar v5 |
| Testing | Jest + React Testing Library |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions |

## Features

### Required
- ✅ User registration, login, logout
- ✅ Interactive calendar with task-dot indicators
- ✅ Full CRUD on tasks (title, description, date, status)
- ✅ Dashboard: calendar + **all tasks** grouped by date + status summary
- ✅ Tasks scoped to authenticated user only
- ✅ Search across all tasks by title/description

### Bonus
- ✅ Task filtering by status
- ✅ Dark mode toggle (class strategy + localStorage)
- ✅ Responsive/mobile-friendly layout
- ✅ Docker support
- ✅ GitHub Actions CI pipeline

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 16 (or Docker)
- npm

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/todoapp` |
| `NEXTAUTH_SECRET` | Random string for JWT encryption | Generate with `npx auth secret` |
| `NEXTAUTH_URL` | App canonical URL | `http://localhost:3000` |

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start PostgreSQL (Docker)
docker-compose up -d db

# Push schema to database
npx prisma db push

# Seed demo data
npx prisma db seed

# Start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Docker (Full Stack)

```bash
# Build and start everything
docker-compose up -d --build

# Run database push
docker-compose exec app npx prisma db push

# App → http://localhost:3000
```

> **Note for Windows:** Host→container PostgreSQL connections via `localhost:5432` may fail due to Docker Desktop networking quirks. Run database operations inside Docker (`docker-compose exec`) instead.

### Demo Credentials

Register at `/register`, or use the seeded account:

| Field | Value |
|---|---|
| Email | `demo@example.com` |
| Password | `password123` |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts         # POST: create user
│   │   │   └── [...nextauth]/route.ts    # NextAuth handler
│   │   └── tasks/
│   │       ├── route.ts                  # GET (all tasks), POST
│   │       └── [id]/route.ts             # PUT, DELETE
│   ├── dashboard/page.tsx                # Main dashboard
│   ├── login/page.tsx                    # Login page
│   ├── register/page.tsx                 # Register page
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   └── globals.css                       # Tailwind + custom styles
├── components/
│   ├── Navbar.tsx
│   ├── TaskCalendar.tsx
│   ├── TaskCard.tsx
│   ├── TaskModal.tsx
│   ├── StatusSummary.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── providers.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── prisma.ts                         # Prisma singleton with pg adapter
│   ├── auth.ts                           # NextAuth v5 config
│   └── utils.ts                          # Helpers (formatDate, statusLabel, etc.)
├── prisma/
│   ├── schema.prisma                     # DB schema
│   └── seed.ts                           # Demo data seeder
├── tests/
│   ├── api/                              # API route tests
│   └── components/                       # Component tests
├── types/
│   ├── index.ts                          # Shared TypeScript types
│   └── next-auth.d.ts                    # NextAuth type augmentation
├── prisma.config.ts                      # Prisma 7 datasource config
├── eslint.config.mjs                     # ESLint 9 flat config
├── jest.config.js                        # Jest configuration
├── Dockerfile                            # Multi-stage production build (Node 22)
├── docker-compose.yml                    # PostgreSQL + App services
└── .github/workflows/ci.yml              # CI pipeline
```

> **Note:** `middleware.ts` was removed due to NextAuth v5 Edge Runtime incompatibility with Next.js 16. Auth is enforced at the API route level (`auth()`) and page level (`useSession()` + redirect).

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler | — |
| GET | `/api/tasks?search=&status=` | Get all tasks for current user | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| PUT | `/api/tasks/[id]` | Update a task (ownership verified) | Yes |
| DELETE | `/api/tasks/[id]` | Delete a task (ownership verified) | Yes |

### Query Parameters for `GET /api/tasks`
- `status` — Filter by `NOT_STARTED`, `IN_PROGRESS`, or `DONE`
- `search` — Search in title and description (case-insensitive)
- `date` — (Optional) Filter by YYYY-MM-DD

## License

Created as a take-home assignment. Deadline: June 30, 2026.
