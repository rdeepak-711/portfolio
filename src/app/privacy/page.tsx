import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy · Codephilic publisher',
  description: 'What the Codephilic publisher can access, where it keeps it, and how to revoke it.',
}

// Linked from the Google OAuth consent screen of the codephilic-analytics project.
const SECTIONS = [
  {
    h: 'What it is',
    p: 'The Codephilic publisher is a script I run on my own laptop. It uploads my own videos to my own YouTube channel (Codephilic Studio) on a schedule and reads my own channel’s details and analytics. It has no other users.',
  },
  {
    h: 'What it accesses',
    p: 'Only the Google account that signs in to it, which is mine. It asks for permission to upload videos and to read channel details and analytics. It does not read email, contacts, files or anyone else’s data.',
  },
  {
    h: 'Where data is kept',
    p: 'The sign-in token is stored in a private folder on my laptop. Nothing is sent to any server of mine or to any third party. No data is sold, shared or used for advertising.',
  },
  {
    h: 'Google API data',
    p: 'Use of information received from Google APIs follows the Google API Services User Data Policy, including the Limited Use requirements.',
  },
  {
    h: 'Revoking access',
    p: 'Access can be removed at any time at myaccount.google.com/permissions. Deleting the token on the laptop also stops the script.',
  },
]

export default function Privacy() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back
      </Link>

      <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]">
        Privacy
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
        Codephilic publisher.
      </h1>

      <div className="mt-12 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.h} className="max-w-[62ch]">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
        <p className="max-w-[62ch] leading-relaxed text-muted">
          Questions: <a className="text-accent hover:underline" href="mailto:deepakrameshh@gmail.com">deepakrameshh@gmail.com</a>
        </p>
        <p className="font-mono text-xs text-muted">Updated 27 Oct 2026</p>
      </div>
    </main>
  )
}
