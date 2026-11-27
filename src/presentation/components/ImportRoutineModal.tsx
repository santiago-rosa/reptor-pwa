import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Exercise } from '@/domain/entities/Exercise'
import type { CreateRoutineInput } from '@/domain/repositories/IRoutineRepository'
import {
  ParseWorkoutImportJson,
  type ParsedImportRoutine,
} from '@/domain/usecases/ParseWorkoutImportJson'

interface ImportRoutineModalProps {
  isOpen: boolean
  exercises: Exercise[]
  exercisesLoading?: boolean
  onClose: () => void
  onSaveRoutines: (inputs: CreateRoutineInput[]) => Promise<void>
  onSaveAndStartRoutine?: (input: CreateRoutineInput) => Promise<void>
}

const parser = new ParseWorkoutImportJson()

function formatReps(repsMin: number, repsMax: number | null): string {
  return repsMax !== null ? `${repsMin}–${repsMax} reps` : `${repsMin} reps`
}

function toCreateRoutineInput(routine: ParsedImportRoutine): CreateRoutineInput {
  return {
    name: routine.name,
    exercises: routine.exercises.map((ex, index) => ({
      exerciseId: ex.exerciseId,
      orderIndex: index,
      sets: ex.sets,
      repsMin: ex.repsMin,
      repsMax: ex.repsMax,
    })),
  }
}

export function ImportRoutineModal({
  isOpen,
  exercises,
  exercisesLoading = false,
  onClose,
  onSaveRoutines,
  onSaveAndStartRoutine,
}: ImportRoutineModalProps) {
  const [rawJson, setRawJson] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const textareaId = useId()

  useEffect(() => {
    if (isOpen) {
      setRawJson('')
      setFileName(null)
      setIsSubmitting(false)
      setSubmitError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  const parseResult = useMemo(() => {
    if (!rawJson.trim()) {
      return { routines: [], errors: [], warnings: [] }
    }
    return parser.execute(rawJson, exercises)
  }, [rawJson, exercises])

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setSubmitError(null)
    try {
      const text = await file.text()
      setRawJson(text)
    } catch {
      setSubmitError('Failed to read the selected file.')
    }
    e.target.value = ''
  }

  const canImport =
    !exercisesLoading &&
    !isSubmitting &&
    parseResult.routines.length > 0 &&
    parseResult.errors.length === 0

  const handleSave = async () => {
    if (!canImport) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSaveRoutines(parseResult.routines.map(toCreateRoutineInput))
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to import routine')
      setIsSubmitting(false)
    }
  }

  const handleSaveAndStart = async () => {
    if (!canImport || !onSaveAndStartRoutine || parseResult.routines.length !== 1) return
    const first = parseResult.routines[0]
    if (!first) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSaveAndStartRoutine(toCreateRoutineInput(first))
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to start routine')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 p-5 pb-3">
          <div>
            <h3 id={titleId} className="text-base font-semibold text-white">
              Import Workout JSON
            </h3>
            <p className="text-xs text-gray-400">
              Paste AI-generated JSON or upload a .json file
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {exercisesLoading && (
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/30 p-3 text-xs text-blue-300">
              Loading exercise catalog for validation...
            </div>
          )}

          {/* Upload + Paste */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={textareaId} className="text-xs font-medium text-gray-300">
                Routine JSON
              </label>
              <div className="flex items-center gap-2">
                {fileName && (
                  <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
                    {fileName}
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload JSON file"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-gray-700 transition"
                >
                  Upload .json
                </button>
              </div>
            </div>

            <textarea
              id={textareaId}
              rows={6}
              value={rawJson}
              onChange={(e) => {
                setRawJson(e.target.value)
                setSubmitError(null)
              }}
              placeholder='{"name":"Push Day","exercises":[{"exerciseId":"...","sets":3,"repsMin":8,"repsMax":12}]}'
              className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
              {submitError}
            </div>
          )}

          {/* Validation Errors */}
          {parseResult.errors.length > 0 && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-red-300">
                Validation Errors ({parseResult.errors.length})
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-red-200/90">
                {parseResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Fuzzy Match Warnings */}
          {parseResult.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-amber-300">
                Fallback Matches ({parseResult.warnings.length})
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-amber-200/90">
                {parseResult.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parseResult.routines.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Preview ({parseResult.routines.length}{' '}
                {parseResult.routines.length === 1 ? 'Routine' : 'Routines'})
              </p>
              {parseResult.routines.map((routine, rIdx) => (
                <div
                  key={rIdx}
                  className="rounded-xl border border-gray-800 bg-gray-950/70 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{routine.name}</h4>
                    <span className="text-[11px] text-gray-400">
                      {routine.exercises.length}{' '}
                      {routine.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-800/80">
                    {routine.exercises.map((ex, eIdx) => (
                      <li
                        key={`${ex.exerciseId}-${eIdx}`}
                        className="py-1.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex items-center gap-1.5">
                          <span className="text-gray-500">{eIdx + 1}.</span>
                          <span className="truncate text-gray-200 font-medium">
                            {ex.exerciseName}
                          </span>
                          {ex.matchKind === 'fuzzy_name' && (
                            <span className="shrink-0 rounded bg-amber-950 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-800/60">
                              Fuzzy
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-gray-400 tabular-nums">
                          {ex.sets} × {formatReps(ex.repsMin, ex.repsMax)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-gray-800 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Cancel
          </button>
          <div className="flex-1 flex items-center justify-end gap-2">
            {onSaveAndStartRoutine && parseResult.routines.length === 1 && (
              <button
                type="button"
                onClick={handleSaveAndStart}
                disabled={!canImport}
                className="rounded-xl border border-blue-500/40 bg-blue-950/50 px-3.5 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Saving...' : 'Save & Start'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canImport}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isSubmitting
                ? 'Importing...'
                : parseResult.routines.length > 1
                  ? `Save ${parseResult.routines.length} Routines`
                  : 'Save Routine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
