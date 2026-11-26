import { useState } from 'react'
import type { SessionSet } from '@/domain/entities/WorkoutSession'
import type { SetUpdateData } from '@/presentation/stores/workoutSessionStore'
import { formatPreviousSetHint } from '@/presentation/utils/previousPerformance'
import { RpePickerModal } from './RpePickerModal'

interface SessionSetRowProps {
  set: SessionSet
  previousSet?: SessionSet
  onUpdate: (data: SetUpdateData) => void
  onToggleLogged: () => void
}

export function SessionSetRow({ set, previousSet, onUpdate, onToggleLogged }: SessionSetRowProps) {
  const isLogged = set.isCompleted
  const [showRpePicker, setShowRpePicker] = useState(false)
  const previousHint = formatPreviousSetHint(previousSet)

  return (
    <>
      <div
        data-testid={`set-row-${set.setNumber}`}
        className={`p-2 rounded-xl border transition-all ${
          isLogged
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
            : 'bg-gray-950 border-gray-800/80 text-gray-100 hover:border-gray-700'
        }`}
      >
        <div className="grid grid-cols-[32px_1fr_1fr_50px_36px] items-center gap-1.5">
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

          {/* RPE Selector Button */}
          <div>
            <button
              type="button"
              aria-label={`Set ${set.setNumber} RPE`}
              onClick={() => setShowRpePicker(true)}
              className={`w-full py-1.5 px-1 text-center text-xs font-semibold rounded-lg border transition-colors ${
                set.rpe != null
                  ? isLogged
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200 hover:border-emerald-400'
                    : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:border-blue-400'
                  : isLogged
                  ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-400/60 hover:text-emerald-200'
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              {set.rpe != null ? set.rpe : '—'}
            </button>
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

        {previousHint && (
          <div
            data-testid={`set-hint-${set.setNumber}`}
            className="mt-1 pl-[38px] text-[10px] text-gray-500"
          >
            Prev: {previousHint}
          </div>
        )}
      </div>

      <RpePickerModal
        isOpen={showRpePicker}
        setNumber={set.setNumber}
        currentRpe={set.rpe}
        onSelect={(rpe) => onUpdate({ rpe })}
        onClose={() => setShowRpePicker(false)}
      />
    </>
  )
}
