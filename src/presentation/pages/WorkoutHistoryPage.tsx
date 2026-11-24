import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutHistoryStore } from '../stores/workoutHistoryStore'
import { SessionSummaryCard } from '../components/SessionSummaryCard'
import { EmptyState } from '../components/EmptyState'

export function WorkoutHistoryPage() {
  const navigate = useNavigate()
  const { sessions, loading, error, fetchSessions } = useWorkoutHistoryStore()

  useEffect(() => {
    fetchSessions(true)
  }, [fetchSessions])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workout History</h1>
          <p className="text-sm text-gray-400">Past logged sessions</p>
        </div>
        {sessions.length > 0 && (
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
            {sessions.length} {sessions.length === 1 ? 'workout' : 'workouts'}
          </span>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchSessions(true)}
            className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && sessions.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/40 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-gray-800" />
                <div className="h-4 w-16 rounded bg-gray-800" />
              </div>
              <div className="h-6 w-48 rounded bg-gray-800" />
              <div className="flex gap-4">
                <div className="h-4 w-20 rounded bg-gray-800" />
                <div className="h-4 w-20 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && !error && (
        <EmptyState
          title="No workouts logged yet"
          description="Complete a workout from your routines to see your session history here."
          action={{
            label: 'Go to Routines',
            onClick: () => navigate('/routines'),
          }}
        />
      )}

      {/* Sessions List */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionSummaryCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/history/${session.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
