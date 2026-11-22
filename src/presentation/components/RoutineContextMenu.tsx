import { useState, useEffect } from 'react'
import type { Routine } from '@/domain/entities/Routine'

interface RoutineContextMenuProps {
  routine: Routine | null
  isOpen: boolean
  onClose: () => void
  onEdit: (routine: Routine) => void
  onDelete: (routine: Routine) => void
  onMoveToPlan?: (routine: Routine) => void
  onRemoveFromPlan?: (routine: Routine) => void
}

export function RoutineContextMenu({
  routine,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onMoveToPlan,
  onRemoveFromPlan,
}: RoutineContextMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset confirmation whenever the menu opens with a new routine or closes
  useEffect(() => {
    setShowDeleteConfirm(false)
  }, [routine, isOpen])

  if (!isOpen || !routine) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Action Sheet Modal */}
      <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-xl z-10 space-y-3 animate-in fade-in slide-in-from-bottom duration-150">
        <div className="border-b border-gray-800 pb-3">
          <h3 className="truncate text-base font-semibold text-white">{routine.name}</h3>
          <p className="text-xs text-gray-400">Routine options</p>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-3 py-1">
            <p className="text-xs text-red-300">
              Are you sure you want to delete this routine? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDelete(routine)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(routine)}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-white hover:bg-gray-800/80 transition"
            >
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Routine
            </button>

            {/* Move / Remove Plan */}
            {routine.planId ? (
              onRemoveFromPlan && (
                <button
                  type="button"
                  onClick={() => onRemoveFromPlan(routine)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-gray-300 hover:bg-gray-800/80 hover:text-white transition"
                >
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Remove from Plan
                </button>
              )
            ) : (
              onMoveToPlan && (
                <button
                  type="button"
                  onClick={() => onMoveToPlan(routine)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-gray-300 hover:bg-gray-800/80 hover:text-white transition"
                >
                  <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Move to Plan
                </button>
              )
            )}

            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-950/40 transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Routine
            </button>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-800/80 py-3 text-center text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
