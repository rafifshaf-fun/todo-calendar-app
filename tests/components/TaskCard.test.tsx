/**
 * Component: TaskCard
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskCard from "@/components/TaskCard";
import { TaskResponse } from "@/types";

const mockTask: TaskResponse = {
  id: "task-1",
  title: "Test Task",
  description: "This is a test description",
  date: "2026-06-27",
  status: "IN_PROGRESS",
  userId: "user-1",
  createdAt: "2026-06-27T00:00:00.000Z",
  updatedAt: "2026-06-27T00:00:00.000Z",
};

describe("TaskCard", () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task title", () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task description", () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("calls onEdit when Edit button clicked", () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    // Buttons are icon-only with title attributes
    const editBtn = screen.getByTitle("Edit");
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete when Delete button clicked", () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    const deleteBtn = screen.getByTitle("Delete");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  it("renders without description when null", () => {
    const taskWithoutDesc = { ...mockTask, description: null };
    render(<TaskCard task={taskWithoutDesc} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });
});
