import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Classifying 10K+ emails a month with RPA + ML · Deepak Ramesh",
  description:
    "How I trained and deployed a Communications-Mining model at UiPath, wired it into SAP and ServiceNow, and lifted enterprise workflow throughput by 70%.",
  openGraph: {
    title: "Classifying 10K+ emails a month with RPA + ML",
    description:
      "Training and deploying a Communications-Mining model, wiring it into SAP and ServiceNow, and lifting workflow throughput 70%.",
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
  ["10K+ / mo", "emails classified"],
  ["85–90%", "accuracy"],
  ["+70%", "workflow throughput"],
  ["200+", "client sources"],
];

export default function UiPathCaseStudy() {
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
        Case Study · UiPath
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
        Classifying 10K+ emails a month with RPA + ML.
      </h1>
      <p className="mt-6 max-w-[60ch] text-lg text-muted">
        An ML email-classification system that routed enterprise mail across
        200+ sources at 85–90% accuracy — and, just as importantly, bridged its
        output into the SAP and ServiceNow systems where the actual work
        happens.
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
          Enterprise clients received high volumes of email across 200+
          configured sources — support, operations, finance — that all needed
          reading, categorizing, and routing to the right team or system.
          Done by hand, it was slow, inconsistent, and a poor use of people who
          should have been resolving issues, not sorting them.
        </p>

        <H no="02">The classification model</H>
        <p>
          Working with an AI scientist, I helped train and deploy an
          email-classification system on UiPath&apos;s Communications Mining
          API. It learned the clients&apos; real categories from historical
          mail and reached 85–90% accuracy — high enough to route confidently,
          with low-confidence cases falling back to a human.
        </p>

        <H no="03">Bridging ML to enterprise systems</H>
        <p>
          A model that classifies isn&apos;t worth much until its output drives
          real work. I integrated the classification results into SAP and
          ServiceNow — turning &quot;this email is category X&quot; into a
          structured action: the right ticket, the right queue, the right
          downstream process. That gap, from a prediction to a business
          outcome, is where most of the value (and most of the engineering)
          lived.
        </p>

        <H no="04">Hardening the workflow</H>
        <p>
          I redesigned the exception handling, routing logic, and validation
          across the SAP/ServiceNow integrations — catching the malformed,
          ambiguous, and edge-case inputs that break naive automations. Tightening
          those paths improved overall workflow throughput by 70%.
        </p>

        <H no="05">Computer Vision for legacy interfaces</H>
        <p>
          Some of the systems involved had no API — only old desktop UIs over
          remote sessions. I used UiPath Computer Vision to automate extraction
          and form-filling across those legacy interfaces, so the pipeline could
          reach systems that otherwise couldn&apos;t be touched programmatically.
        </p>

        <H no="06">Outcome</H>
        <p>
          The system classified and routed 10K+ emails a month across 200+
          sources at 85–90% accuracy, and the workflow rework lifted throughput
          by 70%. It also gave me the instinct I carry into LLM work now: a model
          is the easy part; the hard, valuable part is wiring its output safely
          into the systems and processes that depend on it.
        </p>

        <H no="07">What I took from it</H>
        <p>
          This is where I learned to treat model output as a signal to be
          validated and routed, not trusted blindly — confidence thresholds,
          human fallback, exception paths. It&apos;s the same posture I apply to
          LLMs today: schema-validate, retry, and keep a human gate where a wrong
          answer is expensive.
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
