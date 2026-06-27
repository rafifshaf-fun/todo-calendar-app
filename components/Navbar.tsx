"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

export default function Navbar() {
  const { data: session } = useSession();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-primary-600"
        >
          📅 To-Do Calendar
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {session?.user && (
            <>
              <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
