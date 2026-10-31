'use client'

import { useEffect, useRef, useState } from 'react'
import type { Pose } from '@/content/dee/types'
import DeeFigure from './DeeFigure'
import { chase, DEE_BOX, desktopStops, frameAt, MIN_GUTTER, phoneStops, type Layout, type Stop } from './flight'

const POSES: Pose[] = ['explain', 'check', 'code']
const SECTION_IDS = ['project-factory', 'project-crowdtracker', 'project-gate', 'outside', 'how-i-work', 'experience', 'writing', 'contact']
// how long the page must sit still before the phone walker tucks away
const IDLE_MS = 1400
const TRAIL_MS = 420

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

// The travelling Dee: one fixed figure that follows the scroll from the hero to the contact
// section. Purely decorative, so it is hidden from assistive tech and never takes clicks.
export default function DeeFlight() {
  const [mode, setMode] = useState<'off' | 'still' | 'fly'>('off')
  const body = useRef<HTMLDivElement>(null)
  const trail = useRef<SVGPolylineElement>(null)
  const figures = useRef<Record<Pose, HTMLDivElement | null>>({ explain: null, check: null, code: null })

  useEffect(() => {
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
    let current = window.scrollY
    let lastT = performance.now()
    let lastScrollAt = -Infinity
    let lastY = window.scrollY
    let shown: Pose | null = null
    let raf = 0
    const points: { x: number; y: number; t: number }[] = []

    const relayout = () => {
      const m = measure()
      phone = m.phone
      stops = phone ? phoneStops(m.layout, m.launcherLeft) : desktopStops(m.layout)
    }

    const draw = (now: number) => {
      const el = body.current
      if (!el) return
      const dt = Math.min(64, now - lastT)
      lastT = now
      const y = window.scrollY
      if (y !== lastY) { lastScrollAt = now; lastY = y }
      current = mode === 'still' ? 0 : chase(current, y, dt)
      const f = frameAt(stops, current)
      // reduced motion: Dee stays printed on the hero, scrolling away with the page like any figure
      if (mode === 'still') f.y -= y
      const moving = Math.abs(y - current) > 0.5
      // a small walking bob while catching up, nothing when settled
      const bob = moving ? Math.sin(now / 70) * 2.5 : 0
      const size = DEE_BOX * f.scale
      // phones: show only while the page moves, so it never sits on text (the launcher is always there)
      const idle = phone && (mode === 'still' || now - lastScrollAt > IDLE_MS)
      el.style.transform = `translate3d(${f.x - size / 2}px, ${f.y - size / 2 + bob}px, 0) rotate(${f.tilt}deg)`
      el.style.width = el.style.height = `${size}px`
      el.style.opacity = stops.length === 0 || idle ? '0' : '1'
      if (f.pose !== shown) {
        for (const p of POSES) figures.current[p]?.style.setProperty('opacity', p === f.pose ? '1' : '0')
        shown = f.pose
      }
      // footprints: a dotted line through where Dee was in the last ~0.4 s
      points.push({ x: f.x, y: f.y + size * 0.42, t: now })
      while (points.length && now - points[0].t > TRAIL_MS) points.shift()
      trail.current?.setAttribute('points', idle ? '' : points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))
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
      <div ref={body} className="dee-flight absolute left-0 top-0 origin-bottom transition-opacity duration-300 will-change-transform" style={{ opacity: 0 }}>
        {POSES.map((p) => <div key={p} ref={(n) => { figures.current[p] = n }} className="absolute inset-0 transition-opacity duration-200" style={{ opacity: 0 }}><DeeFigure pose={p} className="h-full w-full"/></div>)}
      </div>
    </div>
  )
}
