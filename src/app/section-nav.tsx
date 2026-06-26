"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
];

export default function SectionNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // a section becomes "active" when it crosses the upper-middle band
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.1em] sm:flex">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={`transition-colors hover:text-accent ${
            active === s.id ? "text-ink" : "text-muted"
          }`}
        >
          {s.label}
        </a>
      ))}
      <a
        href="/deepak-ramesh-resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent transition-opacity hover:opacity-70"
      >
        Résumé ↗
      </a>
    </nav>
  );
}
