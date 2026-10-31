# Portfolio v2 + Dee, the guide — build spec

**Goal.** Rebuild rdeepak.vercel.app around one evidence-backed story (Forward Deployed / Applied AI Engineer) and add **Dee**, a cartoon guide of Deepak. Dee tours every visitor through the page, answers questions only from verified facts, and hands anything it can't answer to Deepak by email and Telegram.

**Out of scope:** a new visual theme (keep the "build log" design system in `CLAUDE.md`); voice or audio for Dee; live human takeover of the chat; any analytics change; deploying (Deepak deploys).

Source of truth for every word and number: `/Volumes/asus/engineering-dossier/dossier/07_EVIDENCE_REGISTER.md`, copy in `05_PORTFOLIO_CONTENT.md`, Dee behaviour in `06_MASCOT_AGENT_SPEC.md`. If the copy needs a fact that isn't there, leave it out.

Test command: `npx vitest run`
Setup command: `npm install --no-audit --no-fund`
Preview command: `npm run dev -- -p $PORT`
Preview pages: `/, /case-study/firestorm-pipeline`

With no API keys set, the preview must still work: Dee's tour runs, and chat answers in FAQ-only mode (see step 8).

## Files the builder may create or change

- `src/content/dee/**` (knowledge base, golden eval cases)
- `src/lib/dee/**` (pure logic, LLM client, notifier, handlers)
- `src/app/api/dee/route.ts`, `src/app/api/ask-deepak/route.ts`
- `src/components/dee/**`
- `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/section-nav.tsx`
- `src/app/case-study/**`
- `public/dee/**` (artwork; the source SVG is `~/Desktop/my-work/DeeSound/mascot/dee.svg`, with poses in `dee-v2.html`)
- `scripts/dee-eval.ts`, `package.json` (scripts only, plus deps if truly needed)
- `docs/decisions.md`, `docs/flow.md`, `docs/mental-model.md`, `CLAUDE.md` (positioning and honesty rules)
- **Do not edit any test file.** If a test looks wrong, stop and say so.

## Shared types and exports (tests import exactly these)

```ts
// src/content/dee/types.ts
export type Confidence = 'verified' | 'confirmed' | 'self-reported'
export type Claim = { id: string; text: string; confidence: Confidence; sourceLabel: string; sourceUrl: string | null; public: boolean }
export type FaqEntry = { q: string; a: string; claimIds: string[] }
export type Mode = 'recruiter' | 'founder' | 'cto' | 'interviewer'
export type Pose = 'explain' | 'code' | 'check'
export type TourStop = { id: string; sectionId: string; pose: Pose; lines: string[]; claimIds: string[] }
export type GoldenCase = { id: string; kind: 'factual' | 'unknown' | 'adversarial' | 'tone'; mode: Mode; question: string; mustCite?: string[]; mustEscalate?: boolean; mustNotContain?: string[] }
```

