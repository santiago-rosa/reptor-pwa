import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssignPlanModal } from '../AssignPlanModal'
import type { Routine } from '@/domain/entities/Routine'
import type { Plan } from '@/domain/entities/Plan'

describe('AssignPlanModal', () => {
  const mockPlans: Plan[] = [
    { id: 'p-1', name: 'Upper / Lower Split' },
    { id: 'p-2', name: 'Push Pull Legs' },
  ]

  const mockRoutineInPlan: Routine = {
    id: 'r-1',
    name: 'Upper Power',
    planId: 'p-1',
    exercises: [],
  }

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AssignPlanModal
        isOpen={false}
        routine={mockRoutineInPlan}
        plans={mockPlans}
        onClose={vi.fn()}
        onAssign={vi.fn()}
        onRemoveFromPlan={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders plans and highlights current plan', () => {
    render(
      <AssignPlanModal
        isOpen={true}
        routine={mockRoutineInPlan}
        plans={mockPlans}
        onClose={vi.fn()}
        onAssign={vi.fn()}
        onRemoveFromPlan={vi.fn()}
      />
    )

    expect(screen.getByText('Move to Plan')).toBeInTheDocument()
    expect(screen.getByText('Upper / Lower Split')).toBeInTheDocument()
    expect(screen.getByText('Push Pull Legs')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('assigns routine to a different plan when selected', async () => {
    const mockAssign = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    render(
      <AssignPlanModal
        isOpen={true}
        routine={mockRoutineInPlan}
        plans={mockPlans}
        onClose={mockClose}
        onAssign={mockAssign}
        onRemoveFromPlan={vi.fn()}
      />
    )

    const p2Button = screen.getByText('Push Pull Legs').closest('button')!
    fireEvent.click(p2Button)

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith('r-1', 'p-2')
      expect(mockClose).toHaveBeenCalled()
    })
  })

  it('moves routine to individual status when No Plan is selected', async () => {
    const mockRemove = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    render(
      <AssignPlanModal
        isOpen={true}
        routine={mockRoutineInPlan}
        plans={mockPlans}
        onClose={mockClose}
        onAssign={vi.fn()}
        onRemoveFromPlan={mockRemove}
      />
    )

    const noPlanBtn = screen.getByText(/no plan \(individual routine\)/i).closest('button')!
    fireEvent.click(noPlanBtn)

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith('r-1')
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
