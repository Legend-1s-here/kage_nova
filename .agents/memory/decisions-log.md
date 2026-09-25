# Decisions Log

<!--
One line per ADR in `docs/adr/`. This is an index, not a duplicate — read
this to know what's already been decided without opening every ADR file.
Add a line here in the same session an ADR is accepted, per
`.agents/workflows/session-protocol.md`.
-->

| ADR | Decision | Status | Made by |
|---|---|---|---|
| ADR-0001 | Next.js 14 App Router + Tailwind CSS for full-stack React frontend and route handlers | Accepted | human |
| ADR-0002 | MongoDB Atlas with Mongoose for document persistence and indexing | Accepted | human |
| ADR-0003 | Group-level shared key auth: bcrypt hash in DB, scoped short-lived JWT session cookie | Accepted | human |
| ADR-0004 | In-memory token bucket rate limiting on `/api/groups/[slug]/verify` (5 req / 10 min per IP) | Accepted | agent default — unconfirmed |
| ADR-0005 | Syntax highlighting library: `react-syntax-highlighter` or `shiki` | Accepted | agent default — unconfirmed |
| ADR-0006 | Two-tier group visibility (public vs. private/unlisted) with group key required for editing/uploading | Accepted | human |

<!--
"Made by" is either "human" (a person chose this) or "agent default —
unconfirmed" (nobody had a strong opinion, so the agent picked the
standard/safe option per `.agents/workflows/bootstrap.md` or an
architecture ADR, and it hasn't been deliberately reviewed since).
Anything still marked "agent default" after the project matures is worth
a second look — it was a reasonable placeholder, not necessarily the
right long-term call.
-->
