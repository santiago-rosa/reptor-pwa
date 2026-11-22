import type { SessionSet } from '@/domain/entities/WorkoutSession'

interface SessionSetRowProps {
  set: SessionSet
  onUpdate: (data: { weightKg?: number; reps?: number }) => void
  onToggleLogged: () => void
}

export function SessionSetRow({ set, onUpdate, onToggleLogged }: SessionSetRowProps) {
  const isLogged = set.isCompleted

  return (
    <div
      data-testid={`set-row-${set.setNumber}`}
      className={`grid grid-cols-[36px_1fr_1fr_40px] items-center gap-2 p-2 rounded-xl border transition-all ${
        isLogged
          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
          : 'bg-gray-950 border-gray-800/80 text-gray-100 hover:border-gray-700'
      }`}
    >
      {/* Set Number */}
      <span className="text-center text-xs font-bold text-gray-400">
        {set.setNumber}
      </span>

      {/* Weight Input */}
      <div>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="0 kg"
          aria-label={`Set ${set.setNumber} weight`}
          value={set.weightKg === 0 ? '' : set.weightKg}
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            onUpdate({ weightKg: isNaN(val) ? 0 : Math.max(0, val) })
          }}
          className={`w-full py-1.5 px-2 text-center text-xs font-semibold rounded-lg border focus:outline-none transition-colors ${
            isLogged
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-100 focus:border-emerald-400'
              : 'bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-blue-500'
          }`}
        />
      </div>

      {/* Reps Input */}
      <div>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="0"
          aria-label={`Set ${set.setNumber} reps`}
          value={set.reps === 0 ? '' : set.reps}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10)
            onUpdate({ reps: isNaN(val) ? 0 : Math.max(0, val) })
          }}
          className={`w-full py-1.5 px-2 text-center text-xs font-semibold rounded-lg border focus:outline-none transition-colors ${
            isLogged
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-100 focus:border-emerald-400'
              : 'bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-blue-500'
          }`}
        />
      </div>

      {/* Logged Check Button */}
      <div className="flex justify-center">
        <button
          type="button"
          aria-label={`Toggle set ${set.setNumber} logged`}
          onClick={onToggleLogged}
          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
            isLogged
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 active:scale-95'
              : 'bg-gray-800 border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
