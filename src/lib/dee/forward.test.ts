import { describe, expect, it } from 'vitest'
import { offersToForward } from './forward'

describe('offersToForward', () => {
  it('spots replies that offer to pass a question on', () => {
    expect(offersToForward('I can pass that question to Deepak directly.')).toBe(true)
    expect(offersToForward('I can send your question to him.')).toBe(true)
    expect(offersToForward("Want me to forward this on to Deepak?")).toBe(true)
  })
  it('ignores replies that only mention Deepak', () => {
    expect(offersToForward('Deepak built escalation-gate.')).toBe(false)
    expect(offersToForward('He passed the test suite to production.')).toBe(false)
  })
})
