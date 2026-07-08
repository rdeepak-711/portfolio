import Link from "next/link";
import { profile } from "@/lib/data/profile";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line no-reader">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-ink-faint">
          <span className="text-accent-ink">$</span> {profile.location} · {profile.timezone} ·{" "}
          {profile.availability}
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a href={`mailto:${profile.email}`} className="text-ink-soft hover:text-accent-ink">
            Email
          </a>
          <a href={profile.links.github} className="text-ink-soft hover:text-accent-ink" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.links.linkedin} className="text-ink-soft hover:text-accent-ink" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <Link href="/projects" className="text-ink-soft hover:text-accent-ink">
            Work
          </Link>
        </div>
      </div>
    </footer>
  );
}
