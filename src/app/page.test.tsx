import { describe, it, expect } from 'vitest'
import { render, within } from '@testing-library/react'
import Home from './page'
import { LANES, videosByLane } from '@/content/videos'

const recent = LANES.flatMap((l) => videosByLane(l.id))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .slice(0, 3)

// UI v4 folded the old Building section into Writing as a [data-videos] block
describe('homepage — videos inside Writing', () => {
  const videos = (c: HTMLElement) => c.querySelector<HTMLElement>('section#writing [data-videos]')!

  it('no longer has a separate #building section', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('section#building')).toBeNull()
    expect(videos(container)).not.toBeNull()
  })

  it('teases the three most recent videos', () => {
    const { container } = render(<Home />)
    const block = within(videos(container))
    for (const v of recent) {
      expect(block.getByText(v.title), `${v.slug} missing from videos`).toBeInTheDocument()
    }
  })

  it('does not dump the whole catalogue onto the homepage', () => {
    const { container } = render(<Home />)
    expect(videos(container).querySelectorAll('li')).toHaveLength(3)
  })

  it('links through to the full index', () => {
    const { container } = render(<Home />)
    const hrefs = [...videos(container).querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/building')
  })
})
