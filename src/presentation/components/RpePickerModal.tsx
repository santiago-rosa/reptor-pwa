export interface RpeOption {
  value: number
  label: string
  description: string
  badgeColor: string
}

export const RPE_OPTIONS: RpeOption[] = [
  {
    value: 10,
    label: '10',
    description: 'Max effort / 0 RIR — Could not do another rep',
    badgeColor: 'text-red-400 bg-red-500/15 border-red-500/30',
  },
  {
    value: 9.5,
    label: '9.5',
    description: 'Near max / 0–1 RIR — Maybe 1 more rep with lighter weight',
    badgeColor: 'text-red-300 bg-red-500/10 border-red-500/20',
  },
  {
    value: 9,
    label: '9',
    description: 'Very hard / 1 RIR — 1 rep left in the tank',
    badgeColor: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  },
  {
    value: 8.5,
    label: '8.5',
    description: 'Hard / 1–2 RIR — Definitely 1, maybe 2 reps left',
    badgeColor: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
  },
  {
    value: 8,
    label: '8',
    description: 'Challenging / 2 RIR — 2 reps left in the tank',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  },
  {
    value: 7.5,
    label: '7.5',
    description: 'Moderate-hard / 2–3 RIR — Bar speed still snappy',
    badgeColor: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
  },
  {
    value: 7,
    label: '7',
    description: 'Moderate / 3 RIR — 3 reps left in the tank',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  },
  {
    value: 6,
    label: '6',
    description: 'Light-moderate / 4+ RIR — Warm-up or speed work',
    badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  },
]

interface RpePickerModalProps {
  isOpen: boolean
  setNumber: number
  currentRpe: number | null | undefined
  onSelect: (rpe: number | null) => void
  onClose: () => void
}

export function RpePickerModal({
  isOpen,
  setNumber,
  currentRpe,
  onSelect,
  onClose,
}: RpePickerModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Select RPE for Set ${setNumber}`}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-white">Set {setNumber} — Effort (RPE)</h3>
            <p className="text-[11px] text-gray-400">
              Rate of Perceived Exertion · RIR = Reps in Reserve
            </p>
          </div>
          <button
            type="button"
            aria-label="Close RPE picker"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-1.5">
          {RPE_OPTIONS.map((option) => {
            const isSelected = currentRpe === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40'
                    : 'border-gray-800/80 bg-gray-950/60 hover:border-gray-700 hover:bg-gray-950'
                }`}
              >
                <span
                  className={`inline-flex h-7 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${option.badgeColor}`}
                >
                  {option.label}
                </span>
                <span className="text-xs text-gray-200 flex-1">{option.description}</span>
                {isSelected && (
                  <svg className="h-4 w-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {currentRpe != null && (
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              onClose()
            }}
            className="w-full rounded-xl border border-gray-800 bg-gray-800/60 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Clear RPE
          </button>
        )}
      </div>
    </div>
  )
}
