import type { IRoutineRepository } from '../repositories/IRoutineRepository'

export class AssignRoutineToPlan {
  private readonly routineRepository: IRoutineRepository

  constructor(routineRepository: IRoutineRepository) {
    this.routineRepository = routineRepository
  }

  async execute(routineId: string, planId: string | null): Promise<void> {
    if (!routineId) {
      throw new Error('Routine ID is required')
    }
    return this.routineRepository.assignToPlan(routineId, planId)
  }
}
