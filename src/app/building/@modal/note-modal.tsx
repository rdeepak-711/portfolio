'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Overlay shell for an intercepted note.
 *
 * The note still lives at its own URL — this only changes how it appears when
 * you arrive from /building. Direct visits, refreshes and shared links render
 * the full page instead, so the animation never costs us an indexable article.
 */
export function NoteModal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    document.addEventListener('keydown', onKey)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    sheetRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [router])

  return (
    <div
      className="overlay-in fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/25 px-4 py-8 backdrop-blur-[2px] sm:py-16"
      onClick={() => router.back()}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Note"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="sheet-in relative w-full max-w-3xl border border-line bg-paper shadow-[0_18px_60px_-20px_oklch(0.20_0.012_75/0.35)] outline-none"
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close note"
          className="absolute right-3 top-3 z-10 border border-line bg-paper px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-accent"
        >
          Esc ✕
        </button>
        {children}
      </div>
    </div>
  )
}
