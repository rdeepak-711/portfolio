import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scaling site production 5 → 32 in 4 weeks · Deepak Ramesh",
  description:
    "How I built the AI content pipeline (Python, Bash, WP-CLI, Claude) that took Firestorm's site production from about 5 a month to 32 in four weeks, with a human gate where the model was least reliable.",
  openGraph: {
    title: "Scaling site production 5 → 32 in 4 weeks",
    description:
      "The single-prompt failure that forced the split into stages, the human gate on images, and the review agents that removed the next bottleneck.",
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
  ["68 of 117", "network sites built"],
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
        An AI content pipeline that took site production from a manual,
        days-per-site job to 32 published sites in a month, while keeping a
        human in the loop where the model was least reliable.
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
          I built an end-to-end pipeline in Python, Bash and WP-CLI, with
          Claude doing the writing, designed and built with Claude Code. It
          generates the content, sources images from GetYourGuide, and sets up
          and deploys each WordPress site through WP-CLI. The only human step
          left is image selection.
        </p>

        <H no="03">The multi-agent turn</H>
        <p>
          My first version used a single prompt to do both the writing and the
          HTML and template generation, and it failed on quality: the model
          juggling two jobs did worse at both. So I split it into separate LLM
          stages: content first, then HTML and templates, with Python between
          them. Quality went up once each stage had one job. That &quot;one
          stage, one job&quot; lesson is how I design agent systems now.
        </p>

        <H no="04">Where the human stays</H>
        <p>
          I kept a deliberate human gate on image selection, because that is
          where the model was least reliable and a wrong image going live cost
          the most. Everything mechanical around it is automated. Knowing when
          <em> not</em> to automate is as much the design as the automation.
        </p>

        <H no="05">The next bottleneck: review</H>
        <p>
          Once the pipeline was building sites fast, first-run review that used
          to be spread across five writers all landed on me. I fixed that with a
          review template, an agent that reads the writers&apos; review and
          turns it into todos, and a second agent that reads the code, decides
          whether each issue is an exception or a code bug, and fixes it. One
          review round went from a few hours to under 45 minutes. Every fix was
          checked twice: I read the agent&apos;s fix, then the writers reviewed
          the output on the re-run.
        </p>

        <H no="06">Outcome</H>
        <p>
          Per-site build time fell from 4–10 days to a few hours. Production
          went from about 5 sites a month to 32 in the first four weeks and 36
          in the next four, which is 68 of the network&apos;s 117 sites. Those
          sites earned ₹1L+ in affiliate commission in the first month.
        </p>

        <H no="07">What I&apos;d do next</H>
        <p>
          Add an eval layer that scores generated content before publish, so
          quality is measured, not assumed; widen the human gate into a
          lightweight review queue with quality signals; and add per-task
          observability (token cost, latency, failure rates) to tune the
          pipeline on data rather than intuition.
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
