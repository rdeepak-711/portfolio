import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Home from './page'
import FirestormCaseStudy from './case-study/firestorm-pipeline/page'
import UiPathCaseStudy from './case-study/uipath-ml/page'
import { NOTES } from '@/content/notes'

// Claims that are not true (or no longer true) per career-ops cv.md and
// profile/work-history.md. If one comes back, a recruiter reads it.
const BANNED = [
  'Software Engineer II',
  'Cloud Build',
  'CI/CD',
  'dead-letter',
  'exponential backoff',
  'schema validation',
  'structured-output validation',
  'WhatsApp SaaS',
  'paying tenants',
  'helped train',
  '400+',
  'escalation-gate-rdeepak.vercel.app',
  'same résumé gets different scores',
  'Classifying 10K+',
]

const pages = {
  home: Home,
  firestorm: FirestormCaseStudy,
  uipath: UiPathCaseStudy,
}

function html(Page: () => React.ReactNode) {
  return render(<Page />).container.innerHTML
}

describe('portfolio claims match the CV', () => {
  for (const [name, Page] of Object.entries(pages)) {
    it(`${name} has none of the retired claims`, () => {
      const out = html(Page)
      for (const phrase of BANNED) {
        expect(out.includes(phrase), `"${phrase}" on ${name}`).toBe(false)
      }
    })
  }

  it('the escalation-gate write-up has none of the retired claims', () => {
    const text = JSON.stringify(NOTES.find((n) => n.slug === 'escalation-gate'))
    for (const phrase of BANNED) {
      expect(text.includes(phrase), `"${phrase}" in the write-up`).toBe(false)
    }
  })

  it('shows the Outbuiltit studio with escalation-gate and LifeDots', () => {
    const out = html(Home)
    for (const s of ['Outbuiltit', 'escalation-gate', 'LifeDots', 'https://gate.outbuiltit.com', 'https://lifedots.outbuiltit.com', 'MCP']) {
      expect(out, s).toContain(s)
    }
  })

  it('lists the stack the CV lists', () => {
    const out = html(Home)
    for (const s of ['PostgreSQL', 'MySQL', 'AI agents', 'MCP servers']) {
      expect(out, s).toContain(s)
    }
  })

  it('links the current résumé', () => {
    const { container } = render(<Home />)
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/Deepak-R-Resume.pdf')
  })
})
