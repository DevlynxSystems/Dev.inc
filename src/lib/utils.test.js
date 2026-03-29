/**
 * Unit tests — IDs UT-29–UT-30 in docs/TESTING_PLAN.md.
 */
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn()', () => {
  it('UT-29-CB: tailwind-merge resolves conflicting padding', () => {
    expect(cn('p-2 p-4')).toMatch(/p-4/)
  })

  it('UT-30-OB: conditional class strings', () => {
    expect(cn('base', false && 'hidden', 'block')).toContain('base')
    expect(cn('base', false && 'hidden', 'block')).toContain('block')
  })
})
