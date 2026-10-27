import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies · Deepak Ramesh",
  description:
    "Deep-dives on the systems I've built — an AI content pipeline and the enterprise automations around an email classifier.",
};

const STUDIES = [
  {
    no: "01",
    title: "Scaling site production 5 → 32 in 4 weeks",
    org: "Firestorm Internet",
    href: "/case-study/firestorm-pipeline",
    blurb:
      "The single-prompt failure that forced the split into stages, the human gate on images, and the review agents that removed the next bottleneck.",
  },
  {
    no: "02",
    title: "Routing 10K+ emails a month into SAP and ServiceNow",
    org: "UiPath",
    href: "/case-study/uipath-ml",
    blurb:
      "Building the automations around a Communications Mining classifier, wiring its output into SAP and ServiceNow, and lifting enterprise workflow throughput by 70%.",
  },
];

export default function CaseStudies() {
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
        Case Studies
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
        Systems I&apos;ve built, end to end.
      </h1>

      <div className="mt-12 flex flex-col gap-10">
        {STUDIES.map((s) => (
          <Link
            key={s.no}
            href={s.href}
            className="group block border-t border-line pt-6"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-sm text-accent">{s.no}</span>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">
                {s.title}
              </h2>
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {s.org}
              </span>
            </div>
            <p className="mt-3 max-w-[66ch] pl-[1.7rem] text-muted">{s.blurb}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 pl-[1.7rem] font-mono text-xs uppercase tracking-[0.1em] text-ink transition-colors group-hover:text-accent">
              Read <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
