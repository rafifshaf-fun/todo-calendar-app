/**
 * Component: StatusSummary
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import StatusSummary from "@/components/StatusSummary";

describe("StatusSummary", () => {
  it("renders all three status labels", () => {
    render(<StatusSummary counts={{ notStarted: 3, inProgress: 2, done: 1 }} />);
    expect(screen.getByText("Not Started")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders completion percentage", () => {
    render(<StatusSummary counts={{ notStarted: 5, inProgress: 2, done: 3 }} />);
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("renders without crashing with zeros", () => {
    render(<StatusSummary counts={{ notStarted: 0, inProgress: 0, done: 0 }} />);
    expect(screen.getByText("Not Started")).toBeInTheDocument();
  });
});