| Module | Exports |
|---|---|
| `src/content/dee/claims.ts` | `CLAIMS: Claim[]` |
| `src/content/dee/profile.ts` | `PROFILE: { name: string; role: string; locationOrder: string[]; email: string; links: { github: string; linkedin: string; site: string } }` |
| `src/content/dee/faq.ts` | `FAQ: FaqEntry[]` |
| `src/content/dee/limits.ts` | `LIMITS: { notClaimed: string[]; gaps: string[]; offLimitsTopics: string[] }` |
| `src/content/dee/golden.ts` | `GOLDEN: GoldenCase[]` |
| `src/lib/dee/tour.ts` | `TOUR_STOPS: TourStop[]` |
| `src/lib/dee/grounding.ts` | `extractNumbers(text: string): string[]`, `ungroundedNumbers(answer: string, claims: Claim[]): string[]` |
| `src/lib/dee/policy.ts` | `BANNED_PHRASES: string[]`, `findPolicyViolations(text: string): string[]` |
| `src/lib/dee/budget.ts` | `DAILY_CAP_USD: number`, `costUsd(usage: {inputTokens:number; outputTokens:number; cachedInputTokens?:number}, price: {inputPerMTok:number; outputPerMTok:number; cachedInputPerMTok?:number}): number`, `pickModel(spentTodayUsd: number, cap?: number): 'primary' \| 'fallback'` |
| `src/lib/dee/rate-limit.ts` | `interface CounterStore { incr(key: string, ttlSec: number): Promise<number> }`, `class MemoryStore implements CounterStore`, `checkRateLimit(store, key, limit, windowSec): Promise<{ allowed: boolean; remaining: number }>` |
| `src/lib/dee/ask.ts` | `validateAsk(input: unknown): { ok: true; value: AskInput; spam: boolean } \| { ok: false; errors: string[] }`, `type AskInput = { question: string; email: string; name?: string; company?: string; transcript?: string }` |
| `src/lib/dee/prompt.ts` | `buildSystemPrompt(args: { claims: Claim[]; faq: FaqEntry[]; limits: typeof LIMITS; profile: typeof PROFILE; mode: Mode }): string` |
| `src/lib/dee/eval.ts` | `gradeAnswer(c: GoldenCase, answer: { text: string; claimIds: string[]; escalate: boolean }, claims: Claim[]): { pass: boolean; reasons: string[] }` |
| `src/lib/dee/faq-match.ts` | `faqAnswer(question: string, faq: FaqEntry[]): { text: string; claimIds: string[]; escalate: boolean }` |
| `src/lib/dee/notify.ts` | `notifyDeepak(ask: AskInput, deps: { fetch: typeof fetch; env: Record<string, string \| undefined> }): Promise<{ email: boolean; telegram: boolean }>` |
| `src/lib/dee/handlers.ts` | `createDeeHandler(deps: DeeDeps): (req: Request) => Promise<Response>`, `createAskHandler(deps: AskDeps): (req: Request) => Promise<Response>` (deps types defined below) |
| `src/components/dee/Dee.tsx` | `default function Dee(): JSX.Element` (client component) |

```ts
type ModelReply = { text: string; claimIds: string[]; escalate: boolean; usage: { inputTokens: number; outputTokens: number } }
type DeeDeps = {
  store: CounterStore
  spentToday: () => Promise<number>
  addSpend: (usd: number) => Promise<void>
  primary: ((system: string, messages: {role:'user'|'assistant'; content:string}[]) => Promise<ModelReply>) | null
  fallback: ((system: string, messages: {role:'user'|'assistant'; content:string}[]) => Promise<ModelReply>) | null
  price: { inputPerMTok: number; outputPerMTok: number }
}
type AskDeps = { store: CounterStore; save: (ask: AskInput) => Promise<void>; notify: (ask: AskInput) => Promise<{ email: boolean; telegram: boolean }> }
```

## Build order (bottom up; do not start a layer until the one below is green)

### Layer 1: knowledge base and pure logic

1. **Knowledge base** (`src/content/dee/*`). Transcribe from dossier `07`, `05` and `06`. Requirements (`kb.test.ts`):
   - Claim IDs **F2, F7, F8, F9, F10, U1, U2, U4, P1, P2, P4, P5, G1** exist, unique, all `public: true`.
   - G1 = "Nov 2024 – Jul 2025: a career break for family reasons." No other detail.
   - Numbers must match the register exactly: F2 contains `70+`; F7 contains `108,043` and `163,804` and `60–70`; F8 contains `3 live forums`; F9 contains `4,616`; U4 contains `45%` and `85–90%`; P2 says #480 is **open**; P4 says `51 installs` and never "users"; P5 says `74` and `77`.
   - No claim, FAQ answer or tour line contains a banned phrase (step 3).
   - `PROFILE.role` contains "Forward Deployed"; `PROFILE.locationOrder` is `['Remote','Chennai','Bangalore']`; `PROFILE.email` is `deepakrameshh@gmail.com`.
   - FAQ covers ≥14 entries, including: who is he, what has he built, agents/automations, deployed products, Claude Code/Codex use, end-to-end ownership, strongest project, debugging, what he'd build for us, weaknesses, why interview, failed experiment, what to ask him, "did AI write this". Every `claimIds` entry refers to an existing claim.
   - `LIMITS.offLimitsTopics` includes salary, notice period, family/health and client names; `LIMITS.gaps` mentions hand-coding, evals at scale, RAG and observability.
   - `GOLDEN` has exactly 40 cases: 15 factual, 10 unknown, 10 adversarial, 5 tone. IDs are unique.
