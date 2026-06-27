"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TaskCalendar from "@/components/TaskCalendar";
import TaskCard from "@/components/TaskCard";
import TaskBoard from "@/components/TaskBoard";
import TaskModal from "@/components/TaskModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import StatusSummary from "@/components/StatusSummary";
import { TaskResponse, TaskCreateInput, TaskUpdateInput, TaskStatus } from "@/types";
import { formatDate } from "@/lib/utils";

/* ─── Data Fetching ─────────────────────────────────────────── */

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

/* ─── Helpers ───────────────────────────────────────────────── */

/** Human-friendly date heading: "Today", "Yesterday", "Mon, Jun 27" */
function friendlyDateHeading(dateStr: string): { label: string; isToday: boolean } {
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  if (dateStr === todayStr) return { label: "Today", isToday: true };
  if (dateStr === yesterdayStr) return { label: "Yesterday", isToday: false };

  const d = new Date(dateStr + "T00:00:00");
  return {
    label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    isToday: false,
  };
}

/* ─── Skeleton Components ───────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-2/3 rounded-lg" />
      <div className="skeleton h-3 w-16 rounded-lg" />
    </div>
  );
}

function SkeletonGroup() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/* ─── SVG Icons ─────────────────────────────────────────────── */

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={active ? "white" : "currentColor"}
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M2 4.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 3.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 8.25zm0 3.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" />
    </svg>
  );
}

function BoardIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={active ? "white" : "currentColor"}
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="M2.5 1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h3A1.5 1.5 0 007 13.5v-11A1.5 1.5 0 005.5 1h-3zm4 0A1.5 1.5 0 005 2.5v7A1.5 1.5 0 006.5 11h3A1.5 1.5 0 0011 9.5v-7A1.5 1.5 0 009.5 1h-3zm4 0A1.5 1.5 0 009 2.5v4A1.5 1.5 0 0010.5 8h3A1.5 1.5 0 0015 6.5v-4A1.5 1.5 0 0013.5 1h-3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-400" aria-hidden="true">
      <path fillRule="evenodd" d="M9.965 11.026a5 5 0 111.06-1.06l2.755 2.754a.75.75 0 11-1.06 1.06l-2.755-2.754zM10.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 text-red-400" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  );
}

