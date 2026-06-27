# Deployment Guide

## Option A: Vercel + Supabase (Recommended)

### 1. Set up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your database password
3. Go to **Project Settings → Database → Connection string**
4. Copy the **URI** (starts with `postgresql://postgres.xxx...`)

### 2. Push Schema to Supabase

```bash
# Set the Supabase connection string
export DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Push the Prisma schema
npx prisma db push

# Seed demo data
npx prisma db seed
```

> **Note:** If you get a "no schema" error, use the **Session pooler** URL (port 5432), not the Transaction pooler (port 6543).

### 3. Set up Vercel (App)

1. Go to [vercel.com](https://vercel.com) and click **New Project**
2. Import your GitHub repo: `rafifshaf-fun/todo-calendar-app`
3. Configure the project:
   - **Framework:** Next.js
   - **Build Command:** `npx prisma generate && next build`
   - **Install Command:** `npm ci`

4. Add **Environment Variables** in Vercel:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase connection URI (Session pooler, port 5432) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |

5. Click **Deploy**

### 4. Update NEXTAUTH_URL After Deploy

Once deployed, update `NEXTAUTH_URL` to your Vercel URL (e.g., `https://todo-calendar-app.vercel.app`).

---

## Option B: Docker (Self-Hosted)

```bash
git clone https://github.com/rafifshaf-fun/todo-calendar-app.git
cd todo-calendar-app
docker-compose up -d --build
docker-compose exec app npx prisma db push
# Seed demo data:
docker-compose exec app sh -c "DATABASE_URL=postgresql://user:password@db:5432/todoapp npx prisma db seed"
```

App → `http://localhost:3000`

---

## Option C: Local Development

```bash
git clone https://github.com/rafifshaf-fun/todo-calendar-app.git
cd todo-calendar-app
npm install
npx prisma generate
docker-compose up -d db    # PostgreSQL only
npx prisma db push
npx prisma db seed
npm run dev
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Canonical URL (e.g., `http://localhost:3000` or Vercel URL) |
| `AUTH_TRUST_HOST` | No | Set to `true` for development/non-standard hosts |

## Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@example.com` |
| Password | `password123` |

The seeded account has 31 tasks across January–December 2026.
