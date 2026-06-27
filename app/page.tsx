import Link from "next/link";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
      <rect x="10" y="13" width="20" height="17" rx="3" stroke="white" strokeWidth="2" />
      <path d="M10 18h20" stroke="white" strokeWidth="2" />
      <rect x="14" y="10" width="3" height="6" rx="1.5" fill="white" />
      <rect x="23" y="10" width="3" height="6" rx="1.5" fill="white" />
      <rect x="13" y="22" width="3" height="3" rx="1" fill="white" opacity="0.8" />
      <rect x="18.5" y="22" width="3" height="3" rx="1" fill="white" opacity="0.8" />
      <rect x="24" y="22" width="3" height="3" rx="1" fill="white" opacity="0.8" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Calendar View",
    description: "Visualize your tasks on a beautiful interactive calendar with task-dot indicators.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="15" rx="1" />
      </svg>
    ),
    title: "Kanban Board",
    description: "Drag and drop tasks between Not Started, In Progress, and Done columns.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Status Tracking",
    description: "Real-time progress bars and completion metrics across all your tasks.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh-light dark:bg-mesh flex flex-col">

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav strip */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <CalendarIcon />
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Taskflow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-16">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 dark:border-primary-800 dark:bg-primary-900/30 animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 tracking-wide">
            Now with Kanban Board
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white max-w-3xl">
          Your tasks,{" "}
          <span className="text-gradient">beautifully</span>{" "}
          organized.
        </h1>

        <p className="animate-slide-up mt-6 max-w-xl text-lg text-slate-500 dark:text-slate-400 leading-relaxed" style={{ animationDelay: "50ms" }}>
          Manage daily tasks with a smart calendar, drag-and-drop Kanban board,
          and live progress tracking — all in one place.
        </p>

        {/* CTAs */}
        <div className="animate-slide-up mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "100ms" }}>
          <Link href="/register" className="btn-primary px-7 py-3 text-base shadow-lg shadow-primary-500/20">
            Start for free
          </Link>
          <Link href="/login" className="btn-secondary px-7 py-3 text-base">
            Sign in
          </Link>
        </div>

        {/* Feature cards */}
        <div className="animate-slide-up mt-20 grid gap-4 sm:grid-cols-3 max-w-4xl w-full" style={{ animationDelay: "150ms" }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="card card-hover text-left group"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 transition-transform duration-200 group-hover:scale-110">
                {f.icon}
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{f.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        Built with Next.js 16 · Tailwind CSS 4 · PostgreSQL
      </footer>
    </div>
  );
}
