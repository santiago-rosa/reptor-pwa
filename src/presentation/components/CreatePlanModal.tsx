import { useState, useEffect } from 'react'
import type { Plan } from '@/domain/entities/Plan'

interface CreatePlanModalProps {
  isOpen: boolean
  planToEdit?: Plan | null
  onClose: () => void
  onSubmit: (name: string) => Promise<void> | void
}

export function CreatePlanModal({
  isOpen,
  planToEdit,
  onClose,
  onSubmit,
}: CreatePlanModalProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(planToEdit?.name || '')
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, planToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan')
      setIsSubmitting(false)
    }
  }

  const isRename = !!planToEdit

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl z-10 space-y-4 animate-in fade-in slide-in-from-bottom duration-150">
        <div className="border-b border-gray-800 pb-3">
          <h3 className="text-base font-semibold text-white">
            {isRename ? 'Rename Plan' : 'New Plan Folder'}
          </h3>
          <p className="text-xs text-gray-400">
            {isRename ? 'Update the name of this folder' : 'Group your routines into a dedicated split or program'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="plan-name-input" className="text-xs font-medium text-gray-400">
              Folder Name
            </label>
            <input
              id="plan-name-input"
              type="text"
              autoFocus
              placeholder="e.g. Upper / Lower Split"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Saving...' : isRename ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
