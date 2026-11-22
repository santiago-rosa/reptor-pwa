import type { Plan } from '../entities/Plan'

export interface CreatePlanInput {
  name: string
  userId?: string | null
}

export interface UpdatePlanInput {
  id: string
  name: string
}

export interface IPlanRepository {
  findAll(): Promise<Plan[]>
  findById?(id: string): Promise<Plan | null>
  save(input: CreatePlanInput): Promise<Plan>
  update(input: UpdatePlanInput): Promise<Plan>
  delete(id: string): Promise<void>
}
