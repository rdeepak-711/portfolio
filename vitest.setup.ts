import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no IntersectionObserver; SectionNav's scrollspy needs it to exist
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()
  takeRecords = vi.fn(() => [])
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

afterEach(() => {
  cleanup()
})
