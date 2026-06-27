"use client";

interface StatusSummaryProps {
  counts: {
    notStarted: number;
    inProgress: number;
    done: number;
  };
}

interface BarConfig {
  label: string;
  count: number;
  dotClass: string;
  barClass: string;
}

export default function StatusSummary({ counts }: StatusSummaryProps) {
  const total = counts.notStarted + counts.inProgress + counts.done;
  const completionPct = total === 0 ? 0 : Math.round((counts.done / total) * 100);

  const bars: BarConfig[] = [
    {
      label: "Not Started",
      count: counts.notStarted,
      dotClass: "bg-slate-400",
      barClass: "bg-slate-400",
    },
    {
      label: "In Progress",
      count: counts.inProgress,
      dotClass: "bg-violet-500",
      barClass: "bg-violet-500",
    },
    {
      label: "Done",
      count: counts.done,
      dotClass: "bg-emerald-500",
      barClass: "bg-emerald-500",
    },
  ];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Progress
        </h3>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            {completionPct}
            <span className="text-sm font-semibold text-slate-400">%</span>
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            complete
          </p>
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex mb-5">
        {total > 0 && (
          <>
            <div
              className="h-full bg-slate-400 transition-all duration-500"
              style={{ width: `${Math.round((counts.notStarted / total) * 100)}%` }}
              title="Not Started"
              role="presentation"
            />
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${Math.round((counts.inProgress / total) * 100)}%` }}
              title="In Progress"
              role="presentation"
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.round((counts.done / total) * 100)}%` }}
              title="Done"
              role="presentation"
            />
          </>
        )}
      </div>

      {/* Legend rows */}
      <div className="space-y-2.5">
        {bars.map(({ label, count, dotClass, barClass }) => {
          const pct = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotClass}`} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{pct}%</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-4 text-right">
                    {count}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-1.5 rounded-full ${barClass} transition-all duration-500 w-progress`}
                  style={{ '--progress-width': `${pct}%` } as React.CSSProperties}
                  role="progressbar"
                  aria-valuenow={count}
                  aria-valuemax={total}
                  aria-label={label}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      {total > 0 && (
        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          {total} task{total !== 1 ? "s" : ""} total
        </p>
      )}
    </div>
  );
}
