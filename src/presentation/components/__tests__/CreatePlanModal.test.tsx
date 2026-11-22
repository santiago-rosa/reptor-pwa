import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePlanModal } from '../CreatePlanModal'
import type { Plan } from '@/domain/entities/Plan'

describe('CreatePlanModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreatePlanModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders in create mode and submits new plan name', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    render(
      <CreatePlanModal
        isOpen={true}
        onClose={mockClose}
        onSubmit={mockSubmit}
      />
    )

    expect(screen.getByText('New Plan Folder')).toBeInTheDocument()

    const input = screen.getByLabelText(/folder name/i)
    fireEvent.change(input, { target: { value: 'Push Pull Legs' } })

    const submitBtn = screen.getByRole('button', { name: /^create$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('Push Pull Legs')
      expect(mockClose).toHaveBeenCalled()
    })
  })

  it('renders in rename mode with pre-filled name and submits updated name', async () => {
    const mockPlan: Plan = { id: 'p-1', name: 'Upper Lower' }
    const mockSubmit = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    render(
      <CreatePlanModal
        isOpen={true}
        planToEdit={mockPlan}
        onClose={mockClose}
        onSubmit={mockSubmit}
      />
    )

    expect(screen.getByText('Rename Plan')).toBeInTheDocument()

    const input = screen.getByLabelText(/folder name/i) as HTMLInputElement
    expect(input.value).toBe('Upper Lower')

    fireEvent.change(input, { target: { value: 'Upper Lower Advanced' } })

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('Upper Lower Advanced')
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
