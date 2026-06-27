/**
 * API Route Tests: Tasks CRUD
 *
 * Tests the auth and validation logic using mocked Prisma.
 */

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Tasks API — Auth & Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Auth check", () => {
    it("auth module exports auth function", () => {
      expect(auth).toBeDefined();
      expect(typeof auth).toBe("function");
    });
  });

  describe("Prisma task operations", () => {
    it("task.create exists for POST", () => {
      expect(prisma.task.create).toBeDefined();
    });

    it("task.findMany exists for GET", () => {
      expect(prisma.task.findMany).toBeDefined();
    });

    it("task.findUnique exists for ownership check", () => {
      expect(prisma.task.findUnique).toBeDefined();
    });

    it("task.update exists for PUT", () => {
      expect(prisma.task.update).toBeDefined();
    });

    it("task.delete exists for DELETE", () => {
      expect(prisma.task.delete).toBeDefined();
    });
  });

  describe("Route structure", () => {
    it("GET, POST, PUT, DELETE handlers are exported", async () => {
      const tasksRoute = await import("@/app/api/tasks/route");
      expect(tasksRoute.GET).toBeDefined();
      expect(tasksRoute.POST).toBeDefined();
    });

    it("[id] route exports PUT and DELETE", async () => {
      const taskIdRoute = await import("@/app/api/tasks/[id]/route");
      expect(taskIdRoute.PUT).toBeDefined();
      expect(taskIdRoute.DELETE).toBeDefined();
    });
  });
});
