"use client";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  loading?: boolean;
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 text-red-500"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  loading = false,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="modal-panel w-full max-w-sm">

        {/* Body */}
        <div className="px-6 py-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <WarningIcon />
          </div>

          <h3
            id="delete-dialog-title"
            className="text-base font-bold text-slate-900 dark:text-white"
          >
            Delete task?
          </h3>
          <p
            id="delete-dialog-desc"
            className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
          >
            <strong className="font-semibold text-slate-700 dark:text-slate-300">
              &ldquo;{taskTitle}&rdquo;
            </strong>{" "}
            will be permanently deleted. This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            id="confirm-delete"
            onClick={onConfirm}
            className="btn-danger flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