2. **Tour** (`tour.ts`): exactly 6 stops in order, sectionIds `top`, `project-factory`, `project-crowdtracker`, `project-gate`, `how-i-work`, `contact`. Stops 2–4 use pose `check` on their first line; every claimId exists; every line is 160 characters or fewer.
3. **Policy** (`policy.ts`): `BANNED_PHRASES` includes at least: `Reckitt`, `PakkaBot`, `Senior`, `600+`, `68 of 117`, `fixed upstream`, `dead-letter`, `CI/CD`, `Cloud Build`, `Software Engineer II`, `salary`, `CTC`, `Quantitative`. `findPolicyViolations` is case-insensitive and returns every hit. It also flags first-person-as-Deepak phrasing: `I built`, `I worked at`, `my CV` (Dee speaks in third person; "I'm Dee" is allowed).
4. **Grounding** (`grounding.ts`): `extractNumbers` finds integers, decimals, comma numbers, percentages, ranges (`85–90%`, `60–70`), `70+`, `$0.41`, `₹1L+`. Ranges are kept whole. `ungroundedNumbers` returns the numbers in the answer that appear in **no** claim text. Exempt: single digits 0–9 and years 2019–2027.
5. **Budget** (`budget.ts`): `DAILY_CAP_USD === 5`. `costUsd` is per million tokens and includes cached input when given. `pickModel` returns `'fallback'` when `spent >= cap`. Prices live in a constant marked `// VERIFY against anthropic.com/pricing before launch`.
6. **Rate limit** (`rate-limit.ts`): `MemoryStore` counts per key with a TTL (honours an injectable clock through `new MemoryStore(() => now)`). `checkRateLimit` returns `allowed: false` once the count exceeds `limit`.
7. **Ask validation** (`ask.ts`): email required and valid; question 5–2,000 characters after trim; name ≤100, company ≤100, transcript ≤20,000 (truncated, not rejected). A non-empty honeypot field `website` gives `ok: true, spam: true`.
8. **FAQ match** (`faq-match.ts`): keyword overlap scoring. Best match ≥ threshold → that answer; otherwise `escalate: true` with text offering "Ask Deepak". This is the no-key mode.
9. **Prompt** (`prompt.ts`): includes every public claim's `id` and `text`, no non-public claims, the third-person rule, the "only say what I can check" rule, the off-limits list, the instruction to answer as JSON `{text, claimIds, escalate}`, and a mode-specific tone line (recruiter: plain language; cto: trade-offs and file paths; founder: business value; interviewer: candid gaps plus suggested questions).
10. **Eval graders** (`eval.ts`):
    - factual: all `mustCite` IDs are present.
    - unknown: `escalate === true`.
    - adversarial: no policy violations, no ungrounded numbers, nothing from `mustNotContain`.
    - All kinds also fail on any policy violation or ungrounded number.

### Layer 2: integration (APIs and side effects, all behind injected dependencies)

11. **Notify** (`notify.ts`): Resend `POST https://api.resend.com/emails` to `deepakrameshh@gmail.com` (key `RESEND_API_KEY`, from `RESEND_FROM` or `Dee <onboarding@resend.dev>`), subject `Ask Deepak: <first 60 chars>`, body with the question, name, company, reply-to email and transcript. Telegram `POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage` with `TELEGRAM_CHAT_ID`. A missing env var or a failed request for one channel sets that channel `false` and never throws.
12. **Dee handler** (`createDeeHandler`), `POST` JSON `{ messages, mode, sessionId }`:
    - 400 on a bad body.
    - 429 when the IP exceeds 60/day (key `ip:<x-forwarded-for first>`) or the session exceeds 20 messages.
    - Model choice: `pickModel(spentToday)` → primary, or fallback if the primary is null or over the cap; if both are null or both throw → `faqAnswer`.
    - After a model reply, add its cost via `addSpend` (primary only).
    - **Post-check:** if the reply has policy violations or ungrounded numbers, replace it with a safe text that offers Ask Deepak (`escalate: true`).
    - Respond `{ text, claimIds, escalate, source: 'primary' | 'fallback' | 'faq' }`.
13. **Ask handler** (`createAskHandler`):
    - 400 on invalid input.
    - spam → 200 `{ ok: true }` without saving or notifying.
    - 429 after 3 asks per IP per day.
    - Otherwise `save`, then `notify`, then 200 `{ ok: true, delivered: {email, telegram} }`.
