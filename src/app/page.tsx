import Image from "next/image";
import Link from "next/link";

const HERO_LINKS = [
  { label: "Email", href: "mailto:deepakrameshh@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rdeepak/" },
  { label: "GitHub", href: "https://github.com/rdeepak-711" },
];

const PROOF = [
  "5 → 32 sites / 4 weeks",
  "₹1L+ in month one",
  "live WhatsApp SaaS",
  "10K+ emails/mo classified",
];

type Project = {
  no: string;
  name: string;
  tag: string;
  blurb: string;
  stack: string[];
  links: { label: string; href: string }[];
  image?: { src: string; w: number; h: number; domain: string; href: string };
};

const PROJECTS: Project[] = [
  {
    no: "01",
    name: "Outbuiltit",
    tag: "my product · live",
    blurb:
      "A multi-tenant WhatsApp booking SaaS for salons and spas — businesses take bookings, enquiries, and payments entirely over WhatsApp, no app install. I built it from scratch: tenant isolation on a shared TiDB (MySQL) database, a per-tenant Twilio number, a pure-function FSM bot (8 states) with a Gemini info-bot, Razorpay payment links with HMAC-verified webhooks, and a Next.js dashboard. Launched commercially, onboarding first paying tenants.",
    stack: ["Next.js 16", "TiDB Cloud", "Twilio", "Razorpay + HMAC", "Gemini", "Prisma", "79 Vitest tests"],
    links: [{ label: "outbuiltit.com", href: "https://outbuiltit.com" }],
    image: { src: "/work-outbuiltit.jpg", w: 1200, h: 780, domain: "outbuiltit.com", href: "https://outbuiltit.com" },
  },
  {
    no: "02",
    name: "CrowdTracker",
    tag: "my product · live",
    blurb:
      "A travel-planning platform that tells you when to visit attractions based on crowd-density and wait-time signals. Sole developer — designed the data model, built the frontend and API layer, deployed on GCP. Migrating the stack from React + PHP to Next.js (SSR + API routes) grew daily organic users from 60 to 400+, with zero paid acquisition.",
    stack: ["Next.js", "MySQL", "GCP", "SSR"],
    links: [{ label: "crowd-tracker.com", href: "https://crowd-tracker.com" }],
    image: { src: "/work-crowdtracker.jpg", w: 1200, h: 673, domain: "crowd-tracker.com", href: "https://crowd-tracker.com" },
  },
];

type Role = {
  title: string;
  company: string;
  dates: string;
  points: string[];
  caseStudy?: string;
};

const EXPERIENCE: Role[] = [
  {
    title: "Software Engineer II",
    company: "Firestorm Internet",
    dates: "Jul 2025 — Present",
    points: [
      "Built and run an end-to-end AI automation pipeline that scaled WordPress site production from 5 to 32 sites in 4 weeks — generating ₹1L+ in affiliate commissions in the first month. Handles AI content generation, image sourcing, and WordPress deployment, with a human gate only on image review.",
      "Designed a multi-agent content architecture after hitting single-agent failures — separated content creation (Claude) from HTML/template generation (Python + Claude); quality jumped once each agent had one responsibility.",
      "Built an async job queue (Celery + Redis) — every long task runs as a durable worker with retry policies, exponential backoff, and dead-letter queues. Treats LLM output as untrusted: structured-output validation, retries on malformed responses, human gates where AI is least reliable.",
      "Built an internal contact-management tool (React + FastAPI) aggregating enquiries from 40+ sites with a Gmail-integrated triage interface. Own containerization and CI/CD — Docker, Google Cloud Build, deployed on GCP.",
    ],
    caseStudy: "/case-study",
  },
  {
    title: "Associate RPA Developer",
    company: "UiPath",
    dates: "Feb 2023 — Nov 2024",
    points: [
      "Helped train and deploy an ML email-classification system (UiPath Communications Mining) routing 10K+ emails/month across 200+ client-configured sources — 85–90% accuracy, built with an AI scientist.",
      "Integrated classification outputs with SAP and ServiceNow for downstream routing and validation; redesigned exception handling and routing logic to improve workflow throughput by 70%.",
      "Implemented UiPath Computer Vision for remote-desktop automation — extraction and form-filling across legacy enterprise interfaces.",
    ],
  },
];

