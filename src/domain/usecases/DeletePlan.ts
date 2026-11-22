import type { IPlanRepository } from '../repositories/IPlanRepository'

export class DeletePlan {
  private readonly planRepository: IPlanRepository

  constructor(planRepository: IPlanRepository) {
    this.planRepository = planRepository
  }

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Plan ID is required')
    }
    return this.planRepository.delete(id)
  }
}
