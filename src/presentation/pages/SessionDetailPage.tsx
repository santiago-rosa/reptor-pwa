import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkoutHistoryStore } from '../stores/workoutHistoryStore'
import {
  formatSessionDate,
  calculateSessionDuration,
  calculateSessionMetrics,
} from '../components/SessionSummaryCard'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedSession, loading, error, fetchSessionById, clearSelectedSession } =
    useWorkoutHistoryStore()

  useEffect(() => {
    if (id) {
      fetchSessionById(id)
    }
    return () => {
      clearSelectedSession()
    }
  }, [id, fetchSessionById, clearSelectedSession])

  const handleBack = () => {
    navigate('/history')
  }

  // Loading skeleton
  if (loading && !selectedSession) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-6 w-32 bg-gray-800 rounded-lg" />
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-800 rounded-lg" />
          <div className="h-4 w-40 bg-gray-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
          <div className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
          <div className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
        </div>
        <div className="space-y-4">
          <div className="h-36 bg-gray-900 rounded-2xl border border-gray-800" />
          <div className="h-36 bg-gray-900 rounded-2xl border border-gray-800" />
        </div>
      </div>
    )
  }

  // Not found or error
  if (!selectedSession) {
    return (
      <div className="space-y-6 pb-12 text-center py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Workout Session Not Found</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          {error || 'This workout session could not be found or has been removed.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition"
        >
          ← Back to History
        </button>
      </div>
    )
  }

  const formattedDate = formatSessionDate(selectedSession.startedAt)
  const duration = calculateSessionDuration(selectedSession.startedAt, selectedSession.finishedAt)
  const { totalSets, totalVolumeKg } = calculateSessionMetrics(selectedSession)

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </button>
      </div>

      {/* Header Info */}
      <header className="space-y-1">
        <span className="text-xs font-medium uppercase tracking-wider text-blue-400">
          {formattedDate}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {selectedSession.title || 'Workout Session'}
        </h1>
      </header>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
          <span className="text-[11px] font-medium text-gray-400">Duration</span>
          <span className="mt-1 text-base font-bold text-white">{duration}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
          <span className="text-[11px] font-medium text-gray-400">Total Sets</span>
          <span className="mt-1 text-base font-bold text-white">{totalSets}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
          <span className="text-[11px] font-medium text-gray-400">Volume</span>
          <span className="mt-1 text-base font-bold text-white">{totalVolumeKg.toLocaleString()} kg</span>
        </div>
      </div>

      {/* Exercises Breakdown */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Exercises ({selectedSession.exercises.length})
        </h2>

        {selectedSession.exercises.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-center text-sm text-gray-500">
            No exercises recorded in this session.
          </div>
        ) : (
          selectedSession.exercises.map((exercise, exIndex) => {
            const exerciseVolume = exercise.sets.reduce((sum, s) => {
              return s.isCompleted ? sum + (s.weightKg ?? 0) * (s.reps ?? 0) : sum
            }, 0)

            return (
              <div
                key={exercise.id || exIndex}
                className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 px-4 py-3 bg-gray-950/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
                      {exIndex + 1}
                    </span>
                    <h3 className="font-bold text-white truncate text-sm">
                      {exercise.exerciseName || 'Exercise'}
                    </h3>
                  </div>
                  {exerciseVolume > 0 && (
                    <span className="text-xs font-semibold text-gray-400 shrink-0">
                      {exerciseVolume.toLocaleString()} kg
                    </span>
                  )}
                </div>

                {/* Sets Table */}
                <div className="p-3">
                  <div className="grid grid-cols-12 gap-2 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-2">
                    <div className="col-span-2">Set</div>
                    <div className="col-span-4 text-center">Weight</div>
                    <div className="col-span-3 text-center">Reps</div>
                    <div className="col-span-3 text-right">Status</div>
                  </div>

                  <div className="space-y-1.5">
                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 items-center gap-2 rounded-xl px-2 py-2 text-xs transition-colors ${
                          set.isCompleted ? 'bg-gray-950/60 text-white' : 'bg-gray-950/20 text-gray-500'
                        }`}
                      >
                        <div className="col-span-2 font-bold text-gray-400">
                          #{set.setNumber}
                        </div>
                        <div className="col-span-4 text-center font-semibold text-white">
                          {set.weightKg ?? 0} <span className="text-[10px] text-gray-400 font-normal">kg</span>
                        </div>
                        <div className="col-span-3 text-center font-semibold text-white">
                          {set.reps ?? 0} <span className="text-[10px] text-gray-400 font-normal">reps</span>
                        </div>
                        <div className="col-span-3 flex justify-end">
                          {set.isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Done
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                              Skipped
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
