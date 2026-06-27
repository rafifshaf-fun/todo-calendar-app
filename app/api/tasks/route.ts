import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { formatDate, parseDate } from "@/lib/utils";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]).optional(),
});

// GET /api/tasks?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (dateParam) {
      const date = parseDate(dateParam);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      where.date = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    if (statusParam && ["NOT_STARTED", "IN_PROGRESS", "DONE"].includes(statusParam)) {
      where.status = statusParam;
    }

    if (searchParam) {
      where.OR = [
        { title: { contains: searchParam, mode: "insensitive" } },
        { description: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    const taskResponses = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      date: formatDate(task.date),
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));

    return NextResponse.json(taskResponses);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message, status: 400 },
        { status: 400 }
      );
    }

    const { title, description, date, status } = parsed.data;
    const parsedDate = parseDate(date);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        date: parsedDate,
        status: status || "NOT_STARTED",
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: task.id,
        title: task.title,
        description: task.description,
        date: formatDate(task.date),
        status: task.status,
        userId: task.userId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
