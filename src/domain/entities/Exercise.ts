export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'core'
  | 'cardio'
  | 'full_body'
  | (string & {})

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'smith_machine'
  | 'band'
  | 'other'
  | (string & {})

export type ExerciseCategory =
  | 'strength'
  | 'hypertrophy'
  | 'endurance'
  | 'cardio'
  | 'olympic'
  | 'warmup'
  | 'other'
  | (string & {})

export interface Exercise {
  id: string
  name: string
  nameEn?: string
  nameEs?: string
  muscleGroups: MuscleGroup[]
  equipment: Equipment
  category?: ExerciseCategory
  userId?: string | null
}
