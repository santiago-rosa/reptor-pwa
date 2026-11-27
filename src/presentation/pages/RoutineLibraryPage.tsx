import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoutineStore } from '../stores/routineStore'
import { usePlanStore } from '../stores/planStore'
import { useExerciseStore } from '../stores/exerciseStore'
import { useWorkoutSessionStore } from '../stores/workoutSessionStore'
import { RoutineCard } from '../components/RoutineCard'
import { PlanFolderCard } from '../components/PlanFolderCard'
import { RoutineContextMenu } from '../components/RoutineContextMenu'
import { CreatePlanModal } from '../components/CreatePlanModal'
import { AssignPlanModal } from '../components/AssignPlanModal'
import { ImportRoutineModal } from '../components/ImportRoutineModal'
import { EmptyState } from '../components/EmptyState'
import type { Routine } from '@/domain/entities/Routine'
import type { Plan } from '@/domain/entities/Plan'
import type { CreateRoutineInput } from '@/domain/repositories/IRoutineRepository'

export function RoutineLibraryPage() {
  const navigate = useNavigate()
  const [selectedRoutineForMenu, setSelectedRoutineForMenu] = useState<Routine | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [routineForAssign, setRoutineForAssign] = useState<Routine | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const routines = useRoutineStore((s) => s.routines)
  const routinesLoading = useRoutineStore((s) => s.loading)
  const routinesError = useRoutineStore((s) => s.error)
  const fetchRoutines = useRoutineStore((s) => s.fetchRoutines)
  const createRoutine = useRoutineStore((s) => s.createRoutine)
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine)
  const removeFromPlan = useRoutineStore((s) => s.removeFromPlan)
  const assignRoutineToPlan = useRoutineStore((s) => s.assignRoutineToPlan)

  const plans = usePlanStore((s) => s.plans)
  const plansLoading = usePlanStore((s) => s.loading)
  const fetchPlans = usePlanStore((s) => s.fetchPlans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const renamePlan = usePlanStore((s) => s.renamePlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)

  const exercises = useExerciseStore((s) => s.exercises)
  const exercisesLoading = useExerciseStore((s) => s.loading)
  const fetchExercises = useExerciseStore((s) => s.fetchExercises)

  const startFromRoutine = useWorkoutSessionStore((s) => s.startFromRoutine)
  const startEmpty = useWorkoutSessionStore((s) => s.startEmpty)

  useEffect(() => {
    fetchRoutines()
    fetchPlans()
  }, [fetchRoutines, fetchPlans])

  const handleStartRoutine = (routine: Routine) => {
    startFromRoutine(routine)
    navigate('/session')
  }

  const handleStartQuickWorkout = () => {
    startEmpty()
    navigate('/session')
  }

  const handleEditRoutine = (routine: Routine) => {
    setSelectedRoutineForMenu(null)
    navigate(`/routines/${routine.id}/edit`)
  }

  const handleDeleteRoutine = async (routine: Routine) => {
    await deleteRoutine(routine.id)
    setSelectedRoutineForMenu(null)
  }

  const handleRemoveFromPlan = async (routine: Routine) => {
    await removeFromPlan(routine.id)
    setSelectedRoutineForMenu(null)
  }

  const handlePlanSubmit = async (name: string) => {
    if (planToEdit) {
      await renamePlan(planToEdit.id, name)
    } else {
      await createPlan(name)
    }
  }

  const handleDeletePlanConfirm = async () => {
    if (!planToDelete) return
    const id = planToDelete.id
    setPlanToDelete(null)
    await deletePlan(id)
  }

  const loading = (routinesLoading && routines.length === 0) || (plansLoading && plans.length === 0)
  const looseRoutines = routines.filter((r) => !r.planId)
  const hasNoItems = plans.length === 0 && routines.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Routines</h1>
          <p className="text-sm text-gray-400">Choose or create a workout routine</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchExercises()
              setIsImportModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
          <button
            type="button"
            onClick={() => {
              setPlanToEdit(null)
              setIsPlanModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            + Plan
          </button>
          <button
            type="button"
            onClick={() => navigate('/routines/new')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>
      </header>

      {/* Quick Start Free Workout Button */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3.5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Quick Start</h4>
          <p className="text-xs text-gray-400">Start an empty session without a routine</p>
        </div>
        <button
          type="button"
          onClick={handleStartQuickWorkout}
          className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-gray-700 hover:text-white transition"
        >
          Start Empty
        </button>
      </div>

      {/* Error state */}
      {routinesError && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300 flex items-center justify-between">
          <span>{routinesError}</span>
          <button
            type="button"
            onClick={() => {
              fetchRoutines(true)
              fetchPlans(true)
            }}
            className="text-xs underline hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-xl bg-gray-900/80 border border-gray-800" />
          <div className="h-24 animate-pulse rounded-xl bg-gray-900/80 border border-gray-800" />
        </div>
      ) : hasNoItems ? (
        <EmptyState
          title="No routines yet"
          description="Create your first routine to start tracking your sets and reps."
          action={{
            label: "Create Routine",
            onClick: () => navigate('/routines/new'),
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Plans Section (rendered first) */}
          {plans.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Plans
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setPlanToEdit(null)
                    setIsPlanModalOpen(true)
                  }}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  + New Plan
                </button>
              </div>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <PlanFolderCard
                    key={plan.id}
                    plan={plan}
                    routines={routines.filter((r) => r.planId === plan.id)}
                    onStartRoutine={handleStartRoutine}
                    onMenuClick={(routine) => setSelectedRoutineForMenu(routine)}
                    onRenamePlan={(p) => {
                      setPlanToEdit(p)
                      setIsPlanModalOpen(true)
                    }}
                    onDeletePlan={(p) => setPlanToDelete(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Loose Routines Section (rendered second) */}
          {looseRoutines.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {plans.length > 0 ? 'Individual Routines' : 'My Routines'}
              </h2>
              <div className="space-y-3">
                {looseRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onStart={handleStartRoutine}
                    onMenuClick={(routine) => setSelectedRoutineForMenu(routine)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Routine Context Menu Modal */}
      <RoutineContextMenu
        routine={selectedRoutineForMenu}
        isOpen={selectedRoutineForMenu !== null}
        onClose={() => setSelectedRoutineForMenu(null)}
        onEdit={handleEditRoutine}
        onDelete={handleDeleteRoutine}
        onMoveToPlan={(routine) => {
          setSelectedRoutineForMenu(null)
          setRoutineForAssign(routine)
        }}
        onRemoveFromPlan={handleRemoveFromPlan}
      />

      {/* Create / Rename Plan Modal */}
      <CreatePlanModal
        isOpen={isPlanModalOpen}
        planToEdit={planToEdit}
        onClose={() => {
          setIsPlanModalOpen(false)
          setPlanToEdit(null)
        }}
        onSubmit={handlePlanSubmit}
      />

      {/* Assign Routine to Plan Modal */}
      <AssignPlanModal
        isOpen={routineForAssign !== null}
        routine={routineForAssign}
        plans={plans}
        onClose={() => setRoutineForAssign(null)}
        onAssign={async (routineId, planId) => {
          await assignRoutineToPlan(routineId, planId)
        }}
        onRemoveFromPlan={async (routineId) => {
          await removeFromPlan(routineId)
        }}
        onCreateNewPlan={() => {
          setPlanToEdit(null)
          setIsPlanModalOpen(true)
        }}
      />

      {/* Import Routine JSON Modal */}
      <ImportRoutineModal
        isOpen={isImportModalOpen}
        exercises={exercises}
        exercisesLoading={exercisesLoading}
        onClose={() => setIsImportModalOpen(false)}
        onSaveRoutines={async (inputs: CreateRoutineInput[]) => {
          for (const input of inputs) {
            await createRoutine(input)
          }
        }}
        onSaveAndStartRoutine={async (input: CreateRoutineInput) => {
          const created = await createRoutine(input)
          startFromRoutine(created)
          navigate('/session')
        }}
      />

      {/* Delete Plan Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-xl space-y-3">
            <h3 className="text-base font-semibold text-white">Delete Plan Folder</h3>
            <p className="text-xs text-gray-300">
              Are you sure you want to delete &quot;{planToDelete.name}&quot;? Routines inside will become individual routines.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 rounded-xl bg-gray-800 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlanConfirm}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
