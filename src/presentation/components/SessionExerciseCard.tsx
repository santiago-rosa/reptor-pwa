import type { SessionExercise } from '@/domain/entities/WorkoutSession'
import { SessionSetRow } from './SessionSetRow'
import { formatReps } from '@/presentation/utils/formatReps'

interface SessionExerciseCardProps {
  exercise: SessionExercise
  onUpdateSet: (setNumber: number, data: { weightKg?: number; reps?: number }) => void
  onToggleSetLogged: (setNumber: number) => void
  onAddSet: () => void
  onRemoveLastSet: () => void
}

export function SessionExerciseCard({
  exercise,
  onUpdateSet,
  onToggleSetLogged,
  onAddSet,
  onRemoveLastSet,
}: SessionExerciseCardProps) {
  const completedCount = exercise.sets.filter((s) => s.isCompleted).length
  const totalCount = exercise.sets.length

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 space-y-3">
      {/* Exercise Card Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-white truncate pr-2">
            {exercise.exerciseName || 'Exercise'}
          </h3>
          {exercise.repTargetMin != null && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              Target: {formatReps(exercise.repTargetMin, exercise.repTargetMax)}
            </p>
          )}
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full shrink-0">
          {completedCount} / {totalCount} completed
        </span>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-[36px_1fr_1fr_40px] gap-2 px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span className="text-center">Set</span>
        <span className="text-center">Kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center">Done</span>
      </div>

      {/* Set Rows */}
      <div className="space-y-1.5">
        {exercise.sets.map((set) => (
          <SessionSetRow
            key={set.id}
            set={set}
            onUpdate={(data) => onUpdateSet(set.setNumber, data)}
            onToggleLogged={() => onToggleSetLogged(set.setNumber)}
          />
        ))}
      </div>

      {/* Actions (Add Set / Remove Last Set) */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={onAddSet}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gray-800/80 text-blue-400 hover:bg-gray-800 hover:text-blue-300 font-semibold transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Set
        </button>

        {exercise.sets.length > 1 && (
          <button
            type="button"
            onClick={onRemoveLastSet}
            className="py-1.5 px-2.5 text-gray-400 hover:text-red-400 font-medium transition"
          >
            Remove last set
          </button>
        )}
      </div>
    </div>
  )
}
