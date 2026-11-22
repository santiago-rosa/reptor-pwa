import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutSessionStore } from '../stores/workoutSessionStore'

export function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

export function WorkoutSessionPage() {
  const navigate = useNavigate()
  const activeSession = useWorkoutSessionStore((s) => s.activeSession)
  const discard = useWorkoutSessionStore((s) => s.discard)

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!activeSession?.startedAt) return 0
    const start = new Date(activeSession.startedAt).getTime()
    return Math.max(0, Math.floor((Date.now() - start) / 1000))
  })

  // Redirect to /routines if no active session
  useEffect(() => {
    if (!activeSession) {
      navigate('/routines', { replace: true })
    }
  }, [activeSession, navigate])

  // Live timer tick from startedAt
  useEffect(() => {
    if (!activeSession?.startedAt) return

    const updateTimer = () => {
      const start = new Date(activeSession.startedAt).getTime()
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [activeSession?.startedAt])

  if (!activeSession) {
    return null
  }

  const handleConfirmDiscard = () => {
    discard()
    setShowDiscardConfirm(false)
    navigate('/routines', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-800 bg-gray-950/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0 flex-1 pr-3">
          <h1 className="truncate text-base font-bold text-white">{activeSession.title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg
              className="h-3.5 w-3.5 text-blue-400 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              data-testid="session-timer"
              className="font-mono text-xs font-semibold text-blue-400 tracking-wider"
            >
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDiscardConfirm(true)}
            className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition"
          >
            Discard
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {activeSession.exercises.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-8 text-center space-y-3 mt-6">
            <p className="text-sm text-gray-400">No exercises in this session.</p>
            <button
              type="button"
              onClick={() => navigate('/exercises/pick?mode=session')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              + Add Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSession.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {idx + 1}. {ex.exerciseName}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {ex.sets.length} {ex.sets.length === 1 ? 'set' : 'sets'}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => navigate('/exercises/pick?mode=session')}
              className="w-full py-3 border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-xl text-gray-400 font-medium flex items-center justify-center gap-2 text-xs transition"
            >
              + Add Exercise
            </button>
          </div>
        )}
      </main>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl space-y-3">
            <h3 className="text-base font-semibold text-white">Discard Workout?</h3>
            <p className="text-xs text-gray-300">
              Are you sure you want to discard this workout? All recorded sets will be lost.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition"
              >
                Discard Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
