import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import WritingIndex from './page'
import { NOTES, NOTE_LANES } from '@/content/notes'
import nextConfig from '../../../next.config'

// headings read "LeetCode · 4", so match the label at the start
const named = (label: string) => new RegExp(`^${label} ·`)

describe('/writing groups notes by lane', () => {
  it('shows a heading for each lane that has notes, and none for empty lanes', () => {
    render(<WritingIndex />)
    for (const lane of NOTE_LANES) {
      const has = NOTES.some((n) => n.lane === lane.id)
      expect(screen.queryByRole('heading', { level: 2, name: named(lane.label) }) !== null, lane.label).toBe(has)
    }
  })

  it('lists each note under its own lane', () => {
    render(<WritingIndex />)
    for (const n of NOTES) {
      const label = NOTE_LANES.find((l) => l.id === n.lane)!.label
      const section = screen.getByRole('region', { name: named(label) })
      expect(within(section).getByRole('link', { name: new RegExp(n.title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toHaveAttribute('href', `/writing/${n.slug}`)
    }
  })
})

describe('retired notes redirect instead of 404', () => {
  it('sends every retired slug to /writing permanently', async () => {
    const { RETIRED_NOTE_SLUGS } = await import('@/content/notes')
    const rules = await nextConfig.redirects!()
    for (const slug of RETIRED_NOTE_SLUGS) {
      expect(rules, slug).toContainEqual({ source: `/writing/${slug}`, destination: '/writing', permanent: true })
    }
  })
})
