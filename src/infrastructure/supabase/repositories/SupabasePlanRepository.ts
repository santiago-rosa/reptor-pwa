import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plan } from '@/domain/entities/Plan'
import type { IPlanRepository, CreatePlanInput, UpdatePlanInput } from '@/domain/repositories/IPlanRepository'
import type { PlanRow } from '../types/PlanRow'

export class SupabasePlanRepository implements IPlanRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async findAll(): Promise<Plan[]> {
    const { data, error } = await this.client
      .from('plans')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`)
    }

    return ((data ?? []) as PlanRow[]).map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Plan | null> {
    const { data, error } = await this.client
      .from('plans')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch plan: ${error.message}`)
    }

    if (!data) return null
    return this.toDomain(data as PlanRow)
  }

  async save(input: CreatePlanInput): Promise<Plan> {
    const { data, error } = await this.client
      .from('plans')
      .insert({
        name: input.name,
        user_id: input.userId ?? null,
      })
      .select('*')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create plan: ${error?.message ?? 'Unknown error'}`)
    }

    return this.toDomain(data as PlanRow)
  }

  async update(input: UpdatePlanInput): Promise<Plan> {
    const { data, error } = await this.client
      .from('plans')
      .update({
        name: input.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select('*')
      .single()

    if (error || !data) {
      throw new Error(`Failed to update plan: ${error?.message ?? 'Unknown error'}`)
    }

    return this.toDomain(data as PlanRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('plans')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete plan: ${error.message}`)
    }
  }

  private toDomain(row: PlanRow): Plan {
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id ?? null,
      createdAt: row.created_at ?? undefined,
      updatedAt: row.updated_at ?? undefined,
    }
  }
}
