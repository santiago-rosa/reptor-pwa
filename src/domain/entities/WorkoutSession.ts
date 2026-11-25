export interface SessionSet {
  id?: string
  sessionExerciseId?: string
  setNumber: number
  weightKg: number
  reps: number
  isCompleted: boolean
}

export interface SessionExercise {
  id?: string
  sessionId?: string
  exerciseId: string
  exerciseName?: string
  orderIndex: number
  sets: SessionSet[]
  /** Rep target from the routine template, if started from one */
  repTargetMin?: number | null
  repTargetMax?: number | null
}

export interface WorkoutSession {
  id: string
  title: string
  routineId?: string | null
  userId?: string | null
  startedAt: string | Date
  finishedAt?: string | Date | null
  exercises: SessionExercise[]
  createdAt?: string | Date
  updatedAt?: string | Date
}
