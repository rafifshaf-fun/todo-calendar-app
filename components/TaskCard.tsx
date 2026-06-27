"use client";

import { TaskResponse } from "@/types";
import { statusLabel, formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474zM4.75 13.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.704 7.044A1.75 1.75 0 005.5 14h5a1.75 1.75 0 001.746-1.456L12.95 5.5h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.712z" clipRule="evenodd" />
    </svg>
  );
}

/** Returns a dot + badge className based on status */
function statusBadgeClass(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "badge badge-not-started";
    case "IN_PROGRESS":  return "badge badge-in-progress";
    case "DONE":         return "badge badge-done";
    default:             return "badge badge-not-started";
  }
}

/** Returns a dot color class */
function statusDotClass(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "bg-slate-400";
    case "IN_PROGRESS":  return "bg-violet-500";
    case "DONE":         return "bg-emerald-500";
    default:             return "bg-slate-400";
  }
}

/** Friendly relative date — "Today", "Yesterday", "Jun 27" */
function friendlyDate(dateStr: string): string {
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="card card-hover group cursor-default">
      {/* Top row: title + action buttons */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 min-w-0 font-semibold text-sm text-slate-900 dark:text-white leading-snug truncate">
          {task.title}
        </h3>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(task)}
            className="btn-icon hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={`Edit task: ${task.title}`}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="btn-icon hover:text-red-600 dark:hover:text-red-400"
            aria-label={`Delete task: ${task.title}`}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: date + badge */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {friendlyDate(task.date)}
        </span>
        <span className={statusBadgeClass(task.status)}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(task.status)}`} />
          {statusLabel(task.status)}
        </span>
      </div>
    </div>
  );
}
