"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 flex-shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="url(#nav-logo-grad)" />
      <rect x="8" y="10" width="16" height="14" rx="2.5" stroke="white" strokeWidth="1.75" />
      <path d="M8 14.5h16" stroke="white" strokeWidth="1.75" />
      <rect x="11" y="8" width="2.5" height="5" rx="1.25" fill="white" />
      <rect x="18.5" y="8" width="2.5" height="5" rx="1.25" fill="white" />
      <rect x="10.5" y="18" width="2.5" height="2.5" rx="0.75" fill="white" opacity="0.8" />
      <rect x="14.75" y="18" width="2.5" height="2.5" rx="0.75" fill="white" opacity="0.8" />
      <rect x="19" y="18" width="2.5" height="2.5" rx="0.75" fill="white" opacity="0.8" />
      <defs>
        <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zm8-5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-13 0a.75.75 0 01-.75.75H2.75a.75.75 0 010-1.5h1.5A.75.75 0 015 10zm9.657-5.657a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.06a.75.75 0 011.061 0zm-9.193 9.193a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.062-1.06l1.061-1.061a.75.75 0 011.061 0zm9.193 1.061a.75.75 0 01-1.06 0l-1.061-1.06a.75.75 0 011.06-1.062l1.061 1.061a.75.75 0 010 1.061zM5.464 5.464a.75.75 0 01-1.06 0L3.342 4.404a.75.75 0 011.06-1.06l1.061 1.06a.75.75 0 010 1.06zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.04a.75.75 0 10-1.06-1.06l-2.35 2.333a.75.75 0 000 1.06l2.35 2.333a.75.75 0 001.06-1.06l-1.048-1.04h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
    </svg>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar() {
  const { data: session } = useSession();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          aria-label="Taskflow home"
        >
          <LogoIcon />
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
            Taskflow
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-all duration-200 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-slate-700 ${
                darkMode ? "translate-x-7" : "translate-x-0"
              }`}
            >
              {darkMode ? (
                <MoonIcon />
              ) : (
                <SunIcon />
              )}
            </span>
          </button>

          {session?.user && (
            <>
              {/* User pill */}
              <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-600 text-xs font-bold text-white">
                  {getInitials(session.user.name)}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                  {session.user.name}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn-icon text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Sign out"
                title="Sign out"
              >
                <SignOutIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
