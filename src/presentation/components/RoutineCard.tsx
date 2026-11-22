import type { Routine } from '@/domain/entities/Routine'

interface RoutineCardProps {
  routine: Routine
  onStart?: (routine: Routine) => void
  onMenuClick?: (routine: Routine) => void
}

export function RoutineCard({ routine, onStart, onMenuClick }: RoutineCardProps) {
  const exercisesCount = routine.exercises.length
  const totalSets = routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)

  // Preview names of first 3 exercises
  const previewNames = routine.exercises
    .slice(0, 3)
    .map((ex) => ex.exerciseName || 'Exercise')
    .join(', ')

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 transition-colors hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">{routine.name}</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            {exercisesCount} {exercisesCount === 1 ? 'exercise' : 'exercises'} · {totalSets} {totalSets === 1 ? 'set' : 'sets'}
          </p>
          {previewNames && (
            <p className="mt-2 truncate text-xs text-gray-500">{previewNames}{routine.exercises.length > 3 ? '...' : ''}</p>
          )}
        </div>

        {onMenuClick && (
          <button
            type="button"
            aria-label="Routine menu"
            onClick={(e) => {
              e.stopPropagation()
              onMenuClick(routine)
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onStart?.(routine)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start
        </button>
      </div>
    </div>
  )
}
