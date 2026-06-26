import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scaling site production 5 → 32 in 4 weeks · Deepak Ramesh",
  description:
    "How I built a multi-agent content pipeline on Celery + Redis that scaled WordPress site production from 5 to 32 sites in 4 weeks — and treated LLM output as untrusted by default.",
  openGraph: {
    title: "Scaling site production 5 → 32 in 4 weeks",
    description:
      "The multi-agent content pipeline — the single-agent failure that forced the split, the Celery/Redis backbone, and treating LLM output as untrusted.",
    type: "article",
  },
};

function H({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
      <span className="text-accent">§ {no}</span> — {children}
    </h2>
  );
}

const METRICS = [
  ["5 → 32", "sites in 4 weeks"],
  ["₹1L+", "commission, month one"],
  ["4–10 days → hours", "per-site build time"],
  ["1,200–1,800", "pages / month"],
];

export default function CaseStudy() {
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
        Case Study · Firestorm Internet
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
        Scaling site production 5 → 32 in 4 weeks.
      </h1>
      <p className="mt-6 max-w-[60ch] text-lg text-muted">
        A multi-agent content pipeline on an async queue that took site
        production from a manual, days-per-site crawl to 32 published sites in a
        month — while keeping a human in the loop where the AI was least
        trustworthy.
      </p>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {METRICS.map(([v, k]) => (
          <div key={k} className="bg-paper p-4">
            <dt className="font-display text-xl font-semibold tracking-[-0.02em]">{v}</dt>
            <dd className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">{k}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-5 text-ink/85">
        <H no="01">The problem</H>
        <p>
          The business runs on volume: many niche WordPress sites, each needing
          a configured theme, plugins, design, and a body of written content.
          Built by hand, a single site took 4–10 days — provisioning, plugin
          setup, design, then writing and publishing dozens of pages. That
          didn&apos;t scale to the targets, and most of the work was mechanical.
        </p>

        <H no="02">The pipeline</H>
        <p>
          I built an end-to-end pipeline (Python + Bash + WP-CLI) that takes a
          blank WordPress install and produces a configured, content-populated,
          publish-ready site: path discovery and SSH checks, plugin cleanup and
          install, premium license activation, design customization (logo,
          colors, typography) via WP-CLI, layout and elements import, indexing
          settings, AI article generation over templates, image sourcing and
          interlinking, then publishing. The only human step left is a final
          image review.
        </p>

        <H no="03">The multi-agent turn</H>
        <p>
          My first version used a single agent to do both the writing and the
          HTML/template generation. It was unreliable — the model juggling two
          jobs produced worse output on both. So I split it: one agent (Claude)
          owns content creation, a second path (Python + Claude) owns
          HTML/template generation. Quality jumped once each agent had a single
          responsibility. That &quot;one agent, one job&quot; lesson is the core
          of how I design agent systems now.
        </p>

        <H no="04">Treating the LLM as untrusted</H>
        <p>
          LLM output is untrusted by default in this system. Every model
          response is validated against the structure I expect; malformed
          responses are retried before anything moves downstream. And I kept a
          deliberate human gate exactly where the AI was least reliable and a
          wrong output going live was most costly — image selection. Knowing
          when <em>not</em> to automate is as much the design as the automation.
        </p>

        <H no="05">The async backbone</H>
        <p>
          Generation, image fetching, and publishing are long-running and
          failure-prone, so they don&apos;t run inline. I built an async job
          queue on Celery + Redis: every task is a durable worker with retry
          policies, exponential backoff, and dead-letter queues, so a transient
          API failure costs a retry, not a run. The same backbone powers an
          internal contact-management tool that aggregates enquiries across 40+
          sites.
        </p>

        <H no="06">Outcome</H>
        <p>
          The pipeline scaled production from 5 to 32 sites in 4 weeks and drove
          ₹1L+ in affiliate commission in the first month, with per-site build
          time dropping from days to a few hours and throughput reaching
          1,200–1,800 pages a month. The whole thing is containerized and
          shipped through Google Cloud Build on GCP.
        </p>

        <H no="07">What I&apos;d do next</H>
        <p>
          Add an eval layer that scores generated content before publish (not
          just schema-validates it), so quality is measured, not assumed; widen
          the human gate into a lightweight review queue with quality signals;
          and add per-task observability — token cost, latency, retry rates —
          to tune the pipeline on data rather than intuition.
        </p>
      </div>

      <div className="mt-16 border-t border-line pt-8">
        <Link
          href="/#contact"
          className="group inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 transition-colors hover:text-accent"
        >
          Get in touch
          <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
            ↗
          </span>
        </Link>
      </div>
    </main>
  );
}
