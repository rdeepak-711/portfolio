import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Home from './page'

const section = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`section#${id}`)

// Step 1 — eight numbered sections become six
describe('step 1 · six sections', () => {
  it('keeps exactly these sections, in this order', () => {
    const { container } = render(<Home />)
    const ids = [...container.querySelectorAll('main section[id]')].map((s) => s.id)
    expect(ids).toEqual(['top', 'work', 'outside', 'how-i-work', 'experience', 'writing', 'contact'])
  })

  it('numbers the labels 01 to 06', () => {
    const { container } = render(<Home />)
    const labels: [string, string][] = [['work', '§ 01'], ['outside', '§ 02'], ['how-i-work', '§ 03'], ['experience', '§ 04'], ['writing', '§ 05'], ['contact', '§ 06']]
    for (const [id, no] of labels) expect(section(container, id)!.textContent, id).toContain(no)
    expect(section(container, 'writing')!.textContent).toContain('Writing & videos')
  })

  it('folds the stack into Experience', () => {
    const { container } = render(<Home />)
    const stack = section(container, 'experience')!.querySelector('[data-stack]')
    expect(stack).not.toBeNull()
    for (const group of ['AI & agents', 'Automation & RPA', 'Backend', 'Databases', 'Frontend', 'Tools']) expect(stack!.textContent, group).toContain(group)
    expect(stack!.textContent).toContain('MCP servers')
  })
})

// Step 2 — the outside proof gets its own band
describe('step 2 · outside band', () => {
  it('is marked as the feature band and says what it is', () => {
    const { container } = render(<Home />)
    const s = section(container, 'outside')!
    expect(s.getAttribute('data-band')).toBe('feature')
    expect(s.textContent).toContain('Bugs I traced in public repos, each with a link you can check.')
  })
})

// Step 3 — first person, arrows that tell the truth, fact chips that don't look like links
describe('step 3 · voice, arrows, chips', () => {
  it('speaks in the first person outside the header and footer', () => {
    const { container } = render(<Home />)
    for (const id of ['work', 'outside', 'how-i-work', 'experience']) expect(section(container, id)!.textContent, id).not.toMatch(/\bDeepak\b/)
    expect(section(container, 'work')!.textContent).toContain('I built the AI site-building pipeline')
    expect(section(container, 'work')!.textContent).toContain('I traced the bug by hand')
  })

  it('puts ↗ only on links that leave the page (sites, email, the résumé PDF), and → on links that stay', () => {
    const { container } = render(<Home />)
    for (const a of container.querySelectorAll('main a, header a')) {
      const href = a.getAttribute('href') ?? ''
      const text = a.textContent ?? ''
      const leaves = /^(https?:|mailto:)/.test(href) || href.endsWith('.pdf')
      if (text.includes('↗')) expect(leaves, `${text} → ${href}`).toBe(true)
      if (!leaves && /[↗→]/.test(text)) expect(text, href).toContain('→')
    }
  })

  it('renders fact chips as dashed spans and link chips as anchors', () => {
    const { container } = render(<Home />)
    const facts = [...container.querySelectorAll('main [data-chip="fact"]')]
    const links = [...container.querySelectorAll('main [data-chip="link"]')]
    expect(facts.length).toBeGreaterThanOrEqual(3)
    expect(links.length).toBeGreaterThanOrEqual(3)
    for (const f of facts) {
      expect(f.tagName, f.textContent!).toBe('SPAN')
      expect(f.className, f.textContent!).toContain('border-dashed')
      expect(f.textContent, f.textContent!).not.toMatch(/[↗→]/)
    }
    for (const l of links) expect(l.tagName, l.textContent!).toBe('A')
  })
})

// Step 4 — phones get the section nav and a readable diagram
describe('step 4 · phone nav and diagram', () => {
  it('shows the section nav on phones instead of hiding it', () => {
    const { container } = render(<Home />)
    const nav = container.querySelector('header nav')!
    expect(nav).not.toBeNull()
    expect(nav.className).not.toMatch(/(^|\s)hidden(\s|$)/)
    expect(nav.className).toContain('overflow-x-auto')
  })

  it('has a text list version of the pipeline for small screens', () => {
    const { container } = render(<Home />)
    const list = container.querySelector('#project-factory [data-pipeline-list]')!
    expect(list).not.toBeNull()
    expect(list.querySelectorAll('li')).toHaveLength(5)
    expect(list.textContent).toContain('Human review')
  })
})

// Step 5 — one Dee on screen: no inline figures, two empty docks for DeeFlight to measure
describe('step 5 · room for the travelling Dee', () => {
  it('has no inline Dee figures in the page body', () => {
    const { container } = render(<Home />)
    expect(container.querySelectorAll('main .dee-figure')).toHaveLength(0)
    expect(section(container, 'work')!.textContent).toContain('checked before publishing')
  })

  it('has an empty hero dock and an empty contact dock', () => {
    const { container } = render(<Home />)
    const hero = section(container, 'top')!.querySelector('[data-dee-dock="hero"]')
    const contact = section(container, 'contact')!.querySelector('[data-dee-dock="contact"]')
    for (const dock of [hero, contact]) {
      expect(dock).not.toBeNull()
      expect(dock!.getAttribute('aria-hidden')).toBe('true')
      expect(dock!.textContent).toBe('')
    }
  })
})
