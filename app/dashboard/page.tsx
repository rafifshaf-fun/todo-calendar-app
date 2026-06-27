"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TaskCalendar from "@/components/TaskCalendar";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import StatusSummary from "@/components/StatusSummary";
import { TaskResponse, TaskCreateInput, TaskUpdateInput } from "@/types";
import { formatDate } from "@/lib/utils";

async function fetchAllTasks(status?: string, search?: string): Promise<TaskResponse[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const res = await fetch(`/api/tasks?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch tasks");
  }
  return res.json();
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const dateStr = formatDate(selectedDate);

  // Redirect if not authenticated
  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Fetch ALL tasks (no date filter — search & status work across everything)
  const {
    data: allTasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", statusFilter, searchQuery],
    queryFn: () => fetchAllTasks(statusFilter || undefined, searchQuery || undefined),
  });

  // Sort tasks by date (newest first), then by creation time
  const tasks = useMemo(
    () =>
      [...allTasks].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      }),
    [allTasks]
  );

  // Tasks for the selected date (for detail view)
  const selectedDateTasks = useMemo(
    () => tasks.filter((t) => t.date === dateStr),
    [tasks, dateStr]
  );

  // Unique dates that have tasks (for calendar dots)
  const taskDates = useMemo(
    () => [...new Set(allTasks.map((t) => t.date))],
    [allTasks]
  );

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (data: TaskCreateInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdateInput }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeletingTask(null);
    },
  });

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: TaskResponse) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setDeletingTask(task);
  }, [tasks]);

  const handleModalSubmit = useCallback(
    async (data: TaskCreateInput | TaskUpdateInput) => {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, data });
      } else {
        await createMutation.mutateAsync(data as TaskCreateInput);
      }
    },
    [editingTask, createMutation, updateMutation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (deletingTask) {
      deleteMutation.mutate(deletingTask.id);
    }
  }, [deletingTask, deleteMutation]);

  // Compute status counts across ALL tasks
  const statusCounts = useMemo(
    () => ({
      notStarted: tasks.filter((t) => t.status === "NOT_STARTED").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    }),
    [tasks]
  );

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Calendar + Status */}
          <div className="space-y-6 lg:col-span-1">
            <TaskCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              taskDates={taskDates}
            />

            <StatusSummary counts={statusCounts} />

            <button onClick={handleCreateTask} className="btn-primary w-full">
              + Add Task
            </button>
          </div>

          {/* Right column: Task list */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  All Tasks
                </h2>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="input-field sm:w-48"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field sm:w-40"
                    aria-label="Filter by status"
                  >
                    <option value="">All Status</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Task list */}
              <div className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                  </div>
                ) : error ? (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    Failed to load tasks. Please try again.
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-4xl mb-3">📝</p>
                    <p>No tasks yet.</p>
                    <button
                      onClick={handleCreateTask}
                      className="mt-3 text-primary-600 hover:text-primary-500 font-medium text-sm"
                    >
                      + Add your first task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedDateTasks.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-primary-600 uppercase tracking-wide">
                          {dateStr} — Selected Date
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {selectedDateTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All other tasks grouped by date */}
                    {(() => {
                      const tasksByDate = new Map<string, TaskResponse[]>();
                      tasks.forEach((t) => {
                        if (t.date === dateStr) return; // Skip selected date (shown above)
                        const group = tasksByDate.get(t.date) || [];
                        group.push(t);
                        tasksByDate.set(t.date, group);
                      });

                      if (tasksByDate.size === 0 && selectedDateTasks.length === 0) return null;

                      const sortedDates = [...tasksByDate.keys()].sort().reverse();

                      return sortedDates.map((date) => (
                        <div key={date}>
                          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            {date}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {tasksByDate.get(date)!.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                              />
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleModalSubmit}
        task={editingTask}
        defaultDate={dateStr}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ""}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
