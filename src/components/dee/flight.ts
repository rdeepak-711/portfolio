import type { Pose } from '@/content/dee/types'

// One place Dee stands: at scroll position `s`, Dee's centre is at screen (x, y) at `scale`
export type Stop = { s: number; x: number; y: number; scale: number; pose: Pose }
export type Frame = { x: number; y: number; scale: number; tilt: number; pose: Pose }

// Base drawing box of the figure in px; scale multiplies it
export const DEE_BOX = 160

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
// Quintic smootherstep: still at both stops, most of the travel in the middle of the scroll gap
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Where Dee is for a given (smoothed) scroll position. Between stops he hops:
// x and y ease across, an upward arc lifts him, and he leans up to 8° the way he's going.
export function frameAt(stops: Stop[], s: number): Frame {
  if (stops.length === 0) return { x: 0, y: 0, scale: 0, tilt: 0, pose: 'explain' }
  if (s <= stops[0].s) return { ...pick(stops[0]), tilt: 0 }
  const last = stops[stops.length - 1]
  if (s >= last.s) return { ...pick(last), tilt: 0 }
  let k = 0
  while (k < stops.length - 2 && s >= stops[k + 1].s) k++
  const a = stops[k]
  const b = stops[k + 1]
  const t = clamp((s - a.s) / Math.max(1, b.s - a.s), 0, 1)
  const e = ease(t)
  const dx = b.x - a.x
  // the hop is taller when he crosses further, capped so it never leaves a short viewport
  const hop = Math.min(90, Math.abs(dx) * 0.12 + 24) * Math.sin(Math.PI * t)
  return {
    x: lerp(a.x, b.x, e),
    y: lerp(a.y, b.y, e) - hop,
    scale: lerp(a.scale, b.scale, e),
    tilt: dx === 0 ? 0 : 8 * Math.sin(Math.PI * t) * Math.sign(dx),
    pose: t < 0.5 ? a.pose : b.pose,
  }
}

const pick = (p: Stop) => ({ x: p.x, y: p.y, scale: p.scale, pose: p.pose })

// Frame-rate independent chase: settles in about half a second (rahulm.me measured 85 ms)
export function chase(current: number, target: number, dtMs: number, tauMs = 85) {
  return lerp(current, target, 1 - Math.exp(-dtMs / tauMs))
}

export type Layout = {
  vw: number
  vh: number
  maxScroll: number
  /** left edge of the content column, in px; the gutter is [0, contentLeft] and [contentRight, vw] */
  contentLeft: number
  contentRight: number
  /** page-space rects (top includes scroll) */
  heroDock: { top: number; left: number; width: number; height: number } | null
  contactDock: { top: number; left: number; width: number; height: number } | null
  sections: { id: string; top: number }[]
}

// Gutter narrower than this and Dee would sit on the text, so he switches to the phone walk
export const MIN_GUTTER = 136

const ROUTE: { id: string; pose: Pose }[] = [
  { id: 'project-factory', pose: 'check' },
  { id: 'project-crowdtracker', pose: 'check' },
  { id: 'project-gate', pose: 'code' },
  { id: 'outside', pose: 'check' },
  { id: 'how-i-work', pose: 'explain' },
  { id: 'experience', pose: 'explain' },
  { id: 'writing', pose: 'code' },
]

// Wide screens: big in the hero dock, then side to side through the gutters, landing beside the email
export function desktopStops(l: Layout): Stop[] {
  const gutter = Math.min(l.contentLeft, l.vw - l.contentRight)
  const scale = clamp((gutter - 24) / DEE_BOX, 0.5, 1.1)
  const side = (i: number) => (i % 2 === 0 ? l.contentRight + gutter / 2 : l.contentLeft - gutter / 2)
  const stops: Stop[] = []
  if (l.heroDock) {
    const d = l.heroDock
    stops.push({ s: 0, x: d.left + d.width / 2, y: d.top + d.height / 2, scale: clamp(Math.min(d.width, d.height) / DEE_BOX, 0.8, 1.6), pose: 'explain' })
  } else {
    stops.push({ s: 0, x: side(0), y: l.vh * 0.6, scale, pose: 'explain' })
  }
  ROUTE.forEach((r, i) => {
    const sec = l.sections.find((x) => x.id === r.id)
    if (!sec) return
    const s = clamp(sec.top - l.vh * 0.35, 0, l.maxScroll)
    if (s <= stops[stops.length - 1].s) return
    stops.push({ s, x: side(i), y: l.vh * 0.5, scale, pose: r.pose })
  })
  if (l.contactDock) {
    const d = l.contactDock
    // land when the dock is two-thirds down the screen, or at the bottom of the page if that comes first
    const s = clamp(d.top + d.height / 2 - l.vh * 0.62, 0, l.maxScroll)
    if (s > stops[stops.length - 1].s) stops.push({ s, x: d.left + d.width / 2, y: d.top + d.height / 2 - s, scale: 0.7, pose: 'explain' })
  }
  return stops
}

// Phones and narrow windows: no gutter, so Dee walks along the bottom edge as a progress marker,
// from the left corner toward the launcher, and only while the page is moving.
export function phoneStops(l: Layout, launcherLeft: number): Stop[] {
  const size = 76
  const y = l.vh - size / 2 - 18
  const start = 16 + size / 2
  const end = Math.max(start, launcherLeft - size / 2 - 12)
  const stops: Stop[] = [{ s: 0, x: start, y, scale: size / DEE_BOX, pose: 'explain' }]
  const route = ROUTE.map((r) => ({ ...r, top: l.sections.find((x) => x.id === r.id)?.top })).filter((r) => r.top !== undefined)
  route.forEach((r, i) => {
    const s = clamp(r.top! - l.vh * 0.5, 0, l.maxScroll)
    if (s <= stops[stops.length - 1].s) return
    stops.push({ s, x: lerp(start, end, (i + 1) / (route.length + 1)), y, scale: size / DEE_BOX, pose: r.pose })
  })
  if (l.maxScroll > stops[stops.length - 1].s) stops.push({ s: l.maxScroll, x: end, y, scale: size / DEE_BOX, pose: 'explain' })
  return stops
}

// Which way the plane points while it travels. `dir` is +1 scrolling down, −1 scrolling up, 0 still.
// facing 1 = nose right, −1 = nose left (the drawing is mirrored); angle is the CSS rotation in
// degrees applied after the mirror, so the nose ends up along facing·(cos, sin) of it. Clamped to
// ±30° so a steep hop still reads as a glide.
export function headingAt(stops: Stop[], s: number, dir: number): { facing: 1 | -1 | 0; angle: number } {
  if (dir === 0) return { facing: 0, angle: 0 }
  const a = frameAt(stops, s)
  const b = frameAt(stops, s + 4 * Math.sign(dir))
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.hypot(dx, dy) < 0.05) return { facing: 0, angle: 0 }
  const facing = Math.abs(dx) < 0.02 ? 0 : dx > 0 ? 1 : -1
  // nose-right: atan2(dy, dx); mirrored nose-left: atan2(−dy, −dx); purely vertical: tip 30° toward travel
  const deg = facing === 0 ? (dy > 0 ? 30 : -30) : (Math.atan2(facing * dy, facing * dx) * 180) / Math.PI
  return { facing, angle: clamp(deg, -30, 30) }
}
