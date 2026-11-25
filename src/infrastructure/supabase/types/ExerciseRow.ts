export interface ExerciseRow {
  id: string
  name: string
  name_en?: string | null
  name_es?: string | null
  muscle_groups: string[] | null
  equipment: string
  category?: string | null
  user_id?: string | null
  created_at?: string | null
}
