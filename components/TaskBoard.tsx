"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskResponse, TaskStatus } from "@/types";
import SortableTaskCard from "./SortableTaskCard";

function DroppableColumn({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-indigo-400 dark:ring-indigo-500 ring-inset" : ""} transition-shadow duration-150`}
    >
      {children}
    </div>
  );
}
import { statusLabel } from "@/lib/utils";

interface TaskBoardProps {
  tasks: TaskResponse[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
  draggingTask: TaskResponse | null;
  onDragStart: (task: TaskResponse) => void;
  onDragEnd: () => void;
}

interface ColumnConfig {
  status: TaskStatus;
  label: string;
  headerClass: string;
  dotClass: string;
  countClass: string;
  emptyClass: string;
  icon: React.ReactNode;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: "NOT_STARTED",
    label: "Not Started",
    headerClass: "bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
    dotClass: "bg-slate-400",
    countClass: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
    emptyClass: "border-slate-200 dark:border-slate-700",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    headerClass: "bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800",
    dotClass: "bg-violet-500",
    countClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    emptyClass: "border-violet-200 dark:border-violet-800",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-violet-500" aria-hidden="true">
        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3.25a.75.75 0 01.75.75V8h2.5a.75.75 0 010 1.5H8A.75.75 0 017.25 8.5v-3A.75.75 0 018 4.75z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    status: "DONE",
    label: "Done",
    headerClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    countClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    emptyClass: "border-emerald-200 dark:border-emerald-800",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true">
        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-1.72a.75.75 0 00-1.06-1.06L6.75 10.19 5.28 8.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd" />
      </svg>
    ),
  },
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

      // Determine target status: column drop or peer task
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);

          return (
            <DroppableColumn
              id={col.status}
              className={`rounded-2xl border ${col.headerClass} overflow-hidden transition-colors duration-200`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {col.label}
                  </h3>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.countClass}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards */}
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 p-3 min-h-[160px]">
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${col.emptyClass} py-8 text-center transition-colors`}
                    >
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Drop tasks here
                      </p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {draggingTask && (
          <div className="card shadow-xl rotate-2 opacity-95 ring-2 ring-primary-400/40 max-w-[240px]">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
              {draggingTask.title}
            </h4>
            {draggingTask.description && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {draggingTask.description}
              </p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
