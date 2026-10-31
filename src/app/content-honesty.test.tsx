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
  // retired 31 Oct 2026 (engineering dossier, 07_EVIDENCE_REGISTER.md)
  'PakkaBot',
  'Reckitt',
  '600+',
  '68 of',
  '68 of the',
  'fixed upstream',
  'Senior',
  'Quantitative',
  '495 tests',
  '79 tests',
  '17-state',
  // retired 31 Oct 2026: not in the register, or "interview only, never a headline"
  '5 → 32',
  '32 in the first',
  'throughput by 70%',
  '+70%',
  '₹1L',
  '4–10 days',
  '85–90% accuracy',
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

  it('no note has any of the retired claims', () => {
    for (const note of NOTES) {
      const text = JSON.stringify(note)
      for (const phrase of BANNED) {
        expect(text.includes(phrase), `"${phrase}" in ${note.slug}`).toBe(false)
      }
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

  it('links proof only to pages that show it', () => {
    const { container } = render(<Home />)
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '')
    expect(hrefs).not.toContain('/writing/resume-scorer-audit')
    const proofLinks = [...container.querySelectorAll('a')].filter((a) => /GA4|users ·|live forums|installs/.test(a.textContent ?? ''))
    expect(proofLinks.map((a) => a.textContent)).toEqual([])
  })

  it('the UiPath case study tells the invoice story the home page links to', () => {
    const out = html(UiPathCaseStudy)
    for (const s of ['The invoice problem was the input', '45%', '85–90%', 'business analyst']) expect(out, s).toContain(s)
  })

  it('links the current résumé', () => {
    const { container } = render(<Home />)
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/Deepak-R-Resume.pdf')
  })
})
