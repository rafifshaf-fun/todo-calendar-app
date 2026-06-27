import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            To-Do Calendar
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Manage your daily tasks with an interactive calendar interface
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            Sign In
          </Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-3">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
