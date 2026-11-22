export interface RoutineExercise {
  id?: string
  routineId?: string
  exerciseId: string
  exerciseName?: string
  orderIndex: number
  sets: number
  repsMin: number
  repsMax?: number | null
}

export interface Routine {
  id: string
  name: string
  planId?: string | null
  userId?: string | null
  exercises: RoutineExercise[]
  createdAt?: string | Date
  updatedAt?: string | Date
}
