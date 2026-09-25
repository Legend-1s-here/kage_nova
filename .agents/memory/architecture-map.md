# Architecture Map

<!--
A lightweight, human-annotated substitute for re-deriving the codebase's
shape from scratch every session. Update this when the *structure* changes
(a new service, a moved module, a new boundary) — not on every commit.

Run `scripts/generate-repo-map.sh` to regenerate the tree below as a
starting point, then trim and annotate it by hand. The raw file list isn't
what's worth paying tokens to read — the annotations are.

If Graphify is installed (`.agents/rules/external-tools.md`),
`graphify-out/GRAPH_REPORT.md` is a stronger, automatically-updated
alternative to this file for repo orientation — read that first when it
exists. This file still earns its keep for the hand-written parts a graph
can't infer: which wrong guesses to head off, which layering is
deliberate vs. historical accident.
-->

## Repo shape
```
CodeAdda/
├── app/
│   ├── layout.tsx                     # Global root layout + metadata + Tailwind styles
│   ├── page.tsx                       # Landing page (explainer, create/join buttons)
│   ├── create-group/
│   │   └── page.tsx                   # Group creation form & link generator
│   ├── g/[slug]/
│   │   ├── page.tsx                   # Group key gate & dashboard (code list, search, filter)
│   │   └── upload/
│   │       └── page.tsx               # Dedicated upload page (or modal integration)
│   └── api/
│       └── groups/
│           ├── route.ts               # POST: create group
│           └── [slug]/
│               ├── verify/route.ts    # POST: verify group key & set signed JWT cookie
│               └── codes/route.ts     # GET: list codes, POST: upload code snippet
├── components/                        # Reusable UI components (CodeViewer, KeyModal, Header, etc.)
├── models/
│   ├── Group.ts                       # Mongoose model: _id, name, slug, keyHash, isPublic (boolean), createdAt
│   └── LabCode.ts                     # Mongoose model: _id, groupId, title, language, code, etc.
├── lib/
│   ├── db.ts                          # MongoDB/Mongoose cached singleton connection
│   ├── auth.ts                        # bcrypt hashing/compare, JWT signing/verifying for cookies
│   ├── rate-limit.ts                  # In-memory / cache rate-limiter for key verification
│   └── validation.ts                  # Server-side input validation & length/size limits
├── docs/                              # Architecture decisions, glossary, DoD
└── .agents/                           # Memory bank, rules, workflows
```

## Entry points
- Next.js root layout: `app/layout.tsx`
- Landing page: `app/page.tsx`
- Group Dashboard: `app/g/[slug]/page.tsx`
- Primary API routes: `app/api/groups/route.ts`, `app/api/groups/[slug]/verify/route.ts`, `app/api/groups/[slug]/codes/route.ts`

## Key modules
- `models/Group.ts` — Owns the group schema and index definitions. Must not import from `app/`.
- `models/LabCode.ts` — Owns the snippet schema and relationship to Group. Must not import from `app/`.
- `lib/db.ts` — Owns the Mongoose connection lifecycle, handles hot-reload caching in Next.js.
- `lib/auth.ts` — Owns key hashing (bcrypt) and JWT cookie generation/verification.
- `lib/rate-limit.ts` — Owns rate-limiting logic (e.g. 5 attempts / 10 minutes per IP/slug).
- `lib/validation.ts` — Owns server-side payload validation (title length, 200KB code size cap).

## Where things are NOT
- There is NO `User` model. Authentication is strictly group-level via shared access keys.
- Plaintext access keys are NEVER stored in the database or returned in JSON responses (only bcrypt hash is stored).
- Key verification does not happen on the client — it must be verified server-side in `/api/groups/[slug]/verify`.
- Database queries do NOT run in Client Components (`"use client"`). All data access is in Route Handlers or Server Components.
