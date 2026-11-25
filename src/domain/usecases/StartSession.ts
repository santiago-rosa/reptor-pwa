import type { Routine } from '../entities/Routine'
import type { WorkoutSession, SessionExercise, SessionSet } from '../entities/WorkoutSession'

export interface StartSessionInput {
  title?: string
  routine?: Routine | null
  userId?: string | null
}

export class StartSession {
  execute(input?: StartSessionInput): WorkoutSession {
    const routine = input?.routine
    const title = input?.title || routine?.name || 'Quick Workout'
    const sessionId = crypto.randomUUID()

    const exercises: SessionExercise[] = (routine?.exercises ?? []).map((re, exIndex) => {
      const sessionExerciseId = crypto.randomUUID()
      const sets: SessionSet[] = Array.from({ length: Math.max(1, re.sets) }, (_, setIndex) => ({
        id: crypto.randomUUID(),
        sessionExerciseId,
        setNumber: setIndex + 1,
        weightKg: 0,
        reps: re.repsMin || 0,
        isCompleted: false,
      }))

      return {
        id: sessionExerciseId,
        sessionId,
        exerciseId: re.exerciseId,
        exerciseName: re.exerciseName,
        orderIndex: exIndex,
        sets,
        repTargetMin: re.repsMin,
        repTargetMax: re.repsMax ?? null,
      }
    })

    return {
      id: sessionId,
      title,
      routineId: routine?.id ?? null,
      userId: input?.userId ?? null,
      startedAt: new Date(),
      finishedAt: null,
      exercises,
    }
  }
}
