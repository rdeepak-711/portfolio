import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Building from './page'
import { VIDEOS, LANES } from '@/content/videos'

describe('/building', () => {
  it('has a single top-level heading', () => {
    render(<Building />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('surfaces every published video', () => {
    render(<Building />)
    for (const v of VIDEOS) {
      expect(screen.getByText(v.title), `${v.slug} title missing`).toBeInTheDocument()
    }
  })

  it('renders a section for every declared lane', () => {
    render(<Building />)
    for (const lane of LANES) {
      expect(screen.getByRole('heading', { name: lane.label, level: 2 })).toBeInTheDocument()
    }
  })

  it('gives every video a play control', () => {
    render(<Building />)
    expect(screen.getAllByRole('button', { name: /play/i })).toHaveLength(VIDEOS.length)
  })

  it('links each video out to YouTube', () => {
    render(<Building />)
    for (const v of VIDEOS) {
      const links = screen
        .getAllByRole('link')
        .map((a) => a.getAttribute('href'))
        .filter(Boolean) as string[]
      expect(links.some((h) => h.includes(v.youtubeId)), `${v.slug} watch link`).toBe(true)
    }
  })

  // guards the funnel: an article link that doesn't exist is worse than none
  it('only renders article links for videos that declare one', () => {
    render(<Building />)
    const hrefs = screen
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') ?? '')
    const articleLinks = hrefs.filter((h) => h.startsWith('/writing'))
    const declared = VIDEOS.filter((v) => v.article).map((v) => v.article)
    expect(articleLinks.sort()).toEqual([...declared].sort())
  })

  it('renders no iframes until a video is played', () => {
    const { container } = render(<Building />)
    expect(container.querySelectorAll('iframe')).toHaveLength(0)
  })
})
