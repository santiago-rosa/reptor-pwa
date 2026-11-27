import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { useWorkoutSessionStore } from '../stores/workoutSessionStore'

export function AppLayout() {
  const navigate = useNavigate()
  const activeSession = useWorkoutSessionStore((s) => s.activeSession)

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white pb-20">
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6">
        {activeSession && (
          <div
            data-testid="resume-workout-banner"
            className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                Workout in progress
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {activeSession.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Resume
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
