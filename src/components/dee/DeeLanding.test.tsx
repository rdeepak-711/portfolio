import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Dee from './Dee'

const HELLO = "Hi, I'm Dee. I'll show you Deepak's work in 90 seconds."

beforeEach(() => {
  document.body.innerHTML = ''
  sessionStorage.clear()
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false }))
})
afterEach(() => vi.useRealTimers())

describe('Dee landing', () => {
  it('does not take focus when the page loads', () => {
    render(<Dee />)
    expect(document.activeElement).toBe(document.body)
  })

  it('says hello after landing, and the hello opens Dee', () => {
    render(<Dee />)
    expect(screen.queryByText(HELLO)).toBeNull()
    act(() => { vi.advanceTimersByTime(2000) })
    fireEvent.click(screen.getByText(HELLO))
    expect(screen.getByRole('button', { name: 'Take the 90-second tour' })).toBeInTheDocument()
  })

  it('says hello once per visit', () => {
    const first = render(<Dee />)
    act(() => { vi.advanceTimersByTime(2000) })
    first.unmount()
    render(<Dee />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.queryByText(HELLO)).toBeNull()
  })

  it('can be dismissed', () => {
    render(<Dee />)
    act(() => { vi.advanceTimersByTime(2000) })
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Dee greeting' }))
    expect(screen.queryByText(HELLO)).toBeNull()
  })
})