/* ─── Dashboard Page ────────────────────────────────────────── */

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
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [draggingTask, setDraggingTask] = useState<TaskResponse | null>(null);

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

  // ── Mutations ──────────────────────────────────────────────

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

  // ── Handlers ───────────────────────────────────────────────

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: TaskResponse) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) setDeletingTask(task);
    },
    [tasks]
  );

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

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      updateMutation.mutate({ id: taskId, data: { status: newStatus } });
    },
    [updateMutation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (deletingTask) {
      deleteMutation.mutate(deletingTask.id);
    }
  }, [deletingTask, deleteMutation]);

  // ── Computed ───────────────────────────────────────────────

  const statusCounts = useMemo(
    () => ({
      notStarted: tasks.filter((t) => t.status === "NOT_STARTED").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    }),
    [tasks]
  );

  // ── Auth loading ───────────────────────────────────────────

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f1a]">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex gap-6 lg:items-start">

          {/* ── Left Sidebar (sticky) ── */}
          <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 flex-shrink-0 gap-4 sticky top-[73px]">
            <TaskCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              taskDates={taskDates}
            />

            <StatusSummary counts={statusCounts} />

            <button
              id="add-task-sidebar"
              onClick={handleCreateTask}
              className="btn-primary w-full py-2.5"
            >
              <PlusIcon />
              New Task
            </button>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Mobile: calendar + add button row */}
            <div className="lg:hidden space-y-4">
              <TaskCalendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                taskDates={taskDates}
              />
              <div className="grid grid-cols-2 gap-3">
                <StatusSummary counts={statusCounts} />
                <button
                  onClick={handleCreateTask}
                  className="btn-primary h-fit self-end py-2.5"
                >
                  <PlusIcon />
                  New Task
                </button>
              </div>
            </div>

            {/* Task Panel */}
            <div className="card p-0 overflow-hidden">

              {/* Panel Header */}
              <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    All Tasks
                  </h2>
                  {!isLoading && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {tasks.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View toggle */}
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 p-0.5 gap-0.5">
                    <button
                      id="view-list"
                      onClick={() => setViewMode("list")}
                      aria-pressed={viewMode === "list"}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                        viewMode === "list"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <ListIcon active={viewMode === "list"} />
                      List
                    </button>
                    <button
                      id="view-board"
                      onClick={() => setViewMode("board")}
                      aria-pressed={viewMode === "board"}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                        viewMode === "board"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <BoardIcon active={viewMode === "board"} />
                      Board
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      id="search-tasks"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks…"
                      className="input-field pl-9 sm:w-44"
                      aria-label="Search tasks"
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field sm:w-36"
                    aria-label="Filter by status"
                  >
                    <option value="">All Status</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>

                  {/* Add button (panel header — desktop supplement) */}
                  <button
                    id="add-task-header"
                    onClick={handleCreateTask}
                    className="btn-primary py-2 px-4 text-xs hidden sm:flex"
                    aria-label="Add new task"
                  >
                    <PlusIcon />
                    New Task
                  </button>
                </div>
              </div>

              {/* Panel Body */}
              <div className="px-5 py-5">
                {isLoading ? (
                  // Skeleton loading state
                  <div className="space-y-6 animate-fade-in">
                    <SkeletonGroup />
                    <SkeletonGroup />
                  </div>
                ) : error ? (
                  // Error state
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                    <ErrorIcon />
                    <p className="mt-3 font-semibold text-slate-700 dark:text-slate-300">
                      Failed to load tasks
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Please refresh the page and try again.
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary-400" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {searchQuery || statusFilter ? "No matching tasks" : "No tasks yet"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {searchQuery || statusFilter
                        ? "Try a different search or filter"
                        : "Create your first task to get started"}
                    </p>
                    {!searchQuery && !statusFilter && (
                      <button
                        onClick={handleCreateTask}
                        className="btn-primary mt-5 text-sm"
                      >
                        <PlusIcon />
                        Create first task
                      </button>
                    )}
                  </div>
                ) : viewMode === "board" ? (
                  <TaskBoard
                    tasks={tasks}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    draggingTask={draggingTask}
                    onDragStart={setDraggingTask}
                    onDragEnd={() => setDraggingTask(null)}
                  />
                ) : (
                  // List view — grouped by date
                  <div className="space-y-6">
                    {/* Selected date group (pinned at top) */}
                    {selectedDateTasks.length > 0 && (
                      <div className="animate-fade-in">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="date-heading-today">
                            {friendlyDateHeading(dateStr).label}
                          </span>
                          <div className="h-px flex-1 bg-primary-100 dark:bg-primary-900/40" />
                          <span className="text-xs text-primary-500 font-semibold">
                            {selectedDateTasks.length}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
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

                    {/* All other dates grouped */}
                    {(() => {
                      const tasksByDate = new Map<string, TaskResponse[]>();
                      tasks.forEach((t) => {
                        if (t.date === dateStr) return; // shown above
                        const group = tasksByDate.get(t.date) || [];
                        group.push(t);
                        tasksByDate.set(t.date, group);
                      });

                      if (tasksByDate.size === 0 && selectedDateTasks.length === 0)
                        return null;

                      const sortedDates = [...tasksByDate.keys()].sort().reverse();

                      return sortedDates.map((date) => {
                        const { label } = friendlyDateHeading(date);
                        const dateTasks = tasksByDate.get(date)!;

                        return (
                          <div key={date} className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="date-heading-other">{label}</span>
                              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/60" />
                              <span className="text-xs text-slate-400 font-semibold">
                                {dateTasks.length}
                              </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {dateTasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onEdit={handleEditTask}
                                  onDelete={handleDeleteTask}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
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
