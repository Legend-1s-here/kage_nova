# Active Context

<!--
Updated at the START and END of every session — see
`.agents/workflows/session-protocol.md`. This is the first file read in a
new session, before anything else. Keep it *current*, not historical: this
is "where things stand right now," not a changelog. Overwrite stale
sections rather than appending to them forever.
-->

## Right now
Sub-subgroups feature completed, verified with 58/58 tests, clean Next.js build, and ready to deploy.

## Last session
- Extended subgroup nesting to allow exactly 1 more level: Group -> Subgroup -> Sub-subgroup (max depth 2).
- Updated `POST /api/groups` depth validation: allows nesting under a subgroup by checking that the grandparent's parent does not exist, blocking depth > 2.
- Updated `GET /api/groups/[slug]/subgroups` to calculate and return `parentDepth` (0, 1, or 2).
- Updated `app/g/[slug]/page.tsx` UI: dynamic labels ("Add Subgroup" vs "Add Sub-subgroup", "Subgroups" vs "Sub-subgroups"), and completely hides subgroup creation when at depth 2.
- Updated `DELETE /api/groups/[slug]` to cascade delete both child subgroups and grandchild sub-subgroups and all associated codes.
- Added tests in `scripts/verify-logic.ts` validating sub-subgroup nested slug creation (`cs101--week-3--day-1`). Total 58/58 tests pass.
- Build clean.

## Next
- Optional: show parent group name/link on subgroup dashboard (breadcrumb nav).
- Optional: subgroup count shown on landing page group cards.

## Open questions
- None currently.
