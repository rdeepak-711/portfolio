"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReader } from "@/lib/reader-context";
import { profile } from "@/lib/data/profile";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const { reader, toggle } = useReader();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md no-reader">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          <span className="text-accent-ink">~/</span>deepak
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active ? "text-ink" : "text-ink-faint hover:text-ink"
                }`}
              >
                {l.label}
                {active && <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-accent align-middle" />}
              </Link>
            );
          })}

          <button
            onClick={toggle}
            aria-pressed={reader}
            title="Reader mode — plain text, easy to read"
            className={`ml-1 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
              reader
                ? "border-accent-ink bg-accent/10 text-accent-ink"
                : "border-line text-ink-faint hover:border-ink-soft hover:text-ink"
            }`}
          >
            {reader ? "reader: on" : "reader"}
          </button>
        </div>
      </nav>
      <span className="sr-only">{profile.name}</span>
    </header>
  );
}
