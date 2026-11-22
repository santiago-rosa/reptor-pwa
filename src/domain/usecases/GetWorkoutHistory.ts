import type { WorkoutSession } from '../entities/WorkoutSession'
import type { IWorkoutSessionRepository } from '../repositories/IWorkoutSessionRepository'

export class GetWorkoutHistory {
  private readonly workoutSessionRepository: IWorkoutSessionRepository

  constructor(workoutSessionRepository: IWorkoutSessionRepository) {
    this.workoutSessionRepository = workoutSessionRepository
  }

  async execute(): Promise<WorkoutSession[]> {
    return this.workoutSessionRepository.findAll()
  }
}
