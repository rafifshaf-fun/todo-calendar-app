/**
 * Component: StatusSummary
 *
 * Tests the status summary widget with progress bars.
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

  it("renders correct counts", () => {
    render(<StatusSummary counts={{ notStarted: 5, inProgress: 0, done: 3 }} />);

    // Not Started: 5
    expect(screen.getByText("5")).toBeInTheDocument();
    // Done: 3 — we need to distinguish from Not Started's 5
    const counts = screen.getAllByText(/^\d+$/);
    expect(counts).toHaveLength(3);
    expect(counts[0].textContent).toBe("5");
    expect(counts[2].textContent).toBe("3");
  });

  it("renders with all zeros gracefully", () => {
    render(<StatusSummary counts={{ notStarted: 0, inProgress: 0, done: 0 }} />);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
  });

  it("renders progress bars", () => {
    const { container } = render(
      <StatusSummary counts={{ notStarted: 1, inProgress: 1, done: 1 }} />
    );

    // 3 progress bar divs (the filled portions)
    const bars = container.querySelectorAll(".h-2.rounded-full.w-progress");
    expect(bars).toHaveLength(3);
  });
});
