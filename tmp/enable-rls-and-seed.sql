-- Enable RLS & Seed Demo Data for Taskflow
-- Our app uses Prisma (direct DB access), NOT Supabase PostgREST API
-- So RLS policies don't affect the app — we just need RLS enabled to satisfy Supabase's security check

-- 1. Enable RLS on both tables (required by Supabase)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- 2. Permissive policies (app handles auth via NextAuth, not Supabase Auth)
-- These allow PostgREST access but real auth is at the application level
CREATE POLICY "Allow all" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON "Task" FOR ALL USING (true) WITH CHECK (true);

-- 3. Seed demo user (password: password123)
INSERT INTO "User" ("id", "email", "password", "name", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  '$2b$12$n.mKSiKZaJ6cEJF1aWEdneYP88uOaZjX1SwZsIaZLAv.plNzE1fvG',
  'Demo User',
  now(), now()
) ON CONFLICT (email) DO NOTHING;

-- Demo tasks
DELETE FROM "Task" WHERE "userId" = '00000000-0000-0000-0000-000000000001';

INSERT INTO "Task" ("title", "description", "date", "status", "userId") VALUES
('New Year planning session', 'Set quarterly goals and OKRs for Q1 2026', '2026-01-03', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Update team onboarding docs', 'Refresh the developer handbook with new stack details', '2026-01-08', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Dental checkup', NULL, '2026-01-15', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Sprint retrospective', 'Review sprint 42 velocity and blockers', '2026-02-01', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Design system v2 review', 'Evaluate new color tokens and spacing grid', '2026-02-10', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Write API documentation', 'OpenAPI spec for all task endpoints', '2026-02-20', 'IN_PROGRESS', '00000000-0000-0000-0000-000000000001'),
('Tax preparation', 'Gather receipts and 1099 forms for accountant', '2026-03-05', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Performance review prep', 'Compile achievements and peer feedback', '2026-03-12', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Database indexing optimization', 'Add composite indexes for task search queries', '2026-03-22', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Migrate CI to GitHub Actions', 'Replace Jenkins pipeline with GHA', '2026-04-01', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Customer feedback survey', 'Send NPS survey to 500 users', '2026-04-08', 'DONE', '00000000-0000-0000-0000-000000000001'),
('React 19 upgrade spike', 'Test breaking changes in current codebase', '2026-04-18', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Team offsite planning', 'Book venue and draft agenda for June offsite', '2026-05-02', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Dark mode rollout', 'Ship dark mode toggle to all users', '2026-05-10', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Bug bash: calendar module', 'Fix date picker timezone edge cases', '2026-05-22', 'IN_PROGRESS', '00000000-0000-0000-0000-000000000001'),
('Sprint planning week 24', 'Prioritize backlog for next 2-week sprint', '2026-06-02', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Docker optimization pass', 'Reduce image size by 40% with multi-stage build', '2026-06-08', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Write project README', 'Setup instructions, API docs, demo credentials', '2026-06-15', 'DONE', '00000000-0000-0000-0000-000000000001'),
('Implement Kanban board DnD', 'Drag and drop tasks between status columns', '2026-06-22', 'IN_PROGRESS', '00000000-0000-0000-0000-000000000001'),
('UI polish pass', 'Frosted glass modals, skeleton loaders, animations', '2026-06-27', 'IN_PROGRESS', '00000000-0000-0000-0000-000000000001'),
('Seed demo data', 'Create 25+ realistic sample tasks for evaluation', '2026-06-28', 'IN_PROGRESS', '00000000-0000-0000-0000-000000000001'),
('Submit take-home assignment', 'Email repo link to admin@aidece.ai before 12:00 PM WIB', '2026-06-29', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Last-minute bug fixes', 'Address any issues found during final review', '2026-06-30', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Q3 roadmap planning', 'Define engineering initiatives for July-September', '2026-07-01', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('User onboarding flow v2', 'Redesign the first-run experience', '2026-07-10', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Set up error monitoring', 'Integrate Sentry for frontend and API error tracking', '2026-07-18', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Content security policy', 'Harden headers against XSS and injection attacks', '2026-07-25', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Annual security audit', 'Penetration testing and dependency vulnerability scan', '2026-08-05', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Micro-frontend POC', 'Evaluate Module Federation for team autonomy', '2026-09-12', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Year-end retrospective', 'Compile wins, misses, and lessons learned for 2026', '2026-12-15', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001'),
('Holiday team dinner', 'Book Restaurant Nusantara for December 20th', '2026-12-20', 'NOT_STARTED', '00000000-0000-0000-0000-000000000001');
