import { describe, it, expect } from 'vitest'
import { chase, desktopStops, ease, frameAt, headingAt, phoneStops, type Layout, type Stop } from './flight'

const layout = (over: Partial<Layout> = {}): Layout => ({
  vw: 1440, vh: 900, maxScroll: 8000, contentLeft: 228, contentRight: 1212,
  heroDock: { top: 300, left: 900, width: 288, height: 320 },
  contactDock: { top: 8500, left: 700, width: 64, height: 64 },
  sections: [
    { id: 'project-factory', top: 1000 }, { id: 'project-crowdtracker', top: 2200 }, { id: 'project-gate', top: 3200 },
    { id: 'outside', top: 4300 }, { id: 'how-i-work', top: 5200 }, { id: 'experience', top: 6000 }, { id: 'writing', top: 7000 },
  ],
  ...over,
})

describe('frameAt', () => {
  const stops: Stop[] = [{ s: 0, x: 100, y: 400, scale: 1, pose: 'explain' }, { s: 1000, x: 1300, y: 450, scale: 0.6, pose: 'code' }]

  it('stands exactly on a stop, upright, at either end and beyond', () => {
    expect(frameAt(stops, -50)).toEqual({ x: 100, y: 400, scale: 1, tilt: 0, pose: 'explain' })
    expect(frameAt(stops, 5000)).toEqual({ x: 1300, y: 450, scale: 0.6, tilt: 0, pose: 'code' })
  })

  it('hops up, leans the way he is going, and swaps pose halfway', () => {
    const mid = frameAt(stops, 500)
    expect(mid.x).toBeCloseTo(700)
    expect(mid.y).toBeLessThan(425 - 20) // above the straight line: a hop
    expect(mid.tilt).toBeCloseTo(8)
    expect(frameAt(stops, 400).pose).toBe('explain')
    expect(frameAt(stops, 600).pose).toBe('code')
    const back = frameAt([...stops].reverse().map((p, i) => ({ ...p, s: i * 1000 })), 500)
    expect(back.tilt).toBeCloseTo(-8)
  })

  it('never leans more than 8°', () => {
    for (let s = 0; s <= 1000; s += 25) expect(Math.abs(frameAt(stops, s).tilt)).toBeLessThanOrEqual(8)
  })
})

describe('ease and chase', () => {
  it('eases from still to still', () => {
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
    expect(ease(0.05)).toBeLessThan(0.01)
  })

  it('catches up regardless of frame rate', () => {
    let a = 0, b = 0
    for (let i = 0; i < 30; i++) a = chase(a, 100, 1000 / 60)
    for (let i = 0; i < 15; i++) b = chase(b, 100, 1000 / 30)
    expect(a).toBeCloseTo(b, 5)
    expect(a).toBeGreaterThan(99) // settled within half a second
  })
})

describe('desktopStops', () => {
  it('starts in the hero dock, alternates gutters, and lands on the contact dock', () => {
    const l = layout()
    const stops = desktopStops(l)
    expect(stops[0]).toMatchObject({ s: 0, x: 1044, y: 460 })
    expect(stops[0].scale).toBeGreaterThan(1)
    const middle = stops.slice(1, -1)
    expect(middle).toHaveLength(7)
    middle.forEach((p, i) => {
      const inRight = p.x > l.contentRight, inLeft = p.x < l.contentLeft
      expect(i % 2 === 0 ? inRight : inLeft, `stop ${i}`).toBe(true)
    })
    const last = stops[stops.length - 1]
    expect(last.x).toBe(732)
    expect(last.s).toBeLessThanOrEqual(l.maxScroll)
  })

  it('keeps Dee inside the gutter', () => {
    const l = layout({ contentLeft: 160, contentRight: 1280 })
    for (const p of desktopStops(l).slice(1, -1)) expect(80 * p.scale * 2).toBeLessThanOrEqual(160)
  })

  it('keeps stop scroll positions strictly increasing even when sections are short', () => {
    const l = layout({ sections: [{ id: 'project-factory', top: 10 }, { id: 'project-crowdtracker', top: 20 }, { id: 'outside', top: 2000 }] })
    const s = desktopStops(l).map((p) => p.s)
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1])
  })
})

describe('phoneStops', () => {
  it('walks along the bottom edge from the left toward the launcher', () => {
    const l = layout({ vw: 390, vh: 844, contentLeft: 12, contentRight: 378, heroDock: null })
    const stops = phoneStops(l, 270)
    const xs = stops.map((p) => p.x)
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1])
    expect(Math.max(...xs) + 26).toBeLessThanOrEqual(270)
    expect(new Set(stops.map((p) => p.y)).size).toBe(1)
    expect(stops[stops.length - 1].s).toBe(l.maxScroll)
  })
})

describe('DeeFlight mount', () => {
  it('renders nothing, without throwing, where matchMedia or ResizeObserver is missing', async () => {
    const { render } = await import('@testing-library/react')
    const { default: DeeFlight } = await import('./DeeFlight')
    const { container } = render(<DeeFlight />)
    expect(container.querySelector('[data-dee-flight]')).toBeNull()
  })
})

describe('headingAt', () => {
  const stops: Stop[] = [{ s: 0, x: 1300, y: 450, scale: 1, pose: 'explain' }, { s: 1000, x: 100, y: 450, scale: 1, pose: 'code' }]

  it('points the nose the way the plane is going, both scroll directions', () => {
    expect(headingAt(stops, 500, 1).facing).toBe(-1)
    expect(headingAt(stops, 500, -1).facing).toBe(1)
  })

  // after mirror + rotate, the nose points along facing·(cos θ, sin θ); screen y grows downward
  const noseY = (h: { facing: number; angle: number }) => h.facing * Math.sin((h.angle * Math.PI) / 180)

  it('climbs on the way up the hop and dives on the way down', () => {
    expect(noseY(headingAt(stops, 250, 1))).toBeLessThan(0)
    expect(noseY(headingAt(stops, 750, 1))).toBeGreaterThan(0)
    const back = [...stops].reverse().map((p, i) => ({ ...p, s: i * 1000 }))
    expect(noseY(headingAt(back, 250, 1))).toBeLessThan(0)
    for (let s = 10; s < 1000; s += 40) expect(Math.abs(headingAt(stops, s, 1).angle)).toBeLessThanOrEqual(30)
  })

  it('has no heading when still or parked at a stop', () => {
    expect(headingAt(stops, 500, 0)).toEqual({ facing: 0, angle: 0 })
    expect(headingAt(stops, 2000, 1)).toEqual({ facing: 0, angle: 0 })
  })
})
