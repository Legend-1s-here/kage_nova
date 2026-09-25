# Active Context

<!--
Updated at the START and END of every session — see
`.agents/workflows/session-protocol.md`. This is the first file read in a
new session, before anything else. Keep it *current*, not historical: this
is "where things stand right now," not a changelog. Overwrite stale
sections rather than appending to them forever.
-->

## Right now
Group Deletion and Master Moderator System (`/mod`) completed, verified with 32/32 automated tests, and successfully deployed live on Vercel.

## Last session
- Built Master Moderator auth system (`MOD_KEY=Priyansh63`, `kg_mod_sess` 24h JWT cookie, Mod bypass for all groups).
- Implemented `DELETE /api/groups/[slug]` with cascading deletion of all associated lab codes.
- Built Moderator API routes (`/api/mod/verify`, `/api/mod/session`, `/api/mod/groups`).
- Built Master Moderator Portal at `/mod` (password gate, overview stats, searchable all-groups table with public/private badges, one-click group deletion with confirmation modal).
- Added "Delete Group" button on group dashboard (`/g/[slug]`) when unlocked or in Mod mode.
- Added Moderator Mode badge and Navbar indicator.
- Set `MOD_KEY` in Vercel environment variables and deployed live.
- Built authentication & security system: bcrypt key hashing, scoped JWT session cookies (`lib/auth.ts`), sliding-window brute-force rate limiter (`lib/rate-limit.ts`), and server-side validation with 200KB payload cap (`lib/validation.ts`).
- Implemented all Next.js API route handlers: group creation, public group directory, key verification, session check, code list/filter, upload, edit, and delete.
- Built responsive Tailwind UI: landing page (`/`), group creation (`/create-group`), group dashboard (`/g/[slug]`), code viewer with syntax highlighting and copy/download (`components/LabCodeCard.tsx`), and upload page (`/g/[slug]/upload`).
- Wrote 28 automated tests in `scripts/verify-logic.ts` (`npm test`).
- Created project `README.md` with local setup and Vercel/MongoDB Atlas deployment guide.

## Next
- Configure local `.env.local` with your MongoDB Atlas connection string (`MONGODB_URI`) to run with live database data.
- Optional enhancements: One-time admin recovery token, view counts, dark/light theme toggle.

## Open questions
- None. Ready for deployment and live testing.
