'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CLAIMS } from '@/content/dee/claims'
import type { Mode } from '@/content/dee/types'
import { TOUR_STOPS } from '@/lib/dee/tour'
import DeeFigure from './DeeFigure'

// An assistant message keeps the answer it came from, so every earlier answer and its sources stay on screen
type ChatMessage = { role: 'user' | 'assistant'; content: string; answer?: Answer }
type Source = { id: string; label: string; url: string | null; links: { href: string; label: string }[] }
type Answer = { text: string; claimIds: string[]; escalate: boolean; sources?: Source[] }
const DISCLOSURE = "Dee is an AI guide. It answers from Deepak's verified record and hands anything else to him."
const MODES: { id: Mode; label: string }[] = [
  { id: 'recruiter', label: 'Recruiter' }, { id: 'founder', label: 'Founder' },
  { id: 'cto', label: 'CTO' }, { id: 'interviewer', label: 'Interviewer' },
]

// Under an answer: where each cited fact comes from, then the pages a visitor can open to check it.
// Links come only from the knowledge base, never from model text, and each page shows once.
// The server sends each source, so facts from Deepak's answered questions (not in this bundle's CLAIMS) show theirs too.
function AnswerSources({ claimIds, sources }: { claimIds: string[]; sources?: Source[] }) {
  const cited = sources
    ? sources.map((s) => ({ id: s.id, sourceLabel: s.label, sourceUrl: s.url, links: s.links }))
    : claimIds.map((id) => CLAIMS.find((claim) => claim.id === id && claim.public)).filter((claim) => claim !== undefined)
  const links = [...new Map(cited.flatMap((claim) => claim.links ?? []).map((link) => [link.href, link])).values()]
  const chip = 'mt-3 mr-2 inline-flex rounded-full border border-line px-2 py-1 font-mono text-[0.68rem] text-muted'
  const linked = new Set(links.map((link) => link.href))
  return <>
    {cited.map((claim) => claim.sourceUrl && !linked.has(claim.sourceUrl)
      ? <a key={claim.id} href={claim.sourceUrl} target="_blank" rel="noreferrer" className={`${chip} underline-offset-2 hover:underline`}>{claim.sourceLabel}</a>
      : <span key={claim.id} className={chip}>{claim.sourceLabel}</span>)}
    {links.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{links.map((link) => {
      const external = link.href.startsWith('http')
      return <a key={link.href} href={link.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="inline-flex items-center gap-1 rounded-full border border-ink/30 px-2.5 py-1 text-xs text-ink hover:border-accent hover:text-accent">{link.label}<span aria-hidden="true">{external ? '↗' : '→'}</span></a>
    })}</div>}
  </>
}

function readOrigin(): unknown {
  try { return JSON.parse(sessionStorage.getItem('dee-origin') ?? 'null') } catch { return null }
}

export default function Dee() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('recruiter')
  const [tourIndex, setTourIndex] = useState<number | null>(null)
  const [tourDone, setTourDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [askOpen, setAskOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [hello, setHello] = useState(false)
  // Visitors who clicked "Talk to mine" on UrDee land with ?ref=mind
  const [fromUrDee, setFromUrDee] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const chatBody = useRef<HTMLDivElement>(null)
  const latestMessage = useRef<HTMLElement | null>(null)
  const sessionId = useRef(`dee-${Math.random().toString(36).slice(2)}`)

  const wasOpen = useRef(false)
  // Bring the newest question or answer into view, its top edge first, so a long answer starts where it begins
  useEffect(() => {
    const body = chatBody.current, last = latestMessage.current
    if (!body || !last) return
    body.scrollTop += last.getBoundingClientRect().top - body.getBoundingClientRect().top - 12
  }, [messages.length])
  useEffect(() => {
    // Return focus to the launcher only after Dee closes, never on page load
    if (open) {
      closeButton.current?.focus()
      // GA4: count how many visitors open Dee (gtag is loaded in layout.tsx)
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      gtag?.('event', 'dee_open')
    }
    else if (wasOpen.current) launcher.current?.focus()
    wasOpen.current = open
  }, [open])

  // Remember where this visit started (first page only), so Deepak's digest can say where a visitor came from
  useEffect(() => {
    try {
      if (sessionStorage.getItem('dee-origin')) return
      const params = new URLSearchParams(window.location.search)
      const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
      sessionStorage.setItem('dee-origin', JSON.stringify({
        ref: params.get('ref') || params.get('utm_source') || '',
        referrer: host && host !== window.location.hostname ? host : '',
        landing: window.location.pathname,
      }))
    } catch { /* storage blocked: the chat still works without an origin */ }
  }, [])

  // Greet once per visit, after the landing bounce
  useEffect(() => {
    // Read in a timer, not the effect body, so the first render matches the server's
    const fromMind = new URLSearchParams(window.location.search).get('ref') === 'mind'
    const mark = fromMind ? setTimeout(() => setFromUrDee(true), 0) : undefined
    try {
      if (sessionStorage.getItem('dee-hello')) return () => clearTimeout(mark)
      sessionStorage.setItem('dee-hello', '1')
    } catch { /* storage blocked: greet anyway */ }
    const show = setTimeout(() => setHello(true), 1600)
    const hide = setTimeout(() => setHello(false), 12000)
    return () => { clearTimeout(mark); clearTimeout(show); clearTimeout(hide) }
  }, [])

  useEffect(() => {
    const target = tourIndex === null ? null : document.getElementById(TOUR_STOPS[tourIndex].sectionId)
    target?.classList.add('dee-tour-target')
    return () => target?.classList.remove('dee-tour-target')
  }, [tourIndex])
  useEffect(() => {
    if (askOpen) input.current?.focus()
  }, [askOpen])
  // While the chat is open the page behind stays still, so a swipe on a phone scrolls the chat, not the site.
  // The tour is left alone: it scrolls the page to each section on purpose.
  useEffect(() => {
    if (!open || tourIndex !== null) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = previous }
  }, [open, tourIndex])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setAskOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function startTour() {
    setTourDone(false)
    setTourIndex(0)
    setAskOpen(false)
    scrollToStop(0)
  }
  function scrollToStop(index: number) {
    const stop = TOUR_STOPS[index]
    const section = document.getElementById(stop.sectionId)
    if (!section) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  function nextStop() {
    if (tourIndex === null) return
    const next = tourIndex + 1
    if (next >= TOUR_STOPS.length) { setTourIndex(null); setTourDone(true) }
    else { setTourIndex(next); scrollToStop(next) }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = question.trim()
    if (!value || busy) return
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: value }]
    setMessages(nextMessages)
    setQuestion('')
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/dee', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })), mode, sessionId: sessionId.current, origin: readOrigin() }),
      })
      if (!response.ok) throw new Error('Dee could not answer just now. Please try again.')
      const result = await response.json() as Answer
      setMessages([...nextMessages, { role: 'assistant', content: result.text, answer: result }])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  async function sendAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/ask-deepak', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: String(values.get('question') ?? ''), email: String(values.get('email') ?? ''),
          name: String(values.get('name') ?? ''), company: String(values.get('company') ?? ''),
          website: String(values.get('website') ?? ''), transcript: JSON.stringify(messages.map(({ role, content }) => ({ role, content }))),
        }),
      })
      if (!response.ok) throw new Error('Could not send your question. Please try again.')
      setSent(true)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send your question.') }
    finally { setBusy(false) }
  }

  const tourStop = tourIndex === null ? null : TOUR_STOPS[tourIndex]
  // The latest answer, only while it is the reply to the latest question
  const answer = !busy && messages.at(-1)?.role === 'assistant' ? messages.at(-1)?.answer ?? null : null
  const showAskButton = !askOpen && (tourDone || tourIndex === TOUR_STOPS.length - 1 || Boolean(answer?.escalate))
  return (
    <>
      {hello && !open && <div className="dee-hello fixed bottom-[4.75rem] right-5 z-[60] flex max-w-[16rem] items-start gap-1 rounded-2xl rounded-br-sm border border-line bg-paper py-2 pl-3 pr-1 shadow-sm sm:bottom-[5.5rem] sm:right-7">
        <button type="button" onClick={() => { setHello(false); setOpen(true) }} className="text-left text-sm text-ink hover:text-accent">{fromUrDee ? <>You came from UrDee. I&apos;m the live one. Ask me about Deepak.</> : <>Hi, I&apos;m Dee. I&apos;ll show you Deepak&apos;s work in 90 seconds.</>}</button>
        <button type="button" aria-label="Dismiss Dee greeting" onClick={() => setHello(false)} className="px-1.5 font-mono text-xs text-muted hover:text-ink">×</button>
      </div>}
      <button ref={launcher} type="button" aria-label="Open Dee, Deepak's guide" onClick={() => { setHello(false); setOpen(true) }} className="dee-launcher fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 shadow-sm hover:border-accent sm:bottom-7 sm:right-7">
        <DeeFigure pose="explain" className="h-10 w-10"/><span className="font-mono text-xs text-ink">Ask Dee</span>
      </button>
      {open && <div className={`fixed inset-0 z-[70] flex items-end justify-end p-0 sm:items-end sm:p-7 ${tourStop ? '' : 'bg-ink/20'}`} onMouseDown={(e) => { if (!tourStop && e.target === e.currentTarget) setOpen(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="dee-title" className={`dee-panel sheet-in relative flex w-full flex-col overflow-hidden border border-line bg-paper shadow-xl sm:mb-0 sm:ml-0 sm:rounded-xl ${tourStop ? 'dee-panel-tour max-h-[40dvh] sm:max-w-[360px]' : 'dee-panel-chat max-h-[85dvh] sm:max-h-[88dvh] sm:max-w-md'}`}>
          <header className="flex items-start justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-3"><DeeFigure pose={tourStop?.pose ?? 'explain'} className={tourStop ? 'h-9 w-9' : 'h-12 w-12'}/><div><h2 id="dee-title" className="font-display text-xl font-semibold">Dee, Deepak&apos;s guide</h2>{!tourStop && <p className="mt-1 max-w-[34ch] text-xs text-muted">{DISCLOSURE}</p>}</div></div>
            <button ref={closeButton} type="button" aria-label="Close Dee" onClick={() => setOpen(false)} className="rounded px-2 py-1 font-mono text-sm text-muted hover:text-ink">Esc ×</button>
          </header>
          <div ref={chatBody} className={`min-h-0 space-y-4 overflow-y-auto overscroll-contain ${tourStop ? 'p-3' : 'flex-initial p-5'}`}>
            {!tourStop && messages.length === 0 && fromUrDee && <p className="text-sm">This is the live Dee that UrDee is built from. It only answers from what Deepak has told it, and shows the source. If he hasn&apos;t told it something, it sends your question to him.</p>}
            {!tourStop && messages.length === 0 && <div className="flex flex-wrap gap-2"><button type="button" onClick={startTour} className="rounded border border-accent bg-accent-soft px-3 py-2 text-sm">Take the 90-second tour</button><button type="button" onClick={() => input.current?.focus()} className="rounded border border-line px-3 py-2 text-sm hover:border-accent">Just ask</button></div>}
            {tourStop && <div className="rounded border border-line p-4"><p className="font-mono text-xs uppercase tracking-wider text-muted">Stop {tourIndex! + 1} of {TOUR_STOPS.length}</p>{tourStop.lines.map((line) => <p key={line} className="mt-2 text-sm">{line}</p>)}<div className="mt-4 flex gap-3"><button type="button" onClick={nextStop} className="rounded bg-ink px-3 py-2 text-sm text-paper">Next</button><button type="button" onClick={() => { setTourIndex(null); setTourDone(false) }} className="px-2 py-2 text-sm text-muted underline">Skip tour</button></div></div>}
            {!tourStop && <div className="flex flex-wrap gap-2" aria-label="Choose audience mode">{MODES.map((item) => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)} className={`rounded-full border px-3 py-1.5 font-mono text-xs ${mode === item.id ? 'border-accent bg-accent-soft text-ink' : 'border-line text-muted'}`}>{item.label}</button>)}</div>}
            <div aria-live="polite" className="space-y-3">{messages.map((message, index) => message.role === 'user'
              ? <p key={`${index}-q`} ref={index === messages.length - 1 ? (el) => { latestMessage.current = el } : undefined} className="ml-8 rounded bg-accent-soft px-3 py-2 text-sm">{message.content}</p>
              : <div key={`${index}-a`} ref={index === messages.length - 1 ? (el) => { latestMessage.current = el } : undefined} className="rounded border border-line p-3"><p className="text-sm">{message.content}</p>{message.answer && <AnswerSources claimIds={message.answer.claimIds} sources={message.answer.sources}/>}</div>)}</div>
            <div aria-live="polite" aria-atomic="true">{busy && <p className="text-sm text-muted">Dee is checking the record…</p>}{error && <p role="alert" className="text-sm text-accent">{error}</p>}{sent && <p className="text-sm">Sent. Deepak usually replies within a day by email.</p>}</div>
            {showAskButton && <button type="button" onClick={() => { setAskOpen(true); setTourIndex(null); setSent(false) }} className="rounded border border-accent px-3 py-2 text-sm hover:bg-accent-soft">Ask Deepak</button>}
            {askOpen && !sent && <form role="form" aria-label="Ask Deepak" onSubmit={sendAsk} className="space-y-3 border-t border-line pt-4"><label className="block text-sm">Your question<textarea name="question" required minLength={5} maxLength={2000} defaultValue={messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''} className="mt-1 block w-full rounded border border-line bg-paper p-2"/></label><label className="block text-sm">Your email<input ref={input} name="email" type="email" required className="mt-1 block w-full rounded border border-line bg-paper p-2"/></label><label className="block text-sm">Name (optional)<input name="name" className="mt-1 block w-full rounded border border-line bg-paper p-2"/></label><label className="block text-sm">Company (optional)<input name="company" className="mt-1 block w-full rounded border border-line bg-paper p-2"/></label><label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button disabled={busy} className="rounded bg-ink px-3 py-2 text-sm text-paper disabled:opacity-50">Send</button><button type="button" onClick={() => setAskOpen(false)} className="ml-3 text-sm text-muted underline">Cancel</button></form>}
          </div>
          {!askOpen && !tourStop && <form onSubmit={sendMessage} className="border-t border-line p-4"><label htmlFor="dee-question" className="mb-1 block font-mono text-xs text-muted">Ask Dee a question</label><div className="flex gap-2"><input id="dee-question" ref={input} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What has Deepak built?" className="min-w-0 flex-1 rounded border border-line bg-paper px-3 py-2 text-sm"/><button disabled={busy || !question.trim()} className="rounded bg-ink px-3 py-2 text-sm text-paper disabled:opacity-50">Send</button></div></form>}
        </section>
      </div>}
    </>
  )
}
