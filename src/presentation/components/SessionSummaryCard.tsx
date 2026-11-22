import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

interface SessionSummaryCardProps {
  session: WorkoutSession
  onClick?: () => void
}

export function formatSessionDate(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return String(dateInput)

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return String(dateInput)
  }
}

export function calculateSessionDuration(
  startedAt: string | Date,
  finishedAt?: string | Date | null
): string {
  if (!finishedAt) return '—'

  const startMs = new Date(startedAt).getTime()
  const finishMs = new Date(finishedAt).getTime()

  if (isNaN(startMs) || isNaN(finishMs) || finishMs < startMs) return '—'

  const diffMinutes = Math.round((finishMs - startMs) / (1000 * 60))
  if (diffMinutes < 1) return '< 1m'
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${diffMinutes}m`
}

export function calculateSessionMetrics(session: WorkoutSession): {
  totalSets: number
  totalVolumeKg: number
} {
  let completedSetsCount = 0
  let totalSetsCount = 0
  let totalVolumeKg = 0

  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      totalSetsCount++
      if (set.isCompleted) {
        completedSetsCount++
        totalVolumeKg += (set.weightKg ?? 0) * (set.reps ?? 0)
      }
    }
  }

  // If user didn't mark sets as completed, fallback to all sets count
  const totalSets = completedSetsCount > 0 ? completedSetsCount : totalSetsCount
  return {
    totalSets,
    totalVolumeKg: Math.round(totalVolumeKg),
  }
}

export function SessionSummaryCard({ session, onClick }: SessionSummaryCardProps) {
  const formattedDate = formatSessionDate(session.startedAt)
  const duration = calculateSessionDuration(session.startedAt, session.finishedAt)
  const { totalSets, totalVolumeKg } = calculateSessionMetrics(session)

  const exerciseNames = session.exercises
    .map((e) => e.exerciseName)
    .filter((name): name is string => Boolean(name && name.trim()))

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 transition-all hover:border-gray-700 hover:bg-gray-900 cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      {/* Top Header: Title & Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium tracking-wide uppercase text-gray-500">
            {formattedDate}
          </span>
          <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors">
            {session.title || 'Workout Session'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-gray-400 group-hover:text-gray-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Metrics Row: Duration, Sets, Volume */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-gray-300">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-white">{duration}</span>
        </div>

        <div className="h-3 w-px bg-gray-800" />

        <div className="flex items-center gap-1.5 text-gray-300">
          <span className="text-gray-500 font-medium">Sets:</span>
          <span className="font-semibold text-white">{totalSets}</span>
        </div>

        {totalVolumeKg > 0 && (
          <>
            <div className="h-3 w-px bg-gray-800" />
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500 font-medium">Vol:</span>
              <span className="font-semibold text-white">{totalVolumeKg.toLocaleString()} kg</span>
            </div>
          </>
        )}
      </div>

      {/* Exercise Names List Preview */}
      {exerciseNames.length > 0 && (
        <div className="pt-1 text-xs text-gray-400 truncate">
          {exerciseNames.slice(0, 4).join(', ')}
          {exerciseNames.length > 4 && ` +${exerciseNames.length - 4} more`}
        </div>
      )}
    </div>
  )
}
