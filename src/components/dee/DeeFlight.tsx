'use client'

import { useEffect, useRef, useState } from 'react'
import { chase, DEE_BOX, desktopStops, frameAt, headingAt, MIN_GUTTER, phoneStops, type Layout, type Stop } from './flight'
import { LandedDee, PLANE_ASPECT, PlaneRider } from './PlaneRider'

const SECTION_IDS = ['project-factory', 'project-crowdtracker', 'project-gate', 'outside', 'how-i-work', 'experience', 'writing', 'contact']
// how long the page must sit still before the phone plane tucks away
const IDLE_MS = 1400
const TRAIL_MS = 420
// how long the plane must hover before Dee waves
const WAVE_AFTER_MS = 350

function rectOf(el: Element | null) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 || r.height === 0) return null
  return { top: r.top + window.scrollY, left: r.left, width: r.width, height: r.height }
}

function measure(): { layout: Layout; phone: boolean; launcherLeft: number } {
  const main = document.querySelector('main')
  const box = main?.getBoundingClientRect()
  const pad = main ? parseFloat(getComputedStyle(main).paddingLeft) || 0 : 0
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const contentLeft = box ? box.left + pad * 0.5 : 0
  const contentRight = box ? box.right - pad * 0.5 : vw
  const layout: Layout = {
    vw,
    vh,
    maxScroll: Math.max(0, document.documentElement.scrollHeight - vh),
    contentLeft,
    contentRight,
    heroDock: rectOf(document.querySelector('[data-dee-dock="hero"]')),
    contactDock: rectOf(document.querySelector('[data-dee-dock="contact"]')),
    sections: SECTION_IDS.map((id) => ({ id, top: rectOf(document.getElementById(id))?.top })).filter((s): s is { id: string; top: number } => s.top !== undefined),
  }
  const launcher = document.querySelector('.dee-launcher')?.getBoundingClientRect()
  return { layout, phone: Math.min(contentLeft, vw - contentRight) < MIN_GUTTER, launcherLeft: launcher?.left ?? vw - 120 }
}

// The travelling Dee: he rides a paper plane folded from a build-log page, from the hero down to
// the contact section, where he hops off beside the email. Decorative, so hidden from assistive
// tech and never takes clicks.
export default function DeeFlight() {
  const [mode, setMode] = useState<'off' | 'still' | 'fly'>('off')
  const body = useRef<HTMLDivElement>(null)
  const mirror = useRef<HTMLDivElement>(null)
  const trail = useRef<SVGPolylineElement>(null)

  useEffect(() => {
    // no measuring tools (old browsers, jsdom): the launcher Dee is enough
    if (typeof window.matchMedia !== 'function' || typeof ResizeObserver === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pick = () => setMode(reduce.matches ? 'still' : 'fly')
    pick()
    reduce.addEventListener('change', pick)
    return () => reduce.removeEventListener('change', pick)
  }, [])

  useEffect(() => {
    if (mode === 'off') return
    let stops: Stop[] = []
    let phone = false
    let landing = false
    let vw = 0
    let current = window.scrollY
    let lastT = performance.now()
    let lastScrollAt = -Infinity
    let settledSince = performance.now()
    let lastY = window.scrollY
    let facing: 1 | -1 = -1
    let angle = 0
    let raf = 0
    const points: { x: number; y: number; t: number }[] = []

    const relayout = () => {
      const m = measure()
      phone = m.phone
      vw = m.layout.vw
      landing = !phone && m.layout.contactDock !== null
      stops = phone ? phoneStops(m.layout, m.launcherLeft) : desktopStops(m.layout)
    }

    const draw = (now: number) => {
      const el = body.current
      const inner = mirror.current
      if (!el || !inner) return
      const dt = Math.min(64, now - lastT)
      lastT = now
      const y = window.scrollY
      if (y !== lastY) { lastScrollAt = now; lastY = y }
      current = mode === 'still' ? 0 : chase(current, y, dt)
      const f = frameAt(stops, current)
      // reduced motion: Dee stays printed on the hero, scrolling away with the page like any figure
      if (mode === 'still') f.y -= y
      const gap = y - current
      const moving = mode === 'fly' && Math.abs(gap) > 0.5
      if (moving) settledSince = now
      const h = headingAt(stops, current, moving ? Math.sign(gap) : 0)
      // face where it's going; when hovering, face the text so Dee looks at what he's pointing at
      if (h.facing !== 0) facing = h.facing
      else if (!moving) facing = phone || f.x < vw / 2 ? 1 : -1
      angle = chase(angle, h.angle, dt, 120)
      const w = DEE_BOX * f.scale
      const ht = w * PLANE_ASPECT
      // a glider never quite sits still: slow float, slight rock
      const float = mode === 'fly' ? Math.sin(now / 700) * 3 : 0
      const rock = mode === 'fly' ? Math.sin(now / 900) * 1.5 : 0
      const idle = phone && (mode === 'still' || now - lastScrollAt > IDLE_MS)
      const last = stops[stops.length - 1]
      const landed = landing && !moving && last !== undefined && current >= last.s - 2
      el.style.transform = `translate3d(${f.x - w / 2}px, ${f.y - ht / 2 + float}px, 0) rotate(${landed ? 0 : angle + rock}deg)`
      el.style.width = `${w}px`
      el.style.height = `${ht}px`
      el.style.opacity = stops.length === 0 || idle ? '0' : '1'
      inner.style.transform = `scaleX(${landed ? 1 : facing})`
      el.dataset.landed = String(landed)
      el.dataset.settled = String(!moving && now - settledSince > WAVE_AFTER_MS)
      // dotted trail from the plane's tail over the last ~0.4 s
      points.push({ x: f.x - facing * w * 0.42, y: f.y + ht * 0.05 + float, t: now })
      while (points.length && now - points[0].t > TRAIL_MS) points.shift()
      trail.current?.setAttribute('points', idle || landed ? '' : points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))
      if (mode === 'fly') raf = requestAnimationFrame(draw)
    }

    relayout()
    // sections grow as images load and fonts swap, so re-measure on any size change
    const ro = new ResizeObserver(() => { relayout(); if (mode === 'still') draw(performance.now()) })
    ro.observe(document.body)
    window.addEventListener('resize', relayout)
    const onScroll = () => { if (mode === 'still') draw(performance.now()) }
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', relayout)
      window.removeEventListener('scroll', onScroll)
    }
  }, [mode])

  if (mode === 'off') return null
  return (
    <div aria-hidden="true" data-dee-flight={mode} className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {mode === 'fly' && <svg className="absolute inset-0 h-full w-full"><polyline ref={trail} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 9" opacity="0.4"/></svg>}
      <div ref={body} className="dee-flight absolute left-0 top-0 transition-opacity duration-300 will-change-transform" style={{ opacity: 0 }}>
        <div ref={mirror} className="dee-flight-mirror relative h-full w-full">
          <PlaneRider className="dee-flight-plane absolute inset-0 h-full w-full"/>
          <LandedDee className="dee-flight-landed absolute inset-0 h-full w-full"/>
        </div>
      </div>
    </div>
  )
}
