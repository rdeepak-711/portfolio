# Dee request flow

## Home page content and contact

`src/app/page.tsx` renders the home page. Its Writing section sorts `NOTES` from `src/content/notes.ts` by date, takes the three newest notes, and maps non-empty `NOTE_LANES` to disclosure lists. Its Found in other people’s code section maps `OUTSIDE_WORK` from `src/content/outside.ts` into the entries after Work. The contact section links the email address with `mailto:` and renders `CopyEmail` from `src/components/CopyEmail.tsx`; clicking the button uses the browser clipboard API, reports success or failure through a live status, then clears that status after two seconds. The main project list maps `PROJECTS` to alternating data bands, with each screenshot figure inside its article and placed in the opposite wide-screen column for right bands. The secondary project grid maps `SECONDARY`, including Travel Measured and its two writing links. The footer links to email and the résumé. These are client-side links and clipboard interaction; there is no new server boundary.

## Entry points

The homepage is rendered by `src/app/page.tsx`, which renders the client component `src/components/dee/Dee.tsx` once. `Dee` opens its panel, runs the tour from `src/lib/dee/tour.ts`, and submits visitor chat or an Ask Deepak form.

## Chat request

`sendMessage` in `src/components/dee/Dee.tsx` appends the visitor message and sends `POST /api/dee` with `{ messages, mode, sessionId }`.

`POST` in `src/app/api/dee/route.ts` creates the route dependencies with `createClients` from `src/lib/dee/clients.ts`, obtains `MODEL_PRICES` from `src/lib/dee/budget.ts`, and delegates to `createDeeHandler` in `src/lib/dee/handlers.ts`.

`createDeeHandler` validates the request, rate-limits the IP and session with the injected `CounterStore`, builds the grounded prompt with `buildSystemPrompt` from `src/lib/dee/prompt.ts`, selects primary or fallback with `pickModel`, and falls back to `faqAnswer` from `src/lib/dee/faq-match.ts` when generation is unavailable. It checks replies with `findPolicyViolations` and `ungroundedNumbers`; the response includes text, claim IDs, escalation state and source type.

`sendMessage` renders the answer and resolves each returned claim ID against `CLAIMS` in `src/content/dee/claims.ts`. Claims with a `sourceUrl` render as links to that source; claims without a public URL render as plain source chips.

## Ask Deepak request

When the visitor chooses the handoff, `sendAsk` in `src/components/dee/Dee.tsx` sends the question, contact details, honeypot and serialized chat transcript to `POST /api/ask-deepak`.

`POST` in `src/app/api/ask-deepak/route.ts` wires `createAskHandler` from `src/lib/dee/handlers.ts` to the shared client store and save function plus `notifyDeepak` from `src/lib/dee/notify.ts`.

`createAskHandler` validates and rate-limits the request, ignores honeypot submissions, saves valid asks, then calls the injected notifier. `notifyDeepak` sends Resend and Telegram HTTP requests independently; a missing key or failed channel does not prevent the other attempt.

## Boundaries and changes in this session

The browser communicates with the two route handlers over HTTP. `createClients` uses Upstash Redis REST when configured and otherwise uses `MemoryStore`. Its primary model client calls the Anthropic Messages API; its fallback calls OpenRouter. `notifyDeepak` calls Resend and Telegram from the server; credentials stay in server environment variables. When Redis exists, the injected `save` function in `src/lib/dee/clients.ts` pushes asks into the `dee:asks` list; without Redis it writes the ask to the server log, so there is no durable ask store in that mode.

This UI round added the large copyable email, employer line, alternating project bands and Travel Measured card in `src/app/page.tsx`, plus `src/components/CopyEmail.tsx`. The home Writing section reads the existing `NOTES` and `NOTE_LANES`; the outside section reads the existing `OUTSIDE_WORK`. It did not change the Dee API handlers, knowledge data, providers, rate-limit logic or notification behavior.