const SKILLS: { group: string; items: string }[] = [
  { group: "LLM & AI", items: "Claude · OpenAI · Gemini · multi-agent pipelines · structured-output validation · agent reliability · Claude Code" },
  { group: "Automation & Async", items: "end-to-end pipelines · Celery · Redis · retry policies · backoff · dead-letter queues · UiPath Studio · Communications Mining" },
  { group: "Backend", items: "Python · TypeScript · JavaScript · Bash · Java · FastAPI · REST · WP-CLI · Prisma" },
  { group: "Data", items: "MySQL · TiDB Cloud · MongoDB · PostgreSQL" },
  { group: "Cloud / DevOps / Frontend", items: "GCP · Vercel · Docker · Cloud Build (CI/CD) · Git · React · Next.js (App Router)" },
  { group: "Integrations / Testing", items: "Twilio · Razorpay · OpenRouter · pytest · Vitest" },
];

function ArrowLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 transition-colors hover:text-accent"
    >
      {label}
      <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
        ↗
      </span>
    </a>
  );
}

function SectionLabel({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
      <span className="text-accent">§ {no}</span> — {children}
    </p>
  );
}

function ProjectPreview({ image }: { image: NonNullable<Project["image"]> }) {
  return (
    <a
      href={image.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-7 block overflow-hidden rounded-lg border border-line bg-paper transition-colors hover:border-accent/50"
    >
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </span>
        <span className="ml-2 font-mono text-xs text-muted">{image.domain}</span>
        <span className="ml-auto font-mono text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
          open ↗
        </span>
      </div>
      <Image
        src={image.src}
        alt={`${image.domain} — live site`}
        width={image.w}
        height={image.h}
        sizes="(max-width: 768px) 100vw, 760px"
        className="h-auto w-full"
      />
    </a>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5 sm:px-10">
          <a
            href="#top"
            className="font-mono text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            Deepak Ramesh
          </a>
          <nav className="hidden gap-7 font-mono text-xs uppercase tracking-[0.1em] text-muted sm:flex">
            <a href="#work" className="transition-colors hover:text-accent">Work</a>
            <a href="#experience" className="transition-colors hover:text-accent">Experience</a>
            <a href="#stack" className="transition-colors hover:text-accent">Stack</a>
            <a href="#contact" className="transition-colors hover:text-accent">Contact</a>
            <a
              href="/deepak-ramesh-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-opacity hover:opacity-70"
            >
              Résumé ↗
            </a>
          </nav>
          <a
            href="#contact"
            className="font-mono text-xs uppercase tracking-[0.1em] text-accent sm:hidden"
          >
            Contact ↗
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 sm:px-10">
        {/* Hero */}
        <section id="top" className="flex min-h-[calc(100svh-3.5rem)] flex-col justify-center py-24">
        <p
          className="reveal font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]"
          style={{ animationDelay: "0ms" }}
        >
          AI Engineer · LLM Pipelines &amp; Automation
          <span className="text-muted"> — Chennai · Remote</span>
        </p>

        <h1
          className="reveal mt-6 max-w-[20ch] font-display text-[clamp(2.1rem,7vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.025em] [overflow-wrap:break-word]"
          style={{ animationDelay: "80ms" }}
        >
          I ship LLM-integrated products and the systems that build them, fast.
        </h1>

        <p
          className="reveal mt-7 max-w-[60ch] text-base text-muted sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          I build and run production AI agents and automation end to end — and I
          treat LLM output as untrusted by default: schema validation, retries,
          human gates. I ship only code I&apos;ve read and tested.
        </p>

        <ul
          className="reveal mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-ink/80"
          style={{ animationDelay: "240ms" }}
        >
          {PROOF.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="text-accent">/</span>
              {p}
            </li>
          ))}
        </ul>

        <nav
          className="reveal mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm"
          style={{ animationDelay: "320ms" }}
        >
          {HERO_LINKS.map((l) => (
            <ArrowLink key={l.label} {...l} />
          ))}
        </nav>
      </section>

      {/* Selected Work */}
      <section id="work" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="01">Selected Work</SectionLabel>
        <div className="mt-12 flex flex-col gap-16 sm:gap-20">
          {PROJECTS.map((p) => (
            <article
              key={p.no}
              className="reveal-scroll grid gap-x-10 gap-y-3 sm:grid-cols-[4rem_1fr]"
            >
              <div className="font-mono text-sm text-accent">{p.no}</div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-display text-[clamp(1.6rem,5vw,2rem)] font-semibold tracking-[-0.02em]">
                    {p.name}
                  </h2>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    {p.tag}
                  </span>
                </div>
                <p className="mt-4 max-w-[64ch] text-ink/85">{p.blurb}</p>
                {p.image && <ProjectPreview image={p.image} />}
                <p className="mt-6 border-t border-line pt-3 font-mono text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
                  <span className="text-accent">stack</span>
                  {"  "}
                  {p.stack.join("  ·  ")}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {p.links.map((l) => (
                    <ArrowLink key={l.label} {...l} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="02">Experience</SectionLabel>
        <div className="mt-12 flex flex-col gap-14 sm:gap-16">
          {EXPERIENCE.map((r) => (
            <article
              key={r.company}
              className="reveal-scroll grid gap-x-10 gap-y-4 sm:grid-cols-[12rem_1fr]"
            >
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
                {r.dates}
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">
                  {r.title}
                </h3>
                <p className="mt-1 font-mono text-sm text-accent">{r.company}</p>
                <ul className="mt-5 flex flex-col gap-3 text-ink/85">
                  {r.points.map((pt, i) => (
                    <li key={i} className="grid grid-cols-[1.25rem_1fr]">
                      <span className="font-mono text-sm text-line">{String(i + 1).padStart(2, "0")}</span>
                      <span className="max-w-[64ch]">{pt}</span>
                    </li>
                  ))}
                </ul>
                {r.caseStudy && (
                  <Link
                    href={r.caseStudy}
                    className="group mt-5 inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 transition-colors hover:text-accent"
                  >
                    Read the case study
                    <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="03">Stack</SectionLabel>
        <dl className="reveal-scroll mt-12 flex flex-col">
          {SKILLS.map((s) => (
            <div
              key={s.group}
              className="grid gap-x-10 gap-y-1 border-t border-line py-4 first:border-t-0 sm:grid-cols-[14rem_1fr]"
            >
              <dt className="font-mono text-sm text-ink">{s.group}</dt>
              <dd className="font-mono text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                {s.items}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* About */}
      <section className="border-t border-line py-20 sm:py-28">
        <SectionLabel no="04">About</SectionLabel>
        <div className="reveal-scroll mt-10 max-w-[62ch] space-y-5 text-lg text-ink/85">
          <p>
            I&apos;m an AI and automation engineer in Chennai, India. I came up
            through RPA at UiPath, moved into building production automation
            pipelines, and now build LLM-integrated products end to end — the
            agents, the queues, the payments, the eval gates.
          </p>
          <p>
            My edge is integration and velocity: turning an idea into a working,
            paying product, or a manual process into a pipeline that runs itself.
            I&apos;ve shipped a live WhatsApp SaaS solo and an automation pipeline
            that put 32 sites in production in four weeks.
          </p>
          <p>
            B.E. Computer Science, Coimbatore Institute of Technology (8.5/10).
            Currently going deeper on agents, tool use, and the eval pipelines
            that keep them honest.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="05">Contact</SectionLabel>
        <div className="reveal-scroll mt-10">
          <p className="max-w-[26ch] font-display text-[clamp(1.7rem,5.5vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            Building something AI-native? Let&apos;s talk.
          </p>
          <p className="mt-5 max-w-[52ch] text-lg text-muted">
            I&apos;m after remote AI-engineering or forward-deployed work where
            shipping fast and building the automation around LLMs is the actual
            job — not a side quest. Fastest way to reach me is email.
          </p>
          <nav className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-base">
            <ArrowLink label="Email" href="mailto:deepakrameshh@gmail.com" />
            <ArrowLink label="LinkedIn" href="https://www.linkedin.com/in/rdeepak/" />
            <ArrowLink label="GitHub" href="https://github.com/rdeepak-711" />
            <ArrowLink label="Résumé" href="/deepak-ramesh-resume.pdf" />
            <ArrowLink label="Outbuiltit" href="https://outbuiltit.com" />
          </nav>
        </div>
      </section>

      {/* Footer build-stamp */}
      <footer className="border-t border-line py-10 font-mono text-xs text-muted">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Deepak Ramesh</span>
          <span className="text-line">·</span>
          <span>built with Next.js · 2026</span>
        </div>
      </footer>
      </main>
    </>
  );
}
