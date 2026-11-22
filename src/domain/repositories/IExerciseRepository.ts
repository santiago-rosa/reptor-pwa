import type { Exercise } from '../entities/Exercise'

export interface IExerciseRepository {
  findAll(): Promise<Exercise[]>
}
