"use client";

import { TaskResponse } from "@/types";
import { statusLabel, statusColor, formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {formatDate(new Date(task.date + "T00:00:00"))}
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(task.status)}`}
        >
          {statusLabel(task.status)}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="btn-secondary flex-1 text-xs py-1.5"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-danger flex-1 text-xs py-1.5"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
