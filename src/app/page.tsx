import Image from "next/image";
import Link from "next/link";
import SectionNav from "./section-nav";
import { LANES, videosByLane } from "@/content/videos";

// newest three across every track — a teaser, not the catalogue
const RECENT_VIDEOS = LANES.flatMap((l) => videosByLane(l.id))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .slice(0, 3);

const LANE_LABEL = new Map(LANES.map((l) => [l.id, l.label]));

const HERO_LINKS = [
  { label: "Email", href: "mailto:deepakrameshh@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rdeepak/" },
  { label: "GitHub", href: "https://github.com/rdeepak-711" },
];

const PROOF = [
  "5 → 32 sites / 4 weeks",
  "₹1L+ in month one",
  "6/6 citations checked",
  "10K+ emails/mo routed",
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
    tag: "my studio · 2025 — present",
    blurb:
      "My indie product studio, where I build my own products solo, from the first commit to the deploy. Two are live: escalation-gate and LifeDots, below. Before them came WhatsApp bots: GlowZone, a salon booking bot with a pure state-machine core, LLM intent parsing on top with a keyword fallback, an owner dashboard that prevents double-booking and 495 Vitest tests; then a multi-tenant ordering bot with a 17-state machine and HMAC-verified Razorpay webhooks. The bots worked; finding buyers for them didn't, so I moved on to tools developers use.",
    stack: ["Next.js", "TypeScript", "Prisma", "MySQL (TiDB Cloud)", "WhatsApp Cloud API", "Razorpay + HMAC", "Vitest"],
    links: [{ label: "outbuiltit.com", href: "https://outbuiltit.com" }],
    image: { src: "/work-outbuiltit.jpg", w: 1200, h: 780, domain: "outbuiltit.com", href: "https://outbuiltit.com" },
  },
  {
    no: "02",
    name: "escalation-gate",
    tag: "outbuiltit · open source",
    blurb:
      "Give it a GitHub repo and an issue: it finds the root cause, checks every code citation against the source, and names the open PR that fixes it and whether it merges cleanly. The model runs in 2 of 6 stages; the other four check or narrow its work: a citation checker, a SQL shortlist from diff hunk ranges, git merge-tree dry-run merges, and a packet that keeps model reasoning apart from checked facts. On HackerRank's hiring-agent issue #424 it verified 6 of 6 citations, cut 192 open PRs to 25 and picked #425 for $0.41. It caught a mistake in my own hand review, and it found an unreported bug I filed upstream (issue #479, fix PR #480). It also runs as an MCP server, so an agent like Claude Code can sweep a repo's top issues in the background and get the PR to merge for each.",
    stack: ["Python", "PostgreSQL", "Claude Code headless", "MCP server", "GitHub CLI", "git merge-tree", "pytest"],
    links: [
      { label: "gate.outbuiltit.com", href: "https://gate.outbuiltit.com" },
      { label: "github", href: "https://github.com/rdeepak-711/escalation-gate" },
      { label: "write-up", href: "/writing/escalation-gate" },
      { label: "upstream fix · PR #480", href: "https://github.com/interviewstreet/hiring-agent/pull/480" },
    ],
    image: { src: "/work-escalation-gate.jpg", w: 1200, h: 780, domain: "gate.outbuiltit.com", href: "https://gate.outbuiltit.com/packets/hiring-agent-424.html" },
  },
  {
    no: "03",
    name: "LifeDots",
    tag: "outbuiltit · chrome extension",
    blurb:
      "A Chrome extension that counts real minutes on the sites you pick for one habit (LeetCode, say) and gives you one dot a day. No streaks to break, and nothing leaves your computer: it makes no network requests at all. Published on the Chrome Web Store.",
    stack: ["TypeScript", "Chrome Manifest V3", "Vite", "Vitest"],
    links: [
      { label: "lifedots.outbuiltit.com", href: "https://lifedots.outbuiltit.com" },
      { label: "chrome web store", href: "https://chromewebstore.google.com/detail/lifedots/jnilnnaeidhijpogedkmchpbiphngdkc" },
      { label: "github", href: "https://github.com/rdeepak-711/lifedots-extension" },
    ],
    image: { src: "/work-lifedots.jpg", w: 1200, h: 780, domain: "lifedots.outbuiltit.com", href: "https://lifedots.outbuiltit.com" },
  },
  {
    no: "04",
    name: "CrowdTracker",
    tag: "at firestorm · live",
    blurb:
      "A Firestorm product that tells travellers when to visit an attraction. I'm its sole developer: I migrated it from React and PHP to Next.js, and organic users grew from 60–70 a day to 600+ a day (17,331 users and 25,463 page views in the 28 days to 15 Oct 2026, GA4).",
    stack: ["Next.js", "SSR", "migrated from React + PHP"],
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
    title: "Software Engineer",
    company: "Firestorm Internet",
    dates: "Jul 2025 — Present",
    points: [
      "Built the AI content automation pipeline (Python, Bash, WP-CLI, Claude) behind 68 of the network's 117 attraction-ticket sites. It writes the content, sources images from GetYourGuide, and sets up and deploys each WordPress site. Per-site build time fell from 4–10 days to a few hours: 32 sites in the first four weeks and 36 in the next four, up from about 5 a month. The sites earned ₹1L+ in affiliate commission in the first month.",
      "Split a single-prompt pipeline into separate LLM stages (content, then HTML and templates, with Python between them) after the single-prompt version failed on quality. Kept a human gate on image selection on purpose: that's where the model was least reliable and a wrong output going live cost the most.",
      "Removed the review bottleneck the pipeline created: a review template, an agent that turns the writers' review into todos, and a second agent that reads the code, decides whether each issue is an exception or a code bug, and fixes it. One review round went from a few hours to under 45 minutes, and I checked every fix.",
      "Built an internal contact tool (React + FastAPI) that pulls enquiries from 40+ sites into one Gmail-integrated inbox, and an async background job queue on Celery and Redis. Containerised the services with Docker.",
    ],
    caseStudy: "/case-study/firestorm-pipeline",
  },
  {
    title: "Associate RPA Developer",
    company: "UiPath",
    dates: "Feb 2023 — Nov 2024",
    points: [
      "Built the automations around a Communications Mining email classifier (the model was an AI scientist's): 10K+ emails a month from 200+ sources, at 85–90% accuracy on historical data, routed into SAP and ServiceNow.",
      "Redesigned exception handling, routing and validation across the SAP and ServiceNow integrations, which raised workflow throughput by 70%.",
      "Built remote-desktop automations with UiPath Computer Vision for data extraction and form filling on legacy enterprise screens.",
      "Fixed a client's document problem by changing the input, not the model: a medical-insurance client's invoices came in too many layouts for Document Understanding, so we gave their team an Excel template with drop-downs. Complete entries went from roughly 40% to 80%.",
      "Led most client delivery calls, walking client teams through what was being automated and how.",
    ],
    caseStudy: "/case-study/uipath-ml",
  },
];

