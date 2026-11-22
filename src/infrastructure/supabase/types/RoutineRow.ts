export interface RoutineExerciseRow {
  id: string
  routine_id: string
  exercise_id: string
  order_index: number
  sets: number
  reps_min: number
  reps_max?: number | null
  exercises?: { name: string } | null
}

export interface RoutineRow {
  id: string
  name: string
  plan_id?: string | null
  user_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface JoinedRoutineRow extends RoutineRow {
  routine_exercises?: RoutineExerciseRow[] | null
}
