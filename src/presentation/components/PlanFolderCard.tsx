import { useState } from 'react'
import type { Plan } from '@/domain/entities/Plan'
import type { Routine } from '@/domain/entities/Routine'
import { RoutineCard } from './RoutineCard'

interface PlanFolderCardProps {
  plan: Plan
  routines: Routine[]
  onStartRoutine?: (routine: Routine) => void
  onMenuClick?: (routine: Routine) => void
  onRenamePlan?: (plan: Plan) => void
  onDeletePlan?: (plan: Plan) => void
}

export function PlanFolderCard({
  plan,
  routines,
  onStartRoutine,
  onMenuClick,
  onRenamePlan,
  onDeletePlan,
}: PlanFolderCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40">
      {/* Folder Header */}
      <div className="flex w-full items-center justify-between p-4 transition hover:bg-gray-800/30">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex flex-1 items-center gap-3 text-left focus:outline-none"
        >
          <div className="rounded-lg bg-blue-950/60 p-2 text-blue-400 border border-blue-900/50 shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white truncate">{plan.name}</h3>
            <p className="text-xs text-gray-400">
              {routines.length} {routines.length === 1 ? 'routine' : 'routines'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {(onRenamePlan || onDeletePlan) && (
            <button
              type="button"
              aria-label="Plan menu"
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle folder"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-gray-400 p-1 hover:text-white transition"
          >
            <svg
              className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Plan Options Inline Menu */}
      {showMenu && (
        <div
          className="border-t border-gray-800 bg-gray-900/90 px-4 py-2 flex items-center justify-end gap-3 text-xs"
        >
          {onRenamePlan && (
            <button
              type="button"
              onClick={() => {
                setShowMenu(false)
                onRenamePlan(plan)
              }}
              className="font-medium text-gray-300 hover:text-white transition"
            >
              Rename
            </button>
          )}
          {onDeletePlan && (
            <button
              type="button"
              onClick={() => {
                setShowMenu(false)
                onDeletePlan(plan)
              }}
              className="font-medium text-red-400 hover:text-red-300 transition"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Collapsible Content */}
      {isOpen && (
        <div className="space-y-3 border-t border-gray-800/70 p-4 pt-3 bg-gray-950/30">
          {routines.length === 0 ? (
            <p className="py-2 text-center text-xs text-gray-500">
              No routines in this folder yet
            </p>
          ) : (
            routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onStart={onStartRoutine}
                onMenuClick={onMenuClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
