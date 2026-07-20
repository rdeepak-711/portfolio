import { GoogleAnalytics } from '@next/third-parties/google'

const PLACEHOLDER = /^G-X+$/i
const GA4_ID = /^G-[A-Z0-9]{6,}$/i

/**
 * Whether a configured value is a usable GA4 measurement id.
 * Pure so it can be tested directly — the script mounting itself is Next's
 * concern, not ours.
 */
export function isValidGaId(raw: string | undefined): boolean {
  const id = raw?.trim()
  if (!id) return false
  if (PLACEHOLDER.test(id)) return false
  return GA4_ID.test(id)
}

/**
 * GA4, gated on `NEXT_PUBLIC_GA_ID`.
 *
 * Renders nothing unless a real measurement id is configured, so the site
 * behaves identically before analytics exists and no script loads in local
 * dev or previews where the var is unset.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim()
  if (!isValidGaId(id)) return null
  return <GoogleAnalytics gaId={id as string} />
}
