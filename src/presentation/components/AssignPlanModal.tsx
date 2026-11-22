import { useState } from 'react'
import type { Routine } from '@/domain/entities/Routine'
import type { Plan } from '@/domain/entities/Plan'

interface AssignPlanModalProps {
  isOpen: boolean
  routine: Routine | null
  plans: Plan[]
  onClose: () => void
  onAssign: (routineId: string, planId: string) => Promise<void> | void
  onRemoveFromPlan: (routineId: string) => Promise<void> | void
  onCreateNewPlan?: () => void
}

export function AssignPlanModal({
  isOpen,
  routine,
  plans,
  onClose,
  onAssign,
  onRemoveFromPlan,
  onCreateNewPlan,
}: AssignPlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !routine) return null

  const handleSelectPlan = async (planId: string) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onAssign(routine.id, planId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move routine to plan')
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onRemoveFromPlan(routine.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from plan')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl z-10 space-y-4 animate-in fade-in slide-in-from-bottom duration-150">
        <div className="border-b border-gray-800 pb-3">
          <h3 className="text-base font-semibold text-white">Move to Plan</h3>
          <p className="text-xs text-gray-400">
            Choose a plan folder for &quot;{routine.name}&quot;
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto space-y-2 py-1 pr-1">
          {/* Option: Individual / No Plan */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting || !routine.planId}
            className={`flex w-full items-center justify-between rounded-xl p-3 text-left border transition ${
              !routine.planId
                ? 'bg-blue-950/30 border-blue-600/60 cursor-default'
                : 'bg-gray-950 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs font-medium text-white">No Plan (Individual Routine)</span>
            </div>
            {!routine.planId && (
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                Current
              </span>
            )}
          </button>

          {/* List of plans */}
          {plans.map((plan) => {
            const isCurrent = routine.planId === plan.id
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isSubmitting || isCurrent}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-left border transition ${
                  isCurrent
                    ? 'bg-blue-950/30 border-blue-600/60 cursor-default'
                    : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-white">{plan.name}</span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                    Current
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {onCreateNewPlan && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onCreateNewPlan()
            }}
            className="w-full py-2.5 rounded-xl border border-dashed border-gray-700 hover:border-gray-500 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            + Create New Plan Folder
          </button>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-800 py-2.5 text-center text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
