/**
 * Published video content, mirrored from the codephilic studio.
 *
 * Source of truth for the files themselves is
 * `My Drive/projects/codephilic/videos/<lane>/<slug>/`.
 * Only videos that are actually LIVE on YouTube belong here — this array
 * drives /building, and a dead embed is worse than an absent one.
 */

export type Lane = 'claude-code' | 'study' | 'news' | 'longform'

export type Video = {
  /** stable url-safe key, matches the codephilic folder slug */
  slug: string
  lane: Lane
  /** 11-char YouTube id */
  youtubeId: string
  title: string
  /** one honest line — what the viewer actually gets */
  blurb: string
  /** ISO publish date */
  date: string
  /** site-relative path to the written version, once it exists */
  article?: string
}

/**
 * Lanes rendered on /building, in display order.
 * A lane only appears here once it has published content — the test suite
 * enforces that every lane used by a video is declared, so adding a video
 * in a new lane forces a deliberate decision about where it surfaces.
 */
export const LANES: ReadonlyArray<{ id: Lane; label: string; note: string }> = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    note: 'Skills and workflows I actually use day to day.',
  },
  {
    id: 'study',
    label: 'Fundamentals',
    note: 'What I hit while drilling DSA — the non-obvious part, not the walkthrough.',
  },
  {
    id: 'news',
    label: 'AI dev news',
    note: 'What shipped this week, and what it changes for developers.',
  },
]

export const VIDEOS: ReadonlyArray<Video> = [
  {
    slug: 'two-sum-ordering',
    lane: 'study',
    youtubeId: 'RjiBZ7o5_qY',
    title: 'Two Sum: the two lines everyone gets backwards',
    blurb:
      'The hash map is the easy part. Check for the complement before you store, or a number matches itself.',
    date: '2026-07-20',
    article: '/writing/two-sum-ordering',
  },
  {
    slug: 'gpt-5-6-copilot',
    lane: 'news',
    youtubeId: 'L1claTCnFE8',
    title: "GPT-5.6 shipped — and it's in Copilot",
    blurb: 'What actually changed for developers, without the launch-post adjectives.',
    date: '2026-07-18',
  },
  {
    slug: 'caveman',
    lane: 'claude-code',
    youtubeId: 'ozUMkwIDjuc',
    title: 'A free skill that makes Claude Code answers way shorter',
    // honesty: /caveman compresses prose replies only. It does NOT shrink code
    // blocks or input context, and the token-savings claim did NOT survive
    // measurement. Never restate this as "cheaper" or "saves tokens".
    blurb: 'Compresses the prose in Claude’s replies. Shorter answers — not a smaller token bill.',
    date: '2026-07-17', // confirmed in YouTube Studio
    article: '/writing/caveman-shorter-not-cheaper',
  },
  {
    slug: 'code-review',
    lane: 'claude-code',
    youtubeId: '_-J1Dc4jvvg',
    title: 'Five agents caught the bug my code reviewer approved',
    blurb: 'Parallel review agents, each with a different lens, run over the same diff.',
    date: '2026-07-13', // TODO(deepak): confirm exact publish date
  },
  {
    slug: 'grill-me',
    lane: 'claude-code',
    youtubeId: 'cJJQY0jOeUQ',
    title: 'grill-me + grill-with-docs, bundled into one skill',
    blurb: 'Get your plan interrogated — against your assumptions and against real docs — before you build.',
    date: '2026-07-02',
  },
  {
    slug: 'superpowers',
    lane: 'claude-code',
    youtubeId: 'LMmOjiQv-1E',
    title: 'Claude Code plugin superpowers',
    blurb: 'The plugin setup that turned Claude Code into the environment I build in.',
    date: '2026-06-24', // TODO(deepak): confirm exact publish date
  },
]

const byNewest = (a: Video, b: Video) => Date.parse(b.date) - Date.parse(a.date)

/**
 * A scheduled YouTube video stays private until its slot, so embedding it
 * early paints a dead player. Entries may therefore be added ahead of time
 * with their scheduled date — they surface on their own once the date passes
 * and the site is rebuilt.
 */
export function isLive(video: Video, now: Date = new Date()): boolean {
  return Date.parse(video.date) <= now.getTime()
}

/** Live videos in one lane, newest first. */
export function videosByLane(lane: Lane, now: Date = new Date()): Video[] {
  return VIDEOS.filter((v) => v.lane === lane && isLive(v, now)).sort(byNewest)
}

/** YouTube's image CDN — used so the grid loads without any iframe. */
export function thumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
}

export function watchUrl(youtubeId: string): string {
  return `https://www.youtube.com/shorts/${youtubeId}`
}

export function embedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`
}
