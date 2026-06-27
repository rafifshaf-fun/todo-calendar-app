# 📅 To-Do Calendar App

A full-stack To-Do List & Calendar Web Application where authenticated users can manage daily tasks via an interactive calendar interface.

## Tech Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Frontend       | Next.js 14 (App Router) + TypeScript |
| Styling        | Tailwind CSS                  |
| Backend        | Next.js API Routes            |
| Database       | PostgreSQL + Prisma ORM       |
| Authentication | NextAuth.js (JWT strategy)    |
| Validation     | Zod                           |
| Data Fetching  | React Query (TanStack Query)  |
| Calendar UI    | react-calendar                |
| Containerization | Docker + docker-compose     |

## Features

### Required
- ✅ User registration, login, logout
- ✅ Interactive calendar — click a date to view/create tasks
- ✅ Full CRUD on tasks (title, description, date, status)
- ✅ Dashboard: calendar + task list + status summary
- ✅ Tasks scoped to authenticated user only

### Bonus
- ✅ Task filtering by status
- ✅ Search tasks by title/description
- ✅ Dark mode toggle
- ✅ Responsive/mobile-friendly layout
- ✅ Docker support

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- npm

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random string for JWT encryption
- `NEXTAUTH_URL` — Your app URL (default: `http://localhost:3000`)

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Docker

```bash
# Start the app and database
docker-compose up -d

# Run migrations inside the container
docker-compose exec app npx prisma migrate deploy

# Stop
docker-compose down
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts      # POST: create new user
│   │   │   └── [...nextauth]/route.ts # NextAuth handler
│   │   └── tasks/
│   │       ├── route.ts               # GET (by date), POST
│   │       └── [id]/route.ts          # PUT, DELETE
│   ├── dashboard/page.tsx             # Main dashboard
│   ├── login/page.tsx                 # Login page
│   ├── register/page.tsx              # Register page
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Tailwind + custom styles
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
│   ├── prisma.ts                      # Prisma singleton
│   ├── auth.ts                        # NextAuth config
│   └── utils.ts                       # Helper functions
├── prisma/
│   └── schema.prisma                  # DB schema
├── types/
│   ├── index.ts                       # Shared types
│   └── next-auth.d.ts                 # NextAuth type augmentation
├── middleware.ts                      # Route protection
├── Dockerfile
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint                    | Description        | Auth Required |
| ------ | --------------------------- | ------------------ | ------------- |
| POST   | `/api/auth/register`        | Register new user  | No            |
| POST   | `/api/auth/signin`          | NextAuth login     | No            |
| GET    | `/api/tasks?date=YYYY-MM-DD` | Get tasks by date  | Yes           |
| POST   | `/api/tasks`                 | Create a task      | Yes           |
| PUT    | `/api/tasks/[id]`            | Update a task      | Yes           |
| DELETE | `/api/tasks/[id]`            | Delete a task      | Yes           |

### Query Parameters for `GET /api/tasks`
- `date` — Filter by date (YYYY-MM-DD)
- `status` — Filter by status (`NOT_STARTED`, `IN_PROGRESS`, `DONE`)
- `search` — Search in title and description

## Demo Credentials

After running the app, register a new account at `/register`, or use these demo credentials (if seeded):

- **Email:** demo@example.com
- **Password:** password123

## License

This project is created as a take-home assignment.
