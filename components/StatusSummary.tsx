"use client";

interface StatusSummaryProps {
  counts: {
    notStarted: number;
    inProgress: number;
    done: number;
  };
}

export default function StatusSummary({ counts }: StatusSummaryProps) {
  const total = counts.notStarted + counts.inProgress + counts.done;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Status Summary
      </h3>
      <div className="space-y-2">
        <StatusBar
          label="Not Started"
          count={counts.notStarted}
          total={total}
          color="bg-gray-400"
        />
        <StatusBar
          label="In Progress"
          count={counts.inProgress}
          total={total}
          color="bg-blue-500"
        />
        <StatusBar
          label="Done"
          count={counts.done}
          total={total}
          color="bg-green-500"
        />
      </div>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300 w-progress`}
          style={{ '--progress-width': `${percent}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
