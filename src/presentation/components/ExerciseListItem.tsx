import type { Exercise } from '@/domain/entities/Exercise'

interface ExerciseListItemProps {
  exercise: Exercise
  isSelected: boolean
  isAlreadyAdded: boolean
  onToggle: () => void
}

export function ExerciseListItem({
  exercise,
  isSelected,
  isAlreadyAdded,
  onToggle,
}: ExerciseListItemProps) {
  const formattedEquipment =
    exercise.equipment.charAt(0).toUpperCase() +
    exercise.equipment.slice(1).replace(/_/g, ' ')

  return (
    <div
      role="button"
      tabIndex={isAlreadyAdded ? -1 : 0}
      aria-disabled={isAlreadyAdded}
      onClick={() => {
        if (!isAlreadyAdded) onToggle()
      }}
      onKeyDown={(e) => {
        if (!isAlreadyAdded && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle()
        }
      }}
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
        isAlreadyAdded
          ? 'bg-gray-900/40 border-gray-800/50 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-blue-950/30 border-blue-600/60 cursor-pointer'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700 cursor-pointer'
      }`}
    >
      <div className="flex flex-col min-w-0 pr-3">
        <span className="text-sm font-medium text-white truncate">
          {exercise.name}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-400 capitalize">
            {formattedEquipment}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        {isAlreadyAdded ? (
          <span className="text-xs font-medium text-gray-500 bg-gray-800/80 px-2 py-1 rounded">
            Added
          </span>
        ) : (
          <div
            data-testid={`checkbox-${exercise.id}`}
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-600 bg-transparent'
            }`}
          >
            {isSelected && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
