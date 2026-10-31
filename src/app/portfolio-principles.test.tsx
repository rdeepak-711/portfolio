import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Home from './page'
import SectionNav from './section-nav'

describe('portfolio principles', () => {
  it('shows each live project with a captioned screenshot and alt text', () => {
    const c = render(<Home />).container
    for (const id of ['project-factory', 'project-crowdtracker', 'project-gate', 'project-platform']) {
      const fig = c.querySelector(`#${id} figure`)
      expect(fig, id).not.toBeNull()
      const img = fig!.querySelector('img')!
      expect(img.getAttribute('alt')!.length, id).toBeGreaterThan(20)
      expect(fig!.querySelector('figcaption')!.textContent!.length, id).toBeGreaterThan(10)
    }
  })

  it('opens every headline project with a plain-language line before the tech', () => {
    const c = render(<Home />).container
    for (const id of ['project-factory', 'project-crowdtracker', 'project-gate', 'project-platform']) {
      const first = c.querySelector(`#${id} [data-plain]`)
      expect(first, id).not.toBeNull()
      expect(first!.textContent, id).not.toMatch(/Next\.js|MySQL|multi-tenant|WP-CLI|MCP/)
    }
  })

  it('links a site the pipeline built', () => {
    const c = render(<Home />).container
    const hrefs = [...c.querySelectorAll('#project-factory a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('https://operagarnier-guide.com/')
  })

  it('links the live forum', () => {
    const c = render(<Home />).container
    const hrefs = [...c.querySelectorAll('#project-platform a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('https://forum.louvremuseum-guide.com/')
  })

  it('keeps the menu short', () => {
    const c = render(<SectionNav />).container
    // Work · Method · Experience · Writing · Contact, plus the résumé
    expect([...c.querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Work', 'Method', 'Experience', 'Writing', 'Contact', 'Résumé ↗'])
  })

  it('uses specific link labels', () => {
    const t = render(<Home />).container.textContent!
    expect(t).not.toContain('Open project')
  })
})
