const LINKS = [
  { label: "GitHub", href: "https://github.com/rdeepak-711" },
  { label: "Email", href: "mailto:deepakrameshh@gmail.com" },
  { label: "Outbuiltit", href: "https://outbuiltit.com" },
];

const PROOF = ["32 sites / 4 weeks", "live WhatsApp SaaS", "agents + evals"];

type Project = {
  no: string;
  name: string;
  tag: string;
  blurb: string;
  stack: string[];
  links: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    no: "01",
    name: "Outbuiltit",
    tag: "my product · live",
    blurb:
      "A multi-tenant WhatsApp SaaS for salons and spas. Customers book and pay over WhatsApp; each business gets its own isolated tenant. I built it end to end — the conversational bot, the payments, the webhook security, the test suite.",
    stack: ["Gemini FSM bot", "Razorpay + HMAC", "Twilio", "multi-tenant", "79 tests"],
    links: [{ label: "outbuiltit.com", href: "https://outbuiltit.com" }],
  },
  {
    no: "02",
    name: "Firestorm Internet",
    tag: "backend & automation",
    blurb:
      "Built the automation pipeline that turns content into deployed sites — HTML generation, WordPress provisioning, and deploy, end to end — which shipped 32 sites in 4 weeks. Also built the internal analytics and contact-email tooling the team runs on.",
    stack: ["Python", "Bash", "WP-CLI", "WordPress", "automation"],
    links: [
      { label: "crowd-tracker.com", href: "https://crowd-tracker.com" },
      { label: "f1weekend", href: "https://f1weekend.co" },
    ],
  },
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

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 sm:px-10">
      {/* Hero */}
      <section className="flex min-h-screen flex-col justify-center py-24">
        <p
          className="reveal font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]"
          style={{ animationDelay: "0ms" }}
        >
          Backend &amp; Automation Engineer
          <span className="text-muted"> — India · Remote</span>
        </p>

        <h1
          className="reveal mt-6 max-w-[18ch] font-display text-[clamp(2.1rem,7vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.025em] [overflow-wrap:break-word]"
          style={{ animationDelay: "80ms" }}
        >
          I ship LLM-integrated products and the systems that build them, fast.
        </h1>

        <p
          className="reveal mt-7 max-w-[58ch] text-base text-muted sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          I build the unglamorous parts that make products real — payments,
          messaging, automation pipelines, eval harnesses — and I ship them end
          to end.
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
          {LINKS.map((l) => (
            <ArrowLink key={l.label} {...l} />
          ))}
        </nav>
      </section>

      {/* Selected Work */}
      <section className="border-t border-line py-20 sm:py-28">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
          <span className="text-accent">§ 01</span> — Selected Work
        </p>

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

                <p className="mt-4 max-w-[60ch] text-ink/85">{p.blurb}</p>

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

      {/* About */}
      <section className="border-t border-line py-20 sm:py-28">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
          <span className="text-accent">§ 02</span> — About
        </p>
        <div className="reveal-scroll mt-10 max-w-[62ch] space-y-5 text-lg text-ink/85">
          <p>
            I&apos;m a backend and automation engineer in Chennai, India. I work
            best where the messy parts live — payments, messaging, multi-tenant
            systems, automation pipelines, eval harnesses — and I ship them end
            to end.
          </p>
          <p>
            My edge is integration and velocity: turning an idea into a working,
            paying product, or a manual process into a pipeline that runs
            itself. I built a live WhatsApp SaaS solo, and an automation pipeline
            that put 32 sites in production in four weeks.
          </p>
          <p>
            Right now I&apos;m going deeper on LLM systems — agents, tool use,
            and the eval pipelines that keep them honest. I&apos;m after remote
            AI-engineering work where shipping fast and building the automation
            around AI is the job.
          </p>
        </div>
      </section>

      {/* Now */}
      <section className="border-t border-line py-20 sm:py-28">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
          <span className="text-accent">§ 03</span> — Now
        </p>
        <ul className="reveal-scroll mt-10 max-w-[60ch] space-y-3 font-mono text-sm text-ink/85">
          {[
            "Building eval-driven LLM agents and tool-use systems",
            "Sharpening backend fundamentals and system design",
            "Writing up what I ship — notes land here as I go",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-accent">→</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="border-t border-line py-20 sm:py-28">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
          <span className="text-accent">§ 04</span> — Contact
        </p>
        <div className="reveal-scroll mt-10">
          <p className="max-w-[40ch] font-display text-[clamp(1.6rem,5vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Open to remote AI-engineering and FDE roles.
          </p>
          <nav className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-base">
            <ArrowLink label="Email" href="mailto:deepakrameshh@gmail.com" />
            <ArrowLink label="GitHub" href="https://github.com/rdeepak-711" />
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
  );
}
