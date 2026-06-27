import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({ connectionString: process.env.DATABASE_URL })
  ),
});

async function main() {
  // Create demo user
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

  // Create sample tasks
  const tasks = [
    {
      title: "Review project requirements",
      description: "Go through the SKILL.md and DECISIONS.md docs to understand the architecture",
      date: new Date("2026-06-27"),
      status: "DONE" as const,
    },
    {
      title: "Set up CI/CD pipeline",
      description: "Add GitHub Actions workflow for lint, test, and build",
      date: new Date("2026-06-28"),
      status: "IN_PROGRESS" as const,
    },
    {
      title: "Write unit tests",
      description: "Add tests for API routes and components",
      date: new Date("2026-06-29"),
      status: "NOT_STARTED" as const,
    },
    {
      title: "Deploy to production",
      description: "Push to Vercel and configure environment variables",
      date: new Date("2026-06-30"),
      status: "NOT_STARTED" as const,
    },
    {
      title: "Submit project",
      description: "Email repo link to admin@aidece.ai before 12:00 PM WIB",
      date: new Date("2026-06-30"),
      status: "NOT_STARTED" as const,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        userId: user.id,
      },
    });
  }

  console.log(`Seeded ${tasks.length} tasks for ${user.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
