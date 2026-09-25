# Project Brief

<!--
The foundation document. Everything else in the memory bank, and every
architectural decision, should be consistent with this. Keep it short — a
page, not a spec. This is the one memory-bank file worth getting a human to
review carefully, since every other file and every agent session inherits
its framing.
-->

## What this is
KAGENOVA is a group-based lab code sharing web application designed for students and educators. Students can browse and upload programming lab codes and snippets organized by groups (e.g. class sections, batches). It requires no sign-in or accounts. A small group key/password created by the group admin is required to upload or edit content. Groups can be set to either Public (discoverable and visible in the public directory) or Private/Unlisted (accessible only via direct link or key).

## Core goals
- Enable frictionless group creation with unique slugs, admin key/password, and visibility option (Public vs. Private/Unlisted).
- Public groups can be browsed without sign-in, while private groups require direct link or group access.
- Uploading and editing code snippets is protected by the group key/password (bcrypt-hashed server-side, issuing a short-lived scoped JWT session cookie).
- Support code upload with title, language selection, code content, optional uploader name, and description.
- Provide a clean, student-friendly browsing interface with syntax highlighting, search/filter by title and language, copy-to-clipboard, and download-as-file.
- Robust security: bcrypt key hashing, brute-force rate-limiting on key verification (5 tries / 10 min), server-side validation, ~200KB payload cap, and XSS sanitization.

## Explicit non-goals
- Individual user accounts, passwords, or personal profiles.
- Heavy role-based authorization matrices (authorization is group-scoped via the admin key).
- In-browser code execution / sandbox runners.
- Cloud object storage for massive binary files (enforced ~200KB code size limit).

## Constraints
- Stack: Next.js 14 (App Router), Tailwind CSS, TypeScript.
- Database: MongoDB Atlas (free tier) via Mongoose.
- Auth model: Group key authentication issuing short-lived signed JWT session cookies for upload/edit actions.
- Deployment target: Vercel for the web app + MongoDB Atlas for data.
- Payload limits: ~200KB max code snippet size, max title lengths, rate-limiting on key attempts.

## Primary users
- Students in lab classes or batch sections needing a quick, hassle-free platform to share, inspect, and retrieve lab code solutions.
- Batch leaders/TAs/Instructors creating groups with optional public/private visibility and protected editing keys.
