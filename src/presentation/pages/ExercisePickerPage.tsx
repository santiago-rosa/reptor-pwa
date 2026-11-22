import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Exercise } from '@/domain/entities/Exercise'
import { useExerciseStore } from '@/presentation/stores/exerciseStore'
import { useRoutineDraftStore } from '@/presentation/stores/routineDraftStore'
import { useWorkoutSessionStore } from '@/presentation/stores/workoutSessionStore'
import { ExerciseListItem } from '@/presentation/components/ExerciseListItem'

export function ExercisePickerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'session' ? 'session' : 'routine'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { exercises, loading, error, fetchExercises } = useExerciseStore()

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  // Subscribed states from stores
  const routineDraftExercises = useRoutineDraftStore((s) => s.exercises)
  const addRoutineExercises = useRoutineDraftStore((s) => s.addExercises)

  const activeSession = useWorkoutSessionStore((s) => s.activeSession)
  const addSessionExercise = useWorkoutSessionStore((s) => s.addExercise)

  const alreadyAddedIds = useMemo(() => {
    if (mode === 'session') {
      return new Set(activeSession?.exercises.map((e) => e.exerciseId) ?? [])
    }
    return new Set(routineDraftExercises.map((e) => e.exerciseId))
  }, [mode, activeSession, routineDraftExercises])

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return exercises
    return exercises.filter((ex) => ex.name.toLowerCase().includes(query))
  }, [exercises, searchQuery])

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {}
    for (const ex of filteredExercises) {
      const rawGroup =
        (ex.muscleGroups && ex.muscleGroups.length > 0 && ex.muscleGroups[0])
          ? ex.muscleGroups[0]
          : 'other'
      const formattedGroup =
        rawGroup.charAt(0).toUpperCase() + rawGroup.slice(1).replace(/_/g, ' ')
      if (!groups[formattedGroup]) {
        groups[formattedGroup] = []
      }
      groups[formattedGroup].push(ex)
    }
    return groups
  }, [filteredExercises])

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAddSelected = () => {
    const selectedList = exercises.filter((ex) => selectedIds.has(ex.id))
    if (selectedList.length === 0) return

    if (mode === 'session') {
      selectedList.forEach((ex) => {
        addSessionExercise({ id: ex.id, name: ex.name })
      })
    } else {
      addRoutineExercises(
        selectedList.map((ex) => ({ id: ex.id, name: ex.name }))
      )
    }
    navigate(-1)
  }

  const selectedCount = selectedIds.size
  const buttonText = `Add ${selectedCount} exercise${selectedCount === 1 ? '' : 's'}`

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-1 -ml-1 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Select Exercises</h1>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-28">
        {loading && exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading exercises...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No exercises found.</p>
            {searchQuery && (
              <p className="text-xs text-gray-600 mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExercises).map(([group, groupList]) => (
              <section key={group} className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">
                  {group}
                </h2>
                <div className="space-y-2">
                  {groupList.map((exercise) => {
                    const isAlreadyAdded = alreadyAddedIds.has(exercise.id)
                    const isSelected = selectedIds.has(exercise.id)

                    return (
                      <ExerciseListItem
                        key={exercise.id}
                        exercise={exercise}
                        isSelected={isSelected}
                        isAlreadyAdded={isAlreadyAdded}
                        onToggle={() => handleToggle(exercise.id)}
                      />
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur border-t border-gray-800 z-20">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleAddSelected}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-center transition-all shadow-lg ${
              selectedCount === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-[0.99]'
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
