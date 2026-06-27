"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskResponse } from "@/types";
import { statusLabel } from "@/lib/utils";

interface SortableTaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
      <circle cx="5.5" cy="4.5" r="1.5" />
      <circle cx="10.5" cy="4.5" r="1.5" />
      <circle cx="5.5" cy="11.5" r="1.5" />
      <circle cx="10.5" cy="11.5" r="1.5" />
    </svg>
  );
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

function statusBadgeClass(status: string): string {
  switch (status) {
    case "NOT_STARTED": return "badge badge-not-started";
    case "IN_PROGRESS":  return "badge badge-in-progress";
    case "DONE":         return "badge badge-done";
    default:             return "badge badge-not-started";
  }
}

export default function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card select-none group"
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
          aria-label="Drag to reorder"
        >
          <DragHandleIcon />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-1">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {task.date}
            </span>
            <span className={statusBadgeClass(task.status)}>
              {statusLabel(task.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons — stop propagation so drag doesn't fire */}
      <div
        className="mt-2.5 flex gap-1 border-t border-slate-100 dark:border-slate-700 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(task)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label={`Edit task: ${task.title}`}
        >
          <EditIcon />
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete task: ${task.title}`}
        >
          <TrashIcon />
          Delete
        </button>
      </div>
    </div>
  );
}
