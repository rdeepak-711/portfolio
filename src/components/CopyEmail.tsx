'use client'

import { useEffect, useState } from 'react'

export default function CopyEmail({ email }: { email: string }) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(''), 2000)
    return () => window.clearTimeout(timeout)
  }, [message])

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(email)
      setMessage('Copied')
    } catch {
      setMessage('Copy failed — select the address above')
    }
  }

  return <div className="flex flex-wrap items-center gap-3">
    <button type="button" onClick={copyEmail} className="rounded border border-line px-3 py-2 font-mono text-xs text-ink hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Copy email</button>
    {/* always mounted, so screen readers announce the change */}
    <span role="status" aria-live="polite" className="font-mono text-xs text-muted">{message}</span>
  </div>
}
