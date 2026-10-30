import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'
import { TOUR_STOPS } from '@/lib/dee/tour'

function html() {
  return render(<Home />).container
}

describe('home v2', () => {
  it('mounts Dee', () => {
    html()
    expect(screen.getByRole('button', { name: "Open Dee, Deepak's guide" })).toBeInTheDocument()
  })

  it('has an element for every tour stop', () => {
    const c = html()
    for (const s of TOUR_STOPS) expect(c.querySelector(`#${s.sectionId}`), s.sectionId).not.toBeNull()
  })

  it('positions Deepak as a Forward Deployed engineer', () => {
    const c = html()
    expect(c.querySelector('#top')!.textContent).toContain('Forward Deployed')
  })

  it('orders the headline projects: factory, CrowdTracker, escalation-gate, forum platform', () => {
    const c = html()
    const order = ['project-factory', 'project-crowdtracker', 'project-gate', 'project-platform'].map((id) => {
      const el = c.querySelector(`#${id}`)
      expect(el, id).not.toBeNull()
      return el!
    })
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING, `${i}`).toBeTruthy()
    }
  })

  it('shows how he works, honestly', () => {
    const c = html()
    const s = c.querySelector('#how-i-work')!
    expect(s).not.toBeNull()
    const t = s.textContent!
    for (const step of ['spec', 'tests', 'AI writes', 'checked', 'shipped']) expect(t, step).toContain(step)
    expect(t).toContain("I'm revising Python by hand")
  })

  it('carries the locked proof numbers', () => {
    const t = html().textContent!
    for (const n of ['70+', '108,043', '3 live forums', '45%', '85–90%', '#480', '51 installs']) expect(t, n).toContain(n)
  })
})
