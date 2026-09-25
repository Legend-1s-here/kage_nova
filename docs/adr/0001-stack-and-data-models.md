# ADR-0001: Next.js 14 App Router, Mongoose, and Key-Scoped Group Auth

**Status:** Accepted
**Date:** 2026-09-25

## Context
KAGENOVA is a full-stack web application designed for students and educators to share and access lab code solutions organized by groups without individual accounts. We need:
1. A fast, modern full-stack web framework with serverless/edge compatibility on Vercel.
2. A flexible document database for groups and variable-size code snippets.
3. An authentication mechanism that secures uploads and edits behind a group key while allowing public browsing when desired, without requiring user accounts.

## Decision
1. **Framework:** Next.js 14 with App Router, TypeScript, and Tailwind CSS.
2. **Database:** MongoDB Atlas (free tier) connected via Mongoose with a cached connection singleton (`lib/db.ts`).
3. **Data Models:**
   - `Group`: `name`, `slug` (unique indexed), `keyHash` (bcrypt), `isPublic` (boolean), `createdAt`.
   - `LabCode`: `groupId` (ref to Group), `title`, `language`, `code` (max 200KB), `uploaderName`, `description`, `createdAt`.
4. **Auth & Security:**
   - Group admin key hashed with `bcryptjs`.
   - Key verification endpoint sets an HTTP-only, secure, scoped JWT session cookie.
   - Code upload and edit routes verify the JWT cookie against the group slug.
   - Brute-force rate limiting (5 attempts per 10 minutes) on key verification.

## Alternatives considered
- **PostgreSQL / Prisma:** Relational database with rigid migrations. MongoDB is better aligned with rapid prototype development, arbitrary code text payloads, and the requirement for free Atlas hosting.
- **Full User Authentication (NextAuth / Auth.js):** Rejected to eliminate account friction for students. Shared group keys satisfy the zero-login requirement.
- **Local Storage Auth:** Rejected because HTTP-only signed cookies provide stronger defense against XSS token exfiltration.

## Consequences
- Single-command dev server and production builds (`npm run dev`, `npm run build`).
- Clean separation between server-side DB/auth logic in `lib/` and client components.
- No user management overhead.
