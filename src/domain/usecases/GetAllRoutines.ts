import type { Routine } from '../entities/Routine'
import type { IRoutineRepository } from '../repositories/IRoutineRepository'

export class GetAllRoutines {
  private readonly routineRepository: IRoutineRepository

  constructor(routineRepository: IRoutineRepository) {
    this.routineRepository = routineRepository
  }

  async execute(): Promise<Routine[]> {
    return this.routineRepository.findAll()
  }
}
