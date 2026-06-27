"use client";

import { useState, useEffect } from "react";
import { TaskResponse, TaskCreateInput, TaskUpdateInput, TaskStatus } from "@/types";
import { formatDate } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
  task?: TaskResponse | null; // null for create mode
  defaultDate: string; // YYYY-MM-DD
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE",        label: "Done" },
];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  defaultDate,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [status, setStatus] = useState<TaskStatus>("NOT_STARTED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.date);
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setDate(defaultDate);
      setStatus("NOT_STARTED");
    }
    setError("");
  }, [task, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({ title, description: description || undefined, date, status });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="modal-panel w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2
              id="task-modal-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {isEditing ? "Edit Task" : "New Task"}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {isEditing
                ? "Update the task details below"
                : "Fill in the details to create a task"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon ml-4"
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-slide-up dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertIcon />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="input-label">
              Title <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="What do you need to do?"
              required
              maxLength={200}
              autoFocus={!isEditing}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="input-label">
              Description{" "}
              <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-20 resize-y"
              placeholder="Add details or context…"
              maxLength={1000}
            />
          </div>

          {/* Date + Status in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-date" className="input-label">
                Date
              </label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
                aria-label="Task date"
              />
            </div>
            <div>
              <label htmlFor="task-status" className="input-label">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input-field"
                aria-label="Task status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Saving…
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
