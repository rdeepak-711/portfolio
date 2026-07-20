import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'
import { LANES, videosByLane } from '@/content/videos'

const recent = LANES.flatMap((l) => videosByLane(l.id))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .slice(0, 3)

describe('homepage — Building section', () => {
  it('has a #building section so it is reachable by scrolling, not just the nav', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('section#building')).not.toBeNull()
  })

  it('teases the three most recent videos', () => {
    render(<Home />)
    for (const v of recent) {
      expect(screen.getByText(v.title), `${v.slug} missing from homepage`).toBeInTheDocument()
    }
  })

  it('does not dump the whole catalogue onto the homepage', () => {
    const { container } = render(<Home />)
    const section = container.querySelector('section#building')!
    expect(section.querySelectorAll('li')).toHaveLength(3)
  })

  it('links through to the full index', () => {
    const { container } = render(<Home />)
    const section = container.querySelector('section#building')!
    const hrefs = [...section.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/building')
  })

  it('keeps the section order — Building sits before Contact', () => {
    const { container } = render(<Home />)
    const ids = [...container.querySelectorAll('section[id]')].map((s) => s.id)
    expect(ids.indexOf('building')).toBeGreaterThan(ids.indexOf('writing'))
    expect(ids.indexOf('building')).toBeLessThan(ids.indexOf('contact'))
  })
})
