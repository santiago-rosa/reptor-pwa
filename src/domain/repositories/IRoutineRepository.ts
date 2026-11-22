import type { Routine } from '../entities/Routine'

export interface CreateRoutineExerciseInput {
  exerciseId: string
  orderIndex: number
  sets: number
  repsMin: number
  repsMax?: number | null
}

export interface CreateRoutineInput {
  name: string
  planId?: string | null
  userId?: string | null
  exercises: CreateRoutineExerciseInput[]
}

export interface UpdateRoutineInput {
  id: string
  name?: string
  planId?: string | null
  exercises?: CreateRoutineExerciseInput[]
}

export interface IRoutineRepository {
  findAll(): Promise<Routine[]>
  findById(id: string): Promise<Routine | null>
  save(input: CreateRoutineInput): Promise<Routine>
  update(input: UpdateRoutineInput): Promise<Routine>
  delete(id: string): Promise<void>
  assignToPlan(routineId: string, planId: string | null): Promise<void>
}
