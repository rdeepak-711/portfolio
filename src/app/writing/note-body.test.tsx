import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoteBody } from './note-body'
import type { Note } from '@/content/notes'

describe('NoteBody', () => {
  it('renders a link block as a real link that opens in a new tab', () => {
    const note: Note = {
      slug: 's',
      lane: 'travel-measured',
      title: 't',
      dek: 'd',
      date: '2026-10-31',
      body: [{ kind: 'link', label: 'See the method page', href: 'https://travelmeasured.vercel.app/method' }],
    }
    render(<NoteBody note={note} />)
    const a = screen.getByRole('link', { name: /See the method page/ })
    expect(a).toHaveAttribute('href', 'https://travelmeasured.vercel.app/method')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})
