export interface SessionSetRow {
  id: string
  session_exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
  is_completed: boolean
  created_at?: string | null
}

export interface SessionExerciseRow {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  created_at?: string | null
  exercises?: { name: string } | null
  session_sets?: SessionSetRow[] | null
}

export interface WorkoutSessionRow {
  id: string
  title: string
  routine_id?: string | null
  user_id?: string | null
  started_at: string
  finished_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface JoinedWorkoutSessionRow extends WorkoutSessionRow {
  session_exercises?: SessionExerciseRow[] | null
}
