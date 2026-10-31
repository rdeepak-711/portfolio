import { describe, it, expect, vi } from 'vitest'
import { render, within, fireEvent, screen } from '@testing-library/react'
import Home from './page'
import { NOTES, NOTE_LANES } from '@/content/notes'

const newest = [...NOTES].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
const section = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`section#${id}`)!

// Step 1 — the home Writing section is built from NOTES, so it can't go stale
describe('step 1 · home Writing is a collection', () => {
  it('lists the 3 newest notes first, newest on top', () => {
    const { container } = render(<Home />)
    const latest = section(container, 'writing').querySelector('[data-latest]')!
    const hrefs = [...latest.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(newest.slice(0, 3).map((n) => `/writing/${n.slug}`))
  })

  it('has one <details> per lane that has notes, its <summary> reading "Label · count"', () => {
    const { container } = render(<Home />)
    const summaries = [...section(container, 'writing').querySelectorAll('details > summary')].map((s) => s.textContent?.trim())
    const expected = NOTE_LANES.map((l) => ({ l, n: NOTES.filter((x) => x.lane === l.id).length }))
      .filter(({ n }) => n > 0)
      .map(({ l, n }) => `${l.label} · ${n}`)
    expect(summaries).toEqual(expected)
  })

  it('links every note from inside its lane', () => {
    const { container } = render(<Home />)
    const lanes = [...section(container, 'writing').querySelectorAll('details')]
    for (const n of NOTES) {
      const label = NOTE_LANES.find((l) => l.id === n.lane)!.label
      const lane = lanes.find((d) => d.querySelector('summary')!.textContent!.startsWith(`${label} ·`))!
      expect([...lane.querySelectorAll('a')].map((a) => a.getAttribute('href')), n.slug).toContain(`/writing/${n.slug}`)
    }
  })

  it('links to the full /writing page', () => {
    const { container } = render(<Home />)
    expect(within(section(container, 'writing')).getByRole('link', { name: /All writing/ })).toHaveAttribute('href', '/writing')
  })
})

// Step 2 — public work in other people's repos (data rules in src/content/outside.test.ts)
describe("step 2 · Found in other people's code", () => {
  it('renders as its own section right after Work, with every verified link and the open status', () => {
    const { container } = render(<Home />)
    const ids = [...container.querySelectorAll('section[id]')].map((s) => s.id)
    expect(ids[ids.indexOf('work') + 1]).toBe('outside')
    const s = section(container, 'outside')
    expect(s.textContent).toContain('Found in other people’s code')
    const links = [...s.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual(
      expect.arrayContaining([
        'https://github.com/interviewstreet/hiring-agent/issues/479',
        'https://github.com/interviewstreet/hiring-agent/pull/480',
        'https://github.com/crewAIInc/crewAI/issues/6072#issuecomment-6423394143',
      ]),
    )
    expect(s.textContent).toMatch(/\bopen\b/i)
    expect(s.textContent).not.toMatch(/fixed upstream/i)
  })
})

// Step 3 — the email address itself, big and copyable
describe('step 3 · big email in Contact', () => {
  it('shows the address as a mailto link', () => {
    const { container } = render(<Home />)
    const link = within(section(container, 'contact')).getByRole('link', { name: 'deepakrameshh@gmail.com' })
    expect(link).toHaveAttribute('href', 'mailto:deepakrameshh@gmail.com')
  })

  it('copies the address and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const { container } = render(<Home />)
    fireEvent.click(within(section(container, 'contact')).getByRole('button', { name: /Copy email/ }))
    expect(writeText).toHaveBeenCalledWith('deepakrameshh@gmail.com')
    expect(await screen.findByText(/Copied/)).toBeInTheDocument()
  })

  it('repeats Email and Résumé in the footer', () => {
    const { container } = render(<Home />)
    const hrefs = [...container.querySelectorAll('footer a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['mailto:deepakrameshh@gmail.com', '/Deepak-R-Resume.pdf']))
  })
})

// Step 4 — where he works, on the first screen, agreeing with Experience
describe('step 4 · employer line in the hero', () => {
  it('says the current and previous employer', () => {
    const { container } = render(<Home />)
    expect(section(container, 'top').textContent).toContain('Software Engineer at Firestorm Internet since Jul 2025 · before that, UiPath')
  })

  it('agrees with the Experience section', () => {
    const { container } = render(<Home />)
    const exp = section(container, 'experience').textContent!
    for (const s of ['Jul 2025', 'Firestorm Internet', 'UiPath']) expect(exp, s).toContain(s)
  })
})

// Step 5 — wide-screen bands alternate sides; layout itself is checked in the preview screenshots
describe('step 5 · project bands alternate', () => {
  it('marks each main project left, right, left…', () => {
    const { container } = render(<Home />)
    const bands = [...section(container, 'work').querySelectorAll('article[data-band]')].map((a) => a.getAttribute('data-band'))
    expect(bands.length).toBeGreaterThanOrEqual(3)
    bands.forEach((b, i) => expect(b, `band ${i}`).toBe(i % 2 === 0 ? 'left' : 'right'))
  })

  it('keeps every band’s screenshot inside the band', () => {
    const { container } = render(<Home />)
    for (const a of section(container, 'work').querySelectorAll('article[data-band]')) {
      if (a.id === 'project-gate' || a.id === 'project-factory' || a.id === 'project-crowdtracker') expect(a.querySelector('figure img'), a.id).not.toBeNull()
    }
  })
})

// Step 6 — Travel Measured has posts, so it gets a card; no traffic numbers
describe('step 6 · Travel Measured card', () => {
  it('links the live site and both posts', () => {
    const { container } = render(<Home />)
    const card = [...section(container, 'work').querySelectorAll('article')].find((a) => a.querySelector('h3')?.textContent === 'Travel Measured')!
    expect(card).toBeTruthy()
    const hrefs = [...card.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(
      expect.arrayContaining([
        'https://travelmeasured.vercel.app',
        '/writing/site-said-every-30-minutes',
        '/writing/measured-or-estimated',
      ]),
    )
    expect(card.textContent).not.toMatch(/visitors|clicks|impressions|users/i)
  })
})
