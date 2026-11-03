# Dee request flow

## Home page content and contact

`src/app/page.tsx` renders the home page. Its Writing section sorts `NOTES` from `src/content/notes.ts` by date, takes the three newest notes, and maps non-empty `NOTE_LANES` to disclosure lists. Its Found in other people’s code section maps `OUTSIDE_WORK` from `src/content/outside.ts` into the entries after Work. The contact section links the email address with `mailto:` and renders `CopyEmail` from `src/components/CopyEmail.tsx`; clicking the button uses the browser clipboard API, reports success or failure through a live status, then clears that status after two seconds. The main project list maps `PROJECTS` to alternating data bands, with each screenshot figure inside its article and placed in the opposite wide-screen column for right bands. The secondary project grid maps `SECONDARY`, including Travel Measured and its two writing links. The footer links to email and the résumé. These are client-side links and clipboard interaction; there is no new server boundary.

## Entry points

The homepage is rendered by `src/app/page.tsx`, which renders the client component `src/components/dee/Dee.tsx` once. `Dee` opens its panel, runs the tour from `src/lib/dee/tour.ts`, and submits visitor chat or an Ask Deepak form.

## Chat request

`sendMessage` in `src/components/dee/Dee.tsx` appends the visitor message and sends `POST /api/dee` with `{ messages, mode, sessionId }`.

`POST` in `src/app/api/dee/route.ts` creates the route dependencies with `createClients` from `src/lib/dee/clients.ts`, obtains `MODEL_PRICES` from `src/lib/dee/budget.ts`, and delegates to `createDeeHandler` in `src/lib/dee/handlers.ts`.

`createDeeHandler` validates the request, rate-limits the IP and session with the injected `CounterStore`, builds the grounded prompt with `buildSystemPrompt` from `src/lib/dee/prompt.ts`, selects primary or fallback with `pickModel`, and falls back to `faqAnswer` from `src/lib/dee/faq-match.ts` when generation is unavailable. It checks replies with `findPolicyViolations` and `ungroundedNumbers`; the response includes text, claim IDs, escalation state and source type. Since 1 Nov, just before responding it calls the injected `logChat` (from `createClients`) with the time, session ID, mode, last question cut to 500 characters, source, escalation flag and turn count; no IP. With Redis, `logChat` pushes to the `dee:chats` list (trimmed to 5,000) and increments `dee:chats:<YYYY-MM-DD>`; without Redis it writes to the server log. A logging failure is caught and the answer still goes out. `npm run dee:stats` (`scripts/dee-stats.mjs`) reads those keys with the local `.env`. Opening the panel fires a GA4 `dee_open` event from the open effect in `Dee.tsx` through the `gtag` that `src/app/layout.tsx` loads.

`sendMessage` renders the answer. Since 2 Nov the response carries `sources` (label, URL and links of each cited claim) and `AnswerSources` in `Dee.tsx` renders those; it only falls back to resolving claim IDs against `CLAIMS` in `src/content/dee/claims.ts` when `sources` is missing. Claims with a `sourceUrl` render as links to that source; claims without a public URL render as plain source chips.

## Ask Deepak request

When the visitor chooses the handoff, `sendAsk` in `src/components/dee/Dee.tsx` sends the question, contact details, honeypot and serialized chat transcript to `POST /api/ask-deepak`.

`POST` in `src/app/api/ask-deepak/route.ts` wires `createAskHandler` from `src/lib/dee/handlers.ts` to the shared client store and save function plus `notifyDeepak` from `src/lib/dee/notify.ts`.

`createAskHandler` validates and rate-limits the request, ignores honeypot submissions, calls the injected notifier, then saves the ask with `at` and `delivered`. `notifyDeepak` sends one Resend email (Telegram was removed 3 Nov); a missing key or failed send returns `email: false` and never throws.

## Boundaries and changes in this session

The browser communicates with the two route handlers over HTTP. `createClients` uses Upstash Redis REST when configured and otherwise uses `MemoryStore`. Its primary model client calls the Anthropic Messages API; its fallback calls OpenRouter. `notifyDeepak` calls Resend and Telegram from the server; credentials stay in server environment variables. When Redis exists, the injected `save` function in `src/lib/dee/clients.ts` pushes asks into the `dee:asks` list; without Redis it writes the ask to the server log, so there is no durable ask store in that mode.

This UI round added the large copyable email, employer line, alternating project bands and Travel Measured card in `src/app/page.tsx`, plus `src/components/CopyEmail.tsx`. The home Writing section reads the existing `NOTES` and `NOTE_LANES`; the outside section reads the existing `OUTSIDE_WORK`. It did not change the Dee API handlers, knowledge data, providers, rate-limit logic or notification behavior.

