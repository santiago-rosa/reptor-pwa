import { describe, it, expect } from 'vitest'

describe('Smoke test', () => {
  it('asserts basic math', () => {
    expect(1 + 1).toBe(2)
  })

  it('verifies DOM environment and jest-dom matchers', () => {
    const el = document.createElement('div')
    el.textContent = 'Hello Reptor'
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
    expect(el).toHaveTextContent('Hello Reptor')
  })
})
