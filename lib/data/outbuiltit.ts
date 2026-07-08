// Deep-dive content for the Outbuiltit terminal detail page.
// Structured as "command blocks" so the terminal page renders prompt → output.

export type CommandBlock = {
  command: string;
  // Each line of "output" under the command.
  output: string[];
};

export const outbuiltitDetail = {
  blurb:
    "A multi-tenant SaaS that lets salons and spas run their entire booking flow over WhatsApp — bookings, enquiries, payments, reminders — with no app install for them or their customers. Built solo, end to end, and launched commercially.",
  blocks: [
    {
      command: "cat problem.md",
      output: [
        "Small salons live in WhatsApp. Their customers already message them there —",
        "but the owner still books by hand: checks the calendar, avoids clashes,",
        "confirms slots, chases payment. It does not scale past one busy front desk.",
      ],
    },
    {
      command: "cat architecture.md",
      output: [
        "Multi-tenant: one shared TiDB Cloud (MySQL) DB, isolated by tenantId.",
        "Each business routes through its own Twilio WhatsApp number.",
        "The bot is a pure-function FSM — 8 states, capability flags per tenant.",
        "Gemini 2.0 Flash Lite powers the AI info-bot layer on top of the FSM.",
        "Razorpay payment links, verified by HMAC webhook signatures.",
        "Next.js 16 App Router dashboard: orders, bookings, CRM, bot editor, analytics.",
      ],
    },
    {
      command: "git log --oneline --grep=hard",
      output: [
        "lane-aware calendar — never double-books the same therapist",
        "FSM kept pure so every transition is unit-testable in isolation",
        "automated booking reminders without a cron-per-tenant explosion",
        "structured-output validation + retries on malformed LLM responses",
      ],
    },
    {
      command: "npm test",
      output: [
        "✓ bot FSM — 8 states, all transitions",
        "✓ lane/clash booking logic",
        "✓ webhook signature verification",
        "",
        "Test Files  passing   Tests  79 passed",
      ],
    },
    {
      command: "cat status.md",
      output: [
        "Live at outbuiltit.com — ₹999/month, first month free.",
        "3 live demo tenants; onboarding first paying customers.",
        "Stack: Next.js 16 · TypeScript · TiDB Cloud · Twilio · Razorpay · Prisma.",
      ],
    },
  ] satisfies CommandBlock[],
};