The 31 Oct UI v4 pass changed only the home-page presentation path. `src/app/page.tsx` now renders the sections in this order: `top`, `work`, `outside`, `how-i-work`, `experience`, `writing`, `contact`. Stack rows still come from the local `STACK` array and render inside Experience; recent videos still come from `LANES` and `videosByLane`, now inside Writing after the note lanes. `ArrowLink` and `ProofChip` decide their arrow and link/fact markup from each `href`. `PipelineDiagram` keeps the SVG for `sm` and wider screens and renders its five stage labels as an ordered list below `sm`. `src/app/section-nav.tsx` keeps the same menu entries and observes the same section IDs; its nav row scrolls within itself on phones. The page has two empty Dee measurement targets: `section#top [data-dee-dock="hero"]` at `lg` and `section#contact [data-dee-dock="contact"]` beside `CopyEmail`. The page still renders the `Dee` launcher after `main`. This session did not change the Dee component, its flight implementation, or the API and knowledge paths described above.


## Daily question and answers (added 2 Nov 2026)

`createDeeHandler` now calls the injected `loadAnswerClaims` (from `createClients`) on every chat: it reads `SMEMBERS dee:qa:live` then `MGET dee:qa:<id>`, turns each stored answer into a claim with `answerToClaim` in `src/lib/dee/answers.ts`, and caches the list for 60 seconds in the function instance. Those claims join the static `CLAIMS` for the prompt, grounding checks and the returned `sources`. If Redis fails, the chat continues with the static claims only.

Vercel Cron (`vercel.json`) calls `GET /api/dee/daily` (`src/app/api/dee/daily/route.ts`) at 03:30 UTC with `Authorization: Bearer $CRON_SECRET`. `createDailyHandler` in `src/lib/dee/handlers.ts` reads the last 50 asks with `recentAskQuestions` (`LRANGE dee:asks`), the ids already emailed with `askedIds` (`dee:qa:asked`), and picks one with `pickNextQuestion`: the oldest unasked visitor question first, then `DAILY_QUESTIONS` from `src/content/dee/daily-questions.ts`. It builds a signed link with `answerLink`, sends it through `emailDeepak` (Resend, from `RESEND_FROM`), and only then calls `markAsked`, so a failed send is retried the next day.

The link opens `src/app/dee/answer/page.tsx` (not indexed). The page checks the signature with `verifyQuestion` on the server and renders `AnswerForm` (`src/components/dee/AnswerForm.tsx`) only for a valid link. The form posts to `POST /api/dee/answer` (`src/app/api/dee/answer/route.ts`); `createAnswerHandler` validates with `validateAnswer` (length, and the same banned-wording policy for public answers), verifies the signature again, rate-limits by IP, and calls `saveAnswer`, which writes `dee:qa:<id>`, adds or removes the id in `dee:qa:live`, and clears the cache. `npm run dee:answers` (`scripts/dee-answers.mjs`) lists every answer and which are live.

Boundaries in this path: Vercel Cron to the function (secret header), the function to Resend (HTTPS), Deepak's browser to the answer page and route (HMAC-signed link, no login), and the functions to Upstash Redis. Gap: whether the email arrives depends on the Resend sending domain, which is not verified yet.

## Visitor origin and the daily digest (added 2 Nov 2026)

On first load in a tab, an effect in `src/components/dee/Dee.tsx` stores `{ ref, referrer, landing }` in sessionStorage under `dee-origin`, and `sendMessage` sends it as `origin` with every `POST /api/dee` (`readOrigin`). `createDeeHandler` passes it through `parseOrigin` (`src/lib/dee/visitor.ts`) and adds `visitorFromHeaders(req.headers)` (Vercel's `x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-city`, and the user agent for device), plus the answer text and claim IDs, to the entry it gives `logChat`. No IP is logged.

The daily cron's `createDailyHandler` now also calls `recentChats` (`LRANGE dee:chats 0 999` in `createClients`) and `formatDigest` (`visitor.ts`), which keeps the last 24 hours, drops `smoke-` and `claude-` sessions (`isTestSession`) and groups by session. The digest is appended to the same email as the daily question. Since 3 Nov a third section follows: `recentAsks` (`LRANGE dee:asks 0 49`) → `formatAsks`, which lists Ask Deepak requests from the last 24 hours. `createAskHandler` calls `notify` (`notifyDeepak` in `src/lib/dee/notify.ts`: a Resend email to deepakrameshh@gmail.com; Telegram was removed 3 Nov) and then `save` with `at` and `delivered`, so the digest can show where each ask reached him. **Touched 3 Nov:** `ask.ts` (`StoredAsk`), `visitor.ts`, `handlers.ts`, `clients.ts`, `api/dee/daily/route.ts`. `npm run dee:stats` prints the same fields per chat.


## Multi-turn chats (fixed 3 Nov 2026)

`Dee.tsx` `sendMessage` appends the visitor's message, then posts `messages` stripped to `{role, content}` to `/api/dee`, and stores the reply as an assistant message with its `answer` (text, claimIds, sources). The panel renders every message in order and scrolls `latestMessage` into view inside `chatBody`. In `createDeeHandler`, `asModelHistory` rewraps plain-text assistant messages in the JSON reply shape before `candidate.client(system, …)`, so the model keeps answering in JSON that `parseModelJson` (`clients.ts`) can read. **Touched 3 Nov:** `Dee.tsx`, `handlers.ts`, `prompt.ts`.
