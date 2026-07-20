'use client'

import { useState } from 'react'
import { embedUrl, thumbnailUrl } from '@/content/videos'

type Props = {
  youtubeId: string
  title: string
}

/**
 * Facade embed: paints a thumbnail and only mounts the YouTube iframe after a
 * click. Six eager iframes on one page costs ~megabytes and several hundred ms
 * of main-thread work; this keeps /building as cheap as the rest of the site.
 */
export function LiteYouTube({ youtubeId, title }: Props) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative aspect-[9/16] w-full overflow-hidden border border-line bg-ink">
        <iframe
          src={embedUrl(youtubeId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
      className="group relative block aspect-[9/16] w-full cursor-pointer overflow-hidden border border-line bg-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CDN thumbnail, already sized; next/image adds a remote-pattern config for no gain */}
      <img
        src={thumbnailUrl(youtubeId)}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300 group-hover:brightness-[1.03]"
      />
      <span
        aria-hidden
        className="absolute bottom-3 left-3 inline-flex items-center gap-2 border border-line bg-paper/95 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink"
      >
        <span className="text-accent">▶</span> play
      </span>
    </button>
  )
}
