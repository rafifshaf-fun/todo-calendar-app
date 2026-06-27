import { PrismaClient, TaskStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({ connectionString: process.env.DATABASE_URL })
  ),
});

function dateStr(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log(`Seeded user: ${user.email}`);

  // Delete existing tasks to avoid duplicates
  await prisma.task.deleteMany({ where: { userId: user.id } });

  const tasks: { title: string; description: string | null; date: Date; status: TaskStatus }[] = [
    // January 2026
    { title: "New Year planning session", description: "Set quarterly goals and OKRs for Q1 2026", date: dateStr(2026, 1, 3), status: "DONE" },
    { title: "Update team onboarding docs", description: "Refresh the developer handbook with new stack details", date: dateStr(2026, 1, 8), status: "DONE" },
    { title: "Dental checkup", description: null, date: dateStr(2026, 1, 15), status: "DONE" },

    // February 2026
    { title: "Sprint retrospective", description: "Review sprint 42 velocity and blockers", date: dateStr(2026, 2, 1), status: "DONE" },
    { title: "Design system v2 review", description: "Evaluate new color tokens and spacing grid", date: dateStr(2026, 2, 10), status: "DONE" },
    { title: "Write API documentation", description: "OpenAPI spec for all task endpoints", date: dateStr(2026, 2, 20), status: "IN_PROGRESS" },

    // March 2026
    { title: "Tax preparation", description: "Gather receipts and 1099 forms for accountant", date: dateStr(2026, 3, 5), status: "DONE" },
    { title: "Performance review prep", description: "Compile achievements and peer feedback", date: dateStr(2026, 3, 12), status: "DONE" },
    { title: "Database indexing optimization", description: "Add composite indexes for task search queries", date: dateStr(2026, 3, 22), status: "DONE" },

    // April 2026
    { title: "Migrate CI to GitHub Actions", description: "Replace Jenkins pipeline with GHA", date: dateStr(2026, 4, 1), status: "DONE" },
    { title: "Customer feedback survey", description: "Send NPS survey to 500 users", date: dateStr(2026, 4, 8), status: "DONE" },
    { title: "React 19 upgrade spike", description: "Test breaking changes in current codebase", date: dateStr(2026, 4, 18), status: "DONE" },

    // May 2026
    { title: "Team offsite planning", description: "Book venue and draft agenda for June offsite", date: dateStr(2026, 5, 2), status: "DONE" },
    { title: "Dark mode rollout", description: "Ship dark mode toggle to all users", date: dateStr(2026, 5, 10), status: "DONE" },
    { title: "Bug bash: calendar module", description: "Fix date picker timezone edge cases", date: dateStr(2026, 5, 22), status: "IN_PROGRESS" },

    // June 2026
    { title: "Sprint planning week 24", description: "Prioritize backlog for next 2-week sprint", date: dateStr(2026, 6, 2), status: "DONE" },
    { title: "Docker optimization pass", description: "Reduce image size by 40% with multi-stage build", date: dateStr(2026, 6, 8), status: "DONE" },
    { title: "Write project README", description: "Setup instructions, API docs, demo credentials", date: dateStr(2026, 6, 15), status: "DONE" },
    { title: "Implement Kanban board DnD", description: "Drag and drop tasks between status columns", date: dateStr(2026, 6, 22), status: "IN_PROGRESS" },
    { title: "UI polish pass", description: "Frosted glass modals, skeleton loaders, animations", date: dateStr(2026, 6, 27), status: "IN_PROGRESS" },
    { title: "Seed demo data", description: "Create 25+ realistic sample tasks for evaluation", date: dateStr(2026, 6, 28), status: "IN_PROGRESS" },
    { title: "Submit take-home assignment", description: "Email repo link to admin@aidece.ai before 12:00 PM WIB", date: dateStr(2026, 6, 29), status: "NOT_STARTED" },
    { title: "Last-minute bug fixes", description: "Address any issues found during final review", date: dateStr(2026, 6, 30), status: "NOT_STARTED" },

    // July 2026
    { title: "Q3 roadmap planning", description: "Define engineering initiatives for July-September", date: dateStr(2026, 7, 1), status: "NOT_STARTED" },
    { title: "User onboarding flow v2", description: "Redesign the first-run experience", date: dateStr(2026, 7, 10), status: "NOT_STARTED" },
    { title: "Set up error monitoring", description: "Integrate Sentry for frontend and API error tracking", date: dateStr(2026, 7, 18), status: "NOT_STARTED" },
    { title: "Content security policy", description: "Harden headers against XSS and injection attacks", date: dateStr(2026, 7, 25), status: "NOT_STARTED" },

    // August-December 2026
    { title: "Annual security audit", description: "Penetration testing and dependency vulnerability scan", date: dateStr(2026, 8, 5), status: "NOT_STARTED" },
    { title: "Micro-frontend POC", description: "Evaluate Module Federation for team autonomy", date: dateStr(2026, 9, 12), status: "NOT_STARTED" },
    { title: "Year-end retrospective", description: "Compile wins, misses, and lessons learned for 2026", date: dateStr(2026, 12, 15), status: "NOT_STARTED" },
    { title: "Holiday team dinner", description: "Book Restaurant Nusantara for December 20th", date: dateStr(2026, 12, 20), status: "NOT_STARTED" },
  ];

  let created = 0;
  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, userId: user.id },
    });
    created++;
  }

  console.log(`Seeded ${created} tasks for demo@example.com`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