const SKILLS: { group: string; items: string }[] = [
  { group: "AI & agents", items: "LLM pipelines · AI agents · MCP servers · Claude · OpenAI · OpenRouter · output checking (citations, run-to-run variance) · Claude Code" },
  { group: "Automation & RPA", items: "UiPath (Studio, Orchestrator, Apps, Computer Vision, Communications Mining) · SAP and ServiceNow integrations · WP-CLI · Bash" },
  { group: "Backend", items: "Python · TypeScript · FastAPI · REST APIs · Celery · Redis" },
  { group: "Databases", items: "PostgreSQL · MySQL (TiDB Cloud) · Prisma" },
  { group: "Frontend", items: "React · Next.js (App Router)" },
  { group: "Infra & testing", items: "Docker · GCP · Vercel · Git · WhatsApp Cloud API · Razorpay · pytest · Vitest" },
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
          <SectionNav />
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
          <span className="text-muted"> — Chennai · on-site anywhere in India or remote</span>
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
          I build AI agents and automation end to end, and I treat LLM output as
          untrusted by default: code checks what the model claims, and a human
          gate sits where the model is least reliable. I ship only code I&apos;ve
          read and tested.
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
            I&apos;m a software engineer in Chennai, India, about three years
            in. I came up through RPA at UiPath, moved into building LLM
            pipelines at Firestorm, and run Outbuiltit, my own studio, on the
            side: the agents, the checks around them, the payments, the deploys.
          </p>
          <p>
            My edge is integration and velocity: turning a manual process into a
            pipeline that runs itself, or an idea into a working product. I
            built the pipeline that put 32 sites in production in four weeks,
            and an open-source agent that checks every citation it makes.
          </p>
          <p>
            B.E. Computer Science, Coimbatore Institute of Technology (8.5/10).
            Currently going deeper on agents, tool use, and the eval pipelines
            that keep them honest.
          </p>
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="05">Writing &amp; Case Studies</SectionLabel>
        <div className="reveal-scroll mt-10 flex flex-col gap-8">
          {[
            {
              no: "01",
              title: "Scaling site production 5 → 32 in 4 weeks",
              href: "/case-study/firestorm-pipeline",
              blurb:
                "The single-prompt failure that forced the split into stages, the human gate on images, and the review agents that removed the next bottleneck.",
            },
            {
              no: "02",
              title: "escalation-gate: from a GitHub issue to the PR that fixes it",
              href: "/writing/escalation-gate",
              blurb:
                "A model cites the code, a checker verifies every citation, and SQL cuts 192 open PRs to 25. It also caught a mistake in my own review.",
            },
            {
              no: "03",
              title: "Routing 10K+ emails a month into SAP and ServiceNow",
              href: "/case-study/uipath-ml",
              blurb:
                "Building the automations around a Communications Mining classifier at UiPath, wiring its output into SAP and ServiceNow, and lifting workflow throughput 70%.",
            },
          ].map((w) => (
            <Link key={w.no} href={w.href} className="group block max-w-[66ch]">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">{w.no}</span>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">
                  {w.title}
                </h3>
              </div>
              <p className="mt-2 pl-[1.7rem] text-muted">{w.blurb}</p>
            </Link>
          ))}
          <p className="font-mono text-xs text-muted">
            More notes on LLM pipelines, agents, and evals — as I ship.
          </p>
        </div>
      </section>

      {/* Building in public */}
      <section id="building" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="06">Building in Public</SectionLabel>
        <ul className="reveal-scroll mt-10 flex flex-col gap-8">
          {RECENT_VIDEOS.map((v) => (
            <li key={v.slug}>
              <Link href="/building" className="group block max-w-[66ch]">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent">
                    {LANE_LABEL.get(v.lane)}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">
                    {v.title}
                  </h3>
                </div>
                <p className="mt-2 text-muted">{v.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/building"
          className="reveal-scroll group mt-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
        >
          All videos
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-16 border-t border-line py-20 sm:py-28">
        <SectionLabel no="07">Contact</SectionLabel>
        <div className="reveal-scroll mt-10">
          <p className="max-w-[26ch] font-display text-[clamp(1.7rem,5.5vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
            Building something AI-native? Let&apos;s talk.
          </p>
          <p className="mt-5 max-w-[52ch] text-lg text-muted">
            I&apos;m after AI-engineering, backend or forward-deployed work,
            on-site anywhere in India or remote, where building the automation
            around LLMs is the actual job. Fastest way to reach me is email.
          </p>
          <nav className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-base">
            <ArrowLink label="Email" href="mailto:deepakrameshh@gmail.com" />
            <ArrowLink label="LinkedIn" href="https://www.linkedin.com/in/rdeepak/" />
            <ArrowLink label="GitHub" href="https://github.com/rdeepak-711" />
            <ArrowLink label="Résumé" href="/Deepak-R-Resume.pdf" />
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
