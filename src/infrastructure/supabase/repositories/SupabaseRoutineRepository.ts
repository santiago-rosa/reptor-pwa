import type { SupabaseClient } from '@supabase/supabase-js'
import type { Routine } from '@/domain/entities/Routine'
import type { IRoutineRepository, CreateRoutineInput, UpdateRoutineInput } from '@/domain/repositories/IRoutineRepository'
import type { JoinedRoutineRow, RoutineRow } from '../types/RoutineRow'

export class SupabaseRoutineRepository implements IRoutineRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async findAll(): Promise<Routine[]> {
    const { data, error } = await this.client
      .from('routines')
      .select('*, routine_exercises(*, exercises(name))')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch routines: ${error.message}`)
    }

    return ((data ?? []) as JoinedRoutineRow[]).map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Routine | null> {
    const { data, error } = await this.client
      .from('routines')
      .select('*, routine_exercises(*, exercises(name))')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch routine: ${error.message}`)
    }

    if (!data) return null
    return this.toDomain(data as JoinedRoutineRow)
  }

  async save(input: CreateRoutineInput): Promise<Routine> {
    // 1. Insert routine header
    const { data: routineData, error: routineError } = await this.client
      .from('routines')
      .insert({
        name: input.name,
        plan_id: input.planId ?? null,
        user_id: input.userId ?? null,
      })
      .select('*')
      .single()

    if (routineError || !routineData) {
      throw new Error(`Failed to create routine: ${routineError?.message ?? 'Unknown error'}`)
    }

    const createdRoutine = routineData as RoutineRow

    // 2. Insert exercises if provided
    if (input.exercises && input.exercises.length > 0) {
      const exerciseInserts = input.exercises.map((ex) => ({
        routine_id: createdRoutine.id,
        exercise_id: ex.exerciseId,
        order_index: ex.orderIndex,
        sets: ex.sets,
        reps_min: ex.repsMin,
        reps_max: ex.repsMax ?? null,
      }))

      const { error: exercisesError } = await this.client
        .from('routine_exercises')
        .insert(exerciseInserts)

      if (exercisesError) {
        // Rollback: delete created routine header
        await this.client.from('routines').delete().eq('id', createdRoutine.id)
        throw new Error(`Failed to create routine exercises: ${exercisesError.message}`)
      }
    }

    // 3. Return full joined routine
    const fullRoutine = await this.findById(createdRoutine.id)
    if (!fullRoutine) {
      throw new Error('Failed to retrieve newly created routine')
    }

    return fullRoutine
  }

  async update(input: UpdateRoutineInput): Promise<Routine> {
    // 1. Update routine header if needed
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (input.name !== undefined) updatePayload.name = input.name
    if (input.planId !== undefined) updatePayload.plan_id = input.planId

    const { error: routineError } = await this.client
      .from('routines')
      .update(updatePayload)
      .eq('id', input.id)

    if (routineError) {
      throw new Error(`Failed to update routine: ${routineError.message}`)
    }

    // 2. Replace exercises if new list provided
    if (input.exercises !== undefined) {
      // Remove old exercises
      const { error: deleteError } = await this.client
        .from('routine_exercises')
        .delete()
        .eq('routine_id', input.id)

      if (deleteError) {
        throw new Error(`Failed to clear old routine exercises: ${deleteError.message}`)
      }

      // Insert new exercises
      if (input.exercises.length > 0) {
        const exerciseInserts = input.exercises.map((ex) => ({
          routine_id: input.id,
          exercise_id: ex.exerciseId,
          order_index: ex.orderIndex,
          sets: ex.sets,
          reps_min: ex.repsMin,
          reps_max: ex.repsMax ?? null,
        }))

        const { error: insertError } = await this.client
          .from('routine_exercises')
          .insert(exerciseInserts)

        if (insertError) {
          throw new Error(`Failed to update routine exercises: ${insertError.message}`)
        }
      }
    }

    const updated = await this.findById(input.id)
    if (!updated) {
      throw new Error(`Routine with id ${input.id} not found after update`)
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('routines')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete routine: ${error.message}`)
    }
  }

  async assignToPlan(routineId: string, planId: string | null): Promise<void> {
    const { error } = await this.client
      .from('routines')
      .update({ plan_id: planId, updated_at: new Date().toISOString() })
      .eq('id', routineId)

    if (error) {
      throw new Error(`Failed to assign routine to plan: ${error.message}`)
    }
  }

  private toDomain(row: JoinedRoutineRow): Routine {
    const exercises = (row.routine_exercises ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((re) => ({
        id: re.id,
        routineId: re.routine_id,
        exerciseId: re.exercise_id,
        exerciseName: re.exercises?.name ?? undefined,
        orderIndex: re.order_index,
        sets: re.sets,
        repsMin: re.reps_min,
        repsMax: re.reps_max ?? null,
      }))

    return {
      id: row.id,
      name: row.name,
      planId: row.plan_id ?? null,
      userId: row.user_id ?? null,
      exercises,
      createdAt: row.created_at ?? undefined,
      updatedAt: row.updated_at ?? undefined,
    }
  }
}
