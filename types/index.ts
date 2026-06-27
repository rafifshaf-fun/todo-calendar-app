import { TaskStatus } from "@prisma/client";

// Re-export Prisma enum for convenience
export type { TaskStatus };

export interface TaskCreateInput {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  status?: TaskStatus;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  date?: string; // YYYY-MM-DD
  status?: TaskStatus;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
}
