import type { DraftExercise } from '../stores/routineDraftStore'

interface SelectedExerciseRowProps {
  exercise: DraftExercise
  onUpdateSets: (sets: number) => void
  onUpdateReps: (repsMin: number, repsMax?: number | null) => void
  onRemove: () => void
}

export function SelectedExerciseRow({
  exercise,
  onUpdateSets,
  onUpdateReps,
  onRemove,
}: SelectedExerciseRowProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <h4 className="truncate font-semibold text-white text-sm">{exercise.exerciseName}</h4>
        <button
          type="button"
          aria-label={`Remove ${exercise.exerciseName}`}
          onClick={onRemove}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-4 border-t border-gray-800/60 pt-3">
        {/* Sets Counter: [-] N [+] */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sets</span>
          <div className="flex items-center rounded-lg border border-gray-800 bg-gray-950 p-0.5">
            <button
              type="button"
              aria-label="Decrease sets"
              disabled={exercise.sets <= 1}
              onClick={() => onUpdateSets(exercise.sets - 1)}
              className="h-7 w-7 rounded flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-7 text-center text-xs font-bold text-white">{exercise.sets}</span>
            <button
              type="button"
              aria-label="Increase sets"
              disabled={exercise.sets >= 10}
              onClick={() => onUpdateSets(exercise.sets + 1)}
              className="h-7 w-7 rounded flex items-center justify-center text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps Range */}
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <span className="text-gray-400">Reps</span>
          <input
            type="number"
            min={1}
            max={100}
            aria-label="Minimum reps"
            value={exercise.repsMin}
            onChange={(e) => onUpdateReps(Math.max(1, parseInt(e.target.value) || 1), exercise.repsMax)}
            className="w-12 rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 text-center text-xs text-white focus:border-blue-500 focus:outline-none"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            min={1}
            max={100}
            aria-label="Maximum reps"
            value={exercise.repsMax ?? ''}
            placeholder="—"
            onChange={(e) => {
              const val = e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : null
              onUpdateReps(exercise.repsMin, val)
            }}
            className="w-12 rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 text-center text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
