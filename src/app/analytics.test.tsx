import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Analytics, isValidGaId } from './analytics'

const original = process.env.NEXT_PUBLIC_GA_ID

afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_GA_ID
  else process.env.NEXT_PUBLIC_GA_ID = original
})

describe('isValidGaId', () => {
  it('rejects missing, blank and placeholder values', () => {
    expect(isValidGaId(undefined)).toBe(false)
    expect(isValidGaId('')).toBe(false)
    expect(isValidGaId('   ')).toBe(false)
    expect(isValidGaId('G-XXXXXXXXXX')).toBe(false)
    expect(isValidGaId('g-xxxxxxx')).toBe(false)
  })

  it('rejects malformed ids', () => {
    expect(isValidGaId('ABC1234567')).toBe(false)
    expect(isValidGaId('UA-12345-1')).toBe(false)
    expect(isValidGaId('G-123')).toBe(false)
  })

  it('accepts a real GA4 measurement id, trimmed', () => {
    expect(isValidGaId('G-ABC1234567')).toBe(true)
    expect(isValidGaId('  G-ABC1234567  ')).toBe(true)
  })
})

describe('Analytics', () => {
  // the site must never break because analytics isn't configured yet
  it('renders nothing when no measurement id is set', () => {
    delete process.env.NEXT_PUBLIC_GA_ID
    const { container } = render(<Analytics />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a placeholder id', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-XXXXXXXXXX'
    const { container } = render(<Analytics />)
    expect(container).toBeEmptyDOMElement()
  })
})
