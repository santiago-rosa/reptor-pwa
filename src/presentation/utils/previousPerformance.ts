import type { SessionSet, WorkoutSession } from '@/domain/entities/WorkoutSession'

/**
 * Finds the most recent completed session containing `exerciseId`
 * and returns a map of `setNumber -> SessionSet` for completed sets.
 */
export function getPreviousExerciseSets(
  sessions: WorkoutSession[],
  exerciseId: string,
  excludeSessionId?: string
): Map<number, SessionSet> {
  const result = new Map<number, SessionSet>()
  if (!sessions || sessions.length === 0) return result

  // Ensure newest-first order by startedAt
  const sorted = [...sessions].sort((a, b) => {
    const timeA = new Date(a.startedAt).getTime()
    const timeB = new Date(b.startedAt).getTime()
    return timeB - timeA
  })

  for (const session of sorted) {
    if (excludeSessionId && session.id === excludeSessionId) continue
    if (!session.finishedAt) continue

    const matchingExercise = session.exercises.find((ex) => ex.exerciseId === exerciseId)
    if (!matchingExercise) continue

    const completedSets = matchingExercise.sets.filter((s) => s.isCompleted)
    if (completedSets.length === 0) continue

    for (const set of completedSets) {
      result.set(set.setNumber, set)
    }
    return result
  }

  return result
}

/**
 * Formats a previous SessionSet into a concise muted hint string,
 * e.g. "80kg × 6 @ RPE 7" or "80kg × 6".
 */
export function formatPreviousSetHint(prevSet?: SessionSet): string | null {
  if (!prevSet) return null
  const base = `${prevSet.weightKg}kg × ${prevSet.reps}`
  if (prevSet.rpe != null) {
    return `${base} @ RPE ${prevSet.rpe}`
  }
  return base
}
