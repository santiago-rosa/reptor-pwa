import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutineDraftStore } from '../stores/routineDraftStore'
import { useRoutineStore } from '../stores/routineStore'
import { usePlanStore } from '../stores/planStore'
import { SelectedExerciseRow } from '../components/SelectedExerciseRow'

export function EditRoutinePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const routines = useRoutineStore((s) => s.routines)
  const routinesLoading = useRoutineStore((s) => s.loading)
  const fetchRoutines = useRoutineStore((s) => s.fetchRoutines)
  const updateRoutine = useRoutineStore((s) => s.updateRoutine)
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine)

  const plans = usePlanStore((s) => s.plans)
  const fetchPlans = usePlanStore((s) => s.fetchPlans)

  const routineId = useRoutineDraftStore((s) => s.routineId)
  const name = useRoutineDraftStore((s) => s.name)
  const planId = useRoutineDraftStore((s) => s.planId)
  const exercises = useRoutineDraftStore((s) => s.exercises)
  const setName = useRoutineDraftStore((s) => s.setName)
  const setPlanId = useRoutineDraftStore((s) => s.setPlanId)
  const updateExerciseSets = useRoutineDraftStore((s) => s.updateExerciseSets)
  const updateExerciseReps = useRoutineDraftStore((s) => s.updateExerciseReps)
  const removeExercise = useRoutineDraftStore((s) => s.removeExercise)
  const loadFromRoutine = useRoutineDraftStore((s) => s.loadFromRoutine)
  const resetDraft = useRoutineDraftStore((s) => s.reset)

  useEffect(() => {
    fetchRoutines()
    fetchPlans()
  }, [fetchRoutines, fetchPlans])

  const existingRoutine = routines.find((r) => r.id === id)

  // Load routine into draft store when found and not already loaded
  useEffect(() => {
    if (existingRoutine && routineId !== id) {
      loadFromRoutine(existingRoutine)
    }
  }, [existingRoutine, id, routineId, loadFromRoutine])

  const isSaveDisabled = !name.trim() || exercises.length === 0 || isSubmitting

  const handleSave = async () => {
    if (!id || isSaveDisabled) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await updateRoutine({
        id,
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
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update routine')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await deleteRoutine(id)
      resetDraft()
      navigate('/routines')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete routine')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetDraft()
    navigate('/routines')
  }

  if (!existingRoutine && !routinesLoading) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-400 text-sm">Routine not found</p>
        <button
          type="button"
          onClick={() => navigate('/routines')}
          className="text-xs text-blue-500 hover:text-blue-400 underline"
        >
          Back to Routines
        </button>
      </div>
    )
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
        <h1 className="text-base font-semibold text-white">Edit Routine</h1>
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

      {/* Plan Assignment Dropdown */}
      {plans.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="plan-select" className="text-xs font-medium text-gray-400">
            Plan Folder (Optional)
          </label>
          <select
            id="plan-select"
            value={planId || ''}
            onChange={(e) => setPlanId(e.target.value || null)}
            className="w-full rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
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

      {/* Exercises Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Exercises ({exercises.length})
          </h2>
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center">
            <p className="text-xs text-gray-500">No exercises added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((item) => (
              <SelectedExerciseRow
                key={item.exerciseId}
                exercise={item}
                onUpdateSets={(sets) => updateExerciseSets(item.exerciseId, sets)}
                onUpdateReps={(min, max) => updateExerciseReps(item.exerciseId, min, max)}
                onRemove={() => removeExercise(item.exerciseId)}
              />
            ))}
          </div>
        )}

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={() => navigate('/exercises/pick?mode=routine')}
          className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl text-gray-300 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-semibold text-blue-400">Add Exercise</span>
        </button>
      </div>

      {/* Delete Routine Action */}
      <div className="pt-6 border-t border-gray-800">
        {showDeleteConfirm ? (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 space-y-3">
            <p className="text-xs text-red-300">
              Are you sure you want to delete &quot;{name}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
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
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 rounded-xl border border-red-900/40 text-red-400 hover:bg-red-950/30 text-xs font-semibold transition"
          >
            Delete Routine
          </button>
        )}
      </div>
    </div>
  )
}
