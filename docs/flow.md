# Dee request flow

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

This session added the client panel and its request calls, the inline artwork, the home page sections, and the live golden-case script. It did not change the API handlers, data modules, providers, rate-limit logic or notification behavior.
