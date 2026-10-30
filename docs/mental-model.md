# Dee in plain terms

Dee is a small guide attached to the portfolio page. The page itself stays server-rendered; only `src/components/dee/Dee.tsx` needs browser state for opening the panel, moving through the tour, choosing an audience mode and sending messages.

The tour is a list in `src/lib/dee/tour.ts`. Each stop names a real section ID on the home page and a short line for Dee to show. The component scrolls the page to that section and chooses a pose for its inline SVG companion.

A chat message goes to `/api/dee`. The server handler can answer with a configured model, use the FAQ matcher when generation is unavailable, or replace an answer that fails its policy or number checks. The returned claim IDs point back to `src/content/dee/claims.ts`; the UI uses each claim's source label and, when available, its public source URL.

If Dee cannot answer, the visitor can send the question and contact details to `/api/ask-deepak`. The chat transcript travels with it. The handler validates and rate-limits the ask, pushes it to Redis when configured (or logs it in no-key local mode), and tries email and Telegram separately. That makes the handoff asynchronous: Deepak can reply later by email, and the visitor does not depend on him being online.

The important boundary is the server. Model keys, email credentials, Telegram credentials and Redis credentials stay there. In a preview with no model keys, FAQ matching still gives known answers and unknown questions can still be passed to Deepak.
