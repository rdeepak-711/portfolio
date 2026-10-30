import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dee from './Dee'
import { TOUR_STOPS } from '@/lib/dee/tour'
import { CLAIMS } from '@/content/dee/claims'

const DISCLOSURE = "Dee is an AI guide. It answers from Deepak's verified record and hands anything else to him."

function stubMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false }))
}

function mountSections() {
  const spies: Record<string, ReturnType<typeof vi.fn>> = {}
  for (const s of TOUR_STOPS) {
    const el = document.createElement('section')
    el.id = s.sectionId
    spies[s.sectionId] = vi.fn()
    el.scrollIntoView = spies[s.sectionId] as unknown as Element['scrollIntoView']
    document.body.appendChild(el)
  }
  return spies
}

beforeEach(() => {
  document.body.innerHTML = ''
  stubMotion(false)
})

async function open() {
  const user = userEvent.setup()
  render(<Dee />)
  await user.click(screen.getByRole('button', { name: "Open Dee, Deepak's guide" }))
  return user
}

describe('Dee', () => {
  it('opens with the disclosure and the two starts', async () => {
    await open()
    expect(screen.getByText(DISCLOSURE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Take the 90-second tour' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Just ask' })).toBeInTheDocument()
  })

  it('tours the six stops, scrolling to each section, then offers Ask Deepak', async () => {
    const spies = mountSections()
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Take the 90-second tour' }))
    expect(screen.getByText(TOUR_STOPS[0].lines[0])).toBeInTheDocument()
    expect(spies['top']).toHaveBeenCalled()
    for (let i = 1; i < TOUR_STOPS.length; i++) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByText(TOUR_STOPS[i].lines[0])).toBeInTheDocument()
      expect(spies[TOUR_STOPS[i].sectionId]).toHaveBeenCalled()
    }
    expect(screen.getByRole('button', { name: 'Ask Deepak' })).toBeInTheDocument()
  })

  it('can skip the tour', async () => {
    mountSections()
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Take the 90-second tour' }))
    await user.click(screen.getByRole('button', { name: 'Skip tour' }))
    expect(screen.queryByText(TOUR_STOPS[0].lines[0])).not.toBeInTheDocument()
  })

  it('does not animate scrolling under reduced motion', async () => {
    stubMotion(true)
    const spies = mountSections()
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Take the 90-second tour' }))
    expect(spies['top']).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })

  it('has audience mode chips', async () => {
    const user = await open()
    const chip = screen.getByRole('button', { name: 'CTO' })
    for (const m of ['Recruiter', 'Founder', 'Interviewer']) expect(screen.getByRole('button', { name: m })).toBeInTheDocument()
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('asks /api/dee and shows the answer with source chips', async () => {
    const claim = CLAIMS.find((c) => c.id === 'F2')!
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ text: 'Deepak built 70+ sites.', claimIds: ['F2'], escalate: false, source: 'primary' })))
    vi.stubGlobal('fetch', fetchMock)
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Just ask' }))
    await user.type(screen.getByLabelText('Ask Dee a question'), 'How many sites?{enter}')
    expect(await screen.findByText('Deepak built 70+ sites.')).toBeInTheDocument()
    expect(screen.getByText(claim.sourceLabel)).toBeInTheDocument()
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/dee')
  })

  it('offers Ask Deepak when Dee escalates, and sends the form', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === '/api/dee'
        ? new Response(JSON.stringify({ text: "I don't have that. Want me to ask Deepak?", claimIds: [], escalate: true, source: 'faq' }))
        : new Response(JSON.stringify({ ok: true, delivered: { email: true, telegram: true } })),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Just ask' }))
    await user.type(screen.getByLabelText('Ask Dee a question'), 'Can he start in January?{enter}')
    await user.click(await screen.findByRole('button', { name: 'Ask Deepak' }))
    const form = screen.getByRole('form', { name: 'Ask Deepak' })
    expect(within(form).getByLabelText('Your question')).toHaveValue('Can he start in January?')
    await user.type(within(form).getByLabelText('Your email'), 'cto@example.com')
    expect(within(form).getByLabelText('Name (optional)')).toBeInTheDocument()
    expect(within(form).getByLabelText('Company (optional)')).toBeInTheDocument()
    expect(form.querySelector('input[name="website"]')).not.toBeNull()
    await user.click(within(form).getByRole('button', { name: /send/i }))
    expect(await screen.findByText('Sent. Deepak usually replies within a day by email.')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some((c) => String(c[0]) === '/api/ask-deepak')).toBe(true)
  })
})
