import type { IRoutineRepository } from '../repositories/IRoutineRepository'

export class DeleteRoutine {
  private readonly routineRepository: IRoutineRepository

  constructor(routineRepository: IRoutineRepository) {
    this.routineRepository = routineRepository
  }

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Routine ID is required')
    }
    return this.routineRepository.delete(id)
  }
}