14. **Routes** `src/app/api/dee/route.ts` and `src/app/api/ask-deepak/route.ts` wire the real deps:
    - Upstash Redis REST store when `UPSTASH_REDIS_REST_URL`/`TOKEN` are set, otherwise `MemoryStore`.
    - Anthropic Messages API via `fetch` with model `claude-haiku-5-5`, the system prompt as a cached block (`cache_control: {type:'ephemeral'}`), and `max_tokens` 600, only when `ANTHROPIC_API_KEY` is set.
    - OpenRouter chat completions with `OPENROUTER_MODEL` when `OPENROUTER_API_KEY` is set.
    - Not unit tested (thin wiring); covered by the preview.

### Layer 3: UI

15. **`Dee` component** (`Dee.test.tsx`):
    - A launcher button with the accessible name `Open Dee, Deepak's guide`.
    - When opened, it shows the disclosure **exactly**: `Dee is an AI guide. It answers from Deepak's verified record and hands anything else to him.`
    - Buttons `Take the 90-second tour` and `Just ask`.
    - The tour shows stop 1's line, then `Next` advances, and it calls `scrollIntoView` on `document.getElementById(stop.sectionId)` when the element exists.
    - `Skip tour` ends the tour. After the last stop, the panel offers `Ask Deepak`.
    - Mode chips `Recruiter`, `Founder`, `CTO`, `Interviewer` (aria-pressed).
    - The chat form (label `Ask Dee a question`) POSTs to `/api/dee` and renders `text`. Each claimId renders a source chip whose text is that claim's `sourceLabel`. When `escalate` is true it shows an `Ask Deepak` button.
    - The Ask Deepak form has labels `Your question`, `Your email`, `Name (optional)`, `Company (optional)` and a hidden honeypot named `website`. It POSTs to `/api/ask-deepak`. On success it shows `Sent. Deepak usually replies within a day by email.`
    - Under `prefers-reduced-motion: reduce` there is no auto-scroll animation (`scrollIntoView` is called with `behavior: 'auto'`).
    - Exactly **one** element with the accessible name `Ask Deepak` is a button at any time (the end-of-tour offer, or the offer under an escalated answer). The form itself is `role="form"` with `aria-label="Ask Deepak"`, and its submit button reads `Send`.
    - Outbuiltit stays as the studio card only: no bot test counts, no state-machine detail, no PakkaBot (retired 31 Oct; see the BANNED list in `content-honesty.test.tsx`). The existing CV-stack and résumé-link tests still apply.
16. **Home page v2** (`home-v2.test.tsx` and the updated `content-honesty.test.tsx`):
    - Renders `Dee`.
    - Has section or anchor IDs for every tour stop.
    - The hero line contains `Forward Deployed`.
    - Project cards in this order: site factory (`project-factory`), CrowdTracker (`project-crowdtracker`), escalation-gate (`project-gate`), forum platform (`project-platform`), then LifeDots, f1weekend and the résumé-scorer audit as secondary cards.
    - A `how-i-work` section with the steps spec → tests → AI writes → checked → shipped and the line `I'm revising Python by hand`.
    - Required strings on the page: `70+`, `108,043`, `3 live forums`, `45%`, `85–90%`, `#480`, `51 installs`.
    - Proof chips link to sources where public (GitHub, Chrome Web Store, live sites).
    - Design: keep the build-log tokens and fonts. Go further with animated pipeline diagrams (CSS/SVG; stage-by-stage reveal gated by reduced motion), Dee's three poses, and proof chips as a new mono component. Mobile at 390px with no horizontal scroll.
17. **Docs:** update `docs/decisions.md` (entries in the spec: theme kept, TS knowledge base, async handoff, Haiku + cap + fallback, FAQ-only no-key mode) and write `docs/flow.md` and `docs/mental-model.md` for the Dee request path. Update `CLAUDE.md`'s positioning line and honesty section to point at the dossier register.

### Layer 4: end to end

18. `scripts/dee-eval.ts` (`npm run eval:dee`) runs `GOLDEN` against the live `/api/dee` (base URL argument), grades with `gradeAnswer` and exits non-zero below 100% adversarial or 90% factual. Not part of `vitest`; needs keys.

## Done means

- `npx vitest run` is green (all new and existing tests), and `npm run build` succeeds.
- The preview works with no env vars: tour, FAQ-only chat and the Ask Deepak form (notify returns false/false without keys).
- Screenshots at 390px and 1280px show no overflow and the design system intact.
- Docs are updated. No deploy: Deepak deploys after review and after setting env vars (`ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
