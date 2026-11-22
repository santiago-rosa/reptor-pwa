import type { SupabaseClient } from '@supabase/supabase-js'
import type { Exercise, MuscleGroup, Equipment, ExerciseCategory } from '@/domain/entities/Exercise'
import type { IExerciseRepository } from '@/domain/repositories/IExerciseRepository'
import type { ExerciseRow } from '../types/ExerciseRow'

export class SupabaseExerciseRepository implements IExerciseRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async findAll(): Promise<Exercise[]> {
    const { data, error } = await this.client
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch exercises: ${error.message}`)
    }

    return ((data ?? []) as ExerciseRow[]).map((row) => this.toDomain(row))
  }

  private toDomain(row: ExerciseRow): Exercise {
    return {
      id: row.id,
      name: row.name,
      muscleGroups: (row.muscle_groups ?? []) as MuscleGroup[],
      equipment: row.equipment as Equipment,
      category: (row.category ?? undefined) as ExerciseCategory | undefined,
      userId: row.user_id ?? null,
    }
  }
}
