import { useState, useEffect } from 'react'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'
import { useRoutineStore } from '../stores/routineStore'
import { usePlanStore } from '../stores/planStore'

interface SaveAsRoutineModalProps {
  isOpen: boolean
  session: WorkoutSession | null
  onClose: () => void
  onSaved: () => void
}

export function SaveAsRoutineModal({
  isOpen,
  session,
  onClose,
  onSaved,
}: SaveAsRoutineModalProps) {
  const [name, setName] = useState('')
  const [planId, setPlanId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans = usePlanStore((s) => s.plans)
  const createRoutine = useRoutineStore((s) => s.createRoutine)

  useEffect(() => {
    if (session) {
      setName(session.title || 'New Routine')
      setPlanId('')
      setError(null)
      setIsSubmitting(false)
    }
  }, [session])

  if (!isOpen || !session) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const routineExercises = session.exercises.map((ex, index) => {
        const completedReps = ex.sets.map((s) => s.reps).filter((r) => r > 0)
        const minReps = completedReps.length > 0 ? Math.min(...completedReps) : 8
        const maxReps = completedReps.length > 0 ? Math.max(...completedReps) : 10

        return {
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex ?? index,
          sets: Math.max(1, ex.sets.length),
          repsMin: minReps,
          repsMax: maxReps > minReps ? maxReps : null,
        }
      })

      await createRoutine({
        name: trimmedName,
        planId: planId || null,
        exercises: routineExercises,
      })

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save routine')
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

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl z-10 space-y-4 animate-in fade-in slide-in-from-bottom duration-150">
        <div className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <h3 className="text-base font-bold text-white">Save as Routine?</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Workout completed! Save these exercises and sets as a routine template for next time.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="routine-name-input" className="text-xs font-medium text-gray-400">
              Routine Name
            </label>
            <input
              id="routine-name-input"
              type="text"
              autoFocus
              placeholder="e.g. Full Body Pump"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {plans.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="plan-folder-select" className="text-xs font-medium text-gray-400">
                Plan Folder (Optional)
              </label>
              <select
                id="plan-folder-select"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">No Plan (Individual Routine)</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exercises Preview */}
          <div className="rounded-xl bg-gray-950/80 border border-gray-800/80 p-3 space-y-1 text-xs text-gray-400">
            <span className="font-semibold text-gray-300 block mb-1">
              Included Exercises ({session.exercises.length}):
            </span>
            {session.exercises.map((ex, idx) => (
              <div key={ex.id || idx} className="flex justify-between truncate">
                <span className="truncate">{ex.exerciseName || 'Exercise'}</span>
                <span className="text-gray-500 ml-2 shrink-0">{ex.sets.length} sets</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
