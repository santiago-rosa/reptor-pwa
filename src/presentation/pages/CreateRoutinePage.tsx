import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoutineDraftStore } from '../stores/routineDraftStore'
import { useRoutineStore } from '../stores/routineStore'
import { usePlanStore } from '../stores/planStore'
import { SelectedExerciseRow } from '../components/SelectedExerciseRow'

export function CreateRoutinePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const name = useRoutineDraftStore((s) => s.name)
  const planId = useRoutineDraftStore((s) => s.planId)
  const exercises = useRoutineDraftStore((s) => s.exercises)
  const setName = useRoutineDraftStore((s) => s.setName)
  const setPlanId = useRoutineDraftStore((s) => s.setPlanId)
  const updateExerciseSets = useRoutineDraftStore((s) => s.updateExerciseSets)
  const updateExerciseReps = useRoutineDraftStore((s) => s.updateExerciseReps)
  const removeExercise = useRoutineDraftStore((s) => s.removeExercise)
  const resetDraft = useRoutineDraftStore((s) => s.reset)

  const createRoutine = useRoutineStore((s) => s.createRoutine)
  const plans = usePlanStore((s) => s.plans)

  const isSaveDisabled = !name.trim() || exercises.length === 0 || isSubmitting

  const handleSave = async () => {
    if (isSaveDisabled) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await createRoutine({
        name: name.trim(),
        planId: planId || null,
        exercises: exercises.map((e, index) => ({
          exerciseId: e.exerciseId,
          orderIndex: index,
          sets: e.sets,
          repsMin: e.repsMin,
          repsMax: e.repsMax ?? null,
        })),
      })

      resetDraft()
      navigate('/routines')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save routine')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetDraft()
    navigate('/routines')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs font-medium text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        <h1 className="text-base font-semibold text-white">New Routine</h1>
        <button
          type="button"
          disabled={isSaveDisabled}
          onClick={handleSave}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Routine Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="routine-name" className="text-xs font-medium text-gray-400">
          Routine Name
        </label>
        <input
          id="routine-name"
          type="text"
          placeholder="e.g. Chest & Triceps"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Optional Plan / Folder Dropdown */}
      {plans.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="plan-folder" className="text-xs font-medium text-gray-400">
            Folder / Plan (Optional)
          </label>
          <select
            id="plan-folder"
            value={planId ?? ''}
            onChange={(e) => setPlanId(e.target.value || null)}
            className="w-full rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">None (Individual Routine)</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Exercises Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Exercises ({exercises.length})
          </h2>
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500">
            No exercises added yet. Tap below to pick exercises.
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <SelectedExerciseRow
                key={ex.exerciseId}
                exercise={ex}
                onUpdateSets={(sets) => updateExerciseSets(ex.exerciseId, sets)}
                onUpdateReps={(min, max) => updateExerciseReps(ex.exerciseId, min, max)}
                onRemove={() => removeExercise(ex.exerciseId)}
              />
            ))}
          </div>
        )}

        {/* Add Exercises Button */}
        <button
          type="button"
          onClick={() => navigate('/exercises/pick?mode=routine')}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 bg-gray-900/40 py-3 text-xs font-semibold text-blue-400 hover:border-blue-500 hover:bg-gray-800/50 transition active:scale-[0.99]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Exercises
        </button>
      </div>

      {/* Floating / Bottom Save Action */}
      <div className="pt-4">
        <button
          type="button"
          disabled={isSaveDisabled}
          onClick={handleSave}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isSubmitting ? 'Saving Routine...' : 'Save Routine'}
        </button>
      </div>
    </div>
  )
}
