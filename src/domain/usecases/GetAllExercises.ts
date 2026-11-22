import type { Exercise } from '../entities/Exercise'
import type { IExerciseRepository } from '../repositories/IExerciseRepository'

export class GetAllExercises {
  private readonly exerciseRepository: IExerciseRepository

  constructor(exerciseRepository: IExerciseRepository) {
    this.exerciseRepository = exerciseRepository
  }

  async execute(): Promise<Exercise[]> {
    return this.exerciseRepository.findAll()
  }
}
