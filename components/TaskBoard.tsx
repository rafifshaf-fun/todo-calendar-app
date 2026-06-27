"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskResponse, TaskStatus } from "@/types";
import SortableTaskCard from "./SortableTaskCard";
import { statusLabel, statusColor } from "@/lib/utils";

interface TaskBoardProps {
  tasks: TaskResponse[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
  draggingTask: TaskResponse | null;
  onDragStart: (task: TaskResponse) => void;
  onDragEnd: () => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "NOT_STARTED", label: "Not Started", color: "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700" },
  { status: "DONE", label: "Done", color: "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700" },
];

export default function TaskBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  draggingTask,
  onDragStart,
  onDragEnd,
}: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) onDragStart(task);
    },
    [tasks, onDragStart]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      onDragEnd();

      if (!over) return;

      const task = tasks.find((t) => t.id === active.id);
      if (!task) return;

      // Determine target status: if dropped on a column, use its status;
      // if dropped on another task, use that task's status
      let newStatus: TaskStatus;
      const targetTask = tasks.find((t) => t.id === over.id);
      if (targetTask) {
        newStatus = targetTask.status;
      } else {
        newStatus = over.id as TaskStatus;
      }

      if (newStatus && newStatus !== task.status) {
        onStatusChange(task.id, newStatus);
      }
    },
    [tasks, onStatusChange, onDragEnd]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              id={col.status}
              className={`rounded-xl border-2 ${col.color} p-4 min-h-[200px] transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  {col.label}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-gray-600 dark:text-gray-400">
                  {columnTasks.length}
                </span>
              </div>

              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">
                      Drop tasks here
                    </p>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {draggingTask && (
          <div className="rotate-2 opacity-90 card shadow-lg max-w-xs">
            <h4 className="font-semibold text-sm truncate">{draggingTask.title}</h4>
            {draggingTask.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {draggingTask.description}
              </p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
