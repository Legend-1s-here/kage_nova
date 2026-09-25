<div align="center">
<img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663886659791/XlGGebIXwOdZbODH.png" alt="KAGENOVA — group-based lab code sharing platform" width="100%" />

# ⌘ KAGENOVA ⌘

### *Share lab code solutions in seconds. Zero accounts. Just a group key.*

<p><strong>A focused code-sharing platform for students, teaching assistants, and instructors.</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

<blockquote><strong>One group key. One shared lab. Less time hunting through chat history.</strong></blockquote>
</div>

---

## ⚠️ Intellectual Property, Copyright & DMCA Notice

> **IMPORTANT:** This repository is made publicly accessible for **portfolio review, educational purposes, and GitHub community stars**.
> 
> **Copyright (c) 2026 Priyansh (Legend). All Rights Reserved.**
> 
> - 🚫 **No Unauthorized Re-Hosting / Copying:** You are strictly prohibited from copying, cloning, modifying, or deploying public copies/clones of this platform without prior written consent from the author.
> - ⚖️ **DMCA Protected:** Any unauthorized public clones, forks re-hosted on public domains (e.g. Vercel/Netlify), or copyright infringements are subject to immediate **GitHub DMCA Takedown** notices.

---

<div align="center">

![01 The Idea](https://img.shields.io/badge/01-THE_IDEA-38BDF8?style=for-the-badge&labelColor=07111F)

<h2>Code sharing without the ceremony.</h2>
</div>

**KAGENOVA** gives every lab group a small, focused workspace for source code. Create a group, share its key, and let classmates browse, upload, copy, download, or update the solutions they need — without forcing every contributor through another account system.

The platform is designed for class sections, lab batches, teaching assistants, and instructors who want a practical shared archive instead of scattered files and disappearing messages.

<table>
<tr>
<td width="25%" align="center"><strong>CREATE</strong><br><sub>Start a group in seconds</sub></td>
<td width="25%" align="center"><strong>UNLOCK</strong><br><sub>Enter a group key</sub></td>
<td width="25%" align="center"><strong>SHARE</strong><br><sub>Browse lab snippets</sub></td>
<td width="25%" align="center"><strong>SHIP</strong><br><sub>Copy or download code</sub></td>
</tr>
</table>

---

<div align="center">

![02 Product Preview](https://img.shields.io/badge/02-PRODUCT_PREVIEW-6366F1?style=for-the-badge&labelColor=07111F)

<h2>The workspace, at a glance.</h2>
<img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663886659791/JDbVcyMBslSySuLr.png" alt="KAGENOVA homepage showing group creation, public group exploration, and the three-step workflow" width="100%" />

<sub><strong>Create a group → unlock with a key → share lab codes.</strong></sub>

</div>

---

<div align="center">

![03 Group Spaces](https://img.shields.io/badge/03-GROUP_SPACES-22C55E?style=for-the-badge&labelColor=07111F)

<h2>Public when useful. Private when necessary.</h2>
</div>

KAGENOVA organizes code around **groups** rather than individual profiles. A group can represent a class section, a lab batch, a semester, a study circle, or any other shared coding space.

### Two visibility tiers
- **Public groups** appear in the homepage directory and can be browsed by anyone in real time.
- **Private / unlisted groups** stay out of the directory and are reachable through a direct URL such as `/g/[slug]`.

---

<div align="center">

![04 Secure Access](https://img.shields.io/badge/04-SECURE_ACCESS-8B5CF6?style=for-the-badge&labelColor=07111F)

<h2>A key, not an account maze.</h2>
</div>

The zero-login experience is intentionally lightweight, but group editing is still scoped and protected.

<table>
<tr>
<td width="50%" valign="top">
<h3>◈ KEY-SCOPED EDITING</h3>
The group admin key is stored as a bcrypt hash. A successful verification creates a secure, HTTP-only scoped JWT session cookie with a 12-hour expiry.
</td>
<td width="50%" valign="top">
<h3>◈ BRUTE-FORCE RESISTANCE</h3>
Failed group-key verification is protected by a sliding-window limiter: five failed attempts per ten minutes per IP address and group slug.
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>◈ MASTER MODERATOR PORTAL</h3>
A dedicated master moderator portal (`/mod`) allows the platform owner to oversee all public & private groups, view metrics, and delete any group or code.
</td>
<td width="50%" valign="top">
<h3>◈ CONTROLLED PAYLOADS</h3>
The server enforces a 200KB code-payload cap and validates submissions before they reach the database or renderer.
</td>
</tr>
</table>

---

<div align="center">

![05 Code Tools](https://img.shields.io/badge/05-CODE_TOOLS-F59E0B?style=for-the-badge&labelColor=07111F)

<h2>From paste to readable snippet.</h2>
</div>

KAGENOVA keeps the code itself at the center of the experience. Upload a source file or paste code directly, identify the language, then let the platform make it easy to inspect and reuse.

- Syntax highlighting for **15+ languages** (C, C++, Python, Java, JavaScript, TypeScript, SQL, Go, Rust, etc.).
- One-click **copy** with instant visual toast feedback.
- Direct **file download** for saving snippets with proper file extensions (`.py`, `.cpp`, etc.).
- Real-time search by query with `?q=` and filter by language with `?lang=`.
- Drag-and-drop source file uploads with automatic language detection.
- Complete group and snippet deletion with cascading cleanup.

---

<div align="center">

![06 API Surface](https://img.shields.io/badge/06-API_SURFACE-06B6D4?style=for-the-badge&labelColor=07111F)

</div>

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/groups` | List public groups with snippet counts | No |
| `POST` | `/api/groups` | Create a group with name, key, and visibility | No |
| `DELETE` | `/api/groups/[slug]` | Delete a group and cascade its snippets | Group key / Mod |
| `POST` | `/api/groups/[slug]/verify` | Verify group key and set scoped session cookie | No, rate limited |
| `GET` | `/api/groups/[slug]/session` | Check the current unlocked session | No |
| `DELETE` | `/api/groups/[slug]/session` | Lock the group and clear its cookie | No |
| `GET` | `/api/groups/[slug]/codes?q=&lang=` | Search and filter group snippets | No |
| `POST` | `/api/groups/[slug]/codes` | Upload a new snippet (max 200KB) | Group key / Mod |
| `PUT` | `/api/groups/[slug]/codes/[id]` | Update an existing snippet | Group key / Mod |
| `DELETE` | `/api/groups/[slug]/codes/[id]` | Delete a snippet | Group key / Mod |
| `POST` | `/api/mod/verify` | Master Moderator login verification | Mod Key |
| `GET` | `/api/mod/groups` | List all groups (public & private) with stats | Mod Session |
| `GET/DELETE` | `/api/mod/session` | Check or exit moderator session | No / Yes |

---

<div align="center">

![07 Stack](https://img.shields.io/badge/07-STACK-EC4899?style=for-the-badge&labelColor=07111F)

</div>

<table>
<tr>
<td width="50%" valign="top">
<h3>FRONTEND</h3>
<a href="https://nextjs.org/">Next.js 14</a> App Router · TypeScript · Tailwind CSS · Lucide Icons · <code>react-syntax-highlighter</code>
</td>
<td width="50%" valign="top">
<h3>DATA</h3>
<a href="https://www.mongodb.com/atlas">MongoDB Atlas</a> via Mongoose, with group and code-snippet persistence.
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>SECURITY</h3>
<code>bcryptjs</code> password hashing · <code>jsonwebtoken</code> scoped session cookies · sliding-window rate limiting · payload validation
</td>
<td width="50%" valign="top">
<h3>DEPLOYMENT</h3>
<a href="https://vercel.com/">Vercel</a> web application and serverless API route handlers with MongoDB Atlas as the database layer.
</td>
</tr>
</table>

---

<div align="center">

![08 Start Locally](https://img.shields.io/badge/08-START_LOCALLY-6366F1?style=for-the-badge&labelColor=07111F)

</div>

### Requirements
`Node.js 18+` · `npm` · a MongoDB connection string · a random JWT secret · a Moderator password

### Install

```bash
git clone https://github.com/Legend-1s-here/kage_nova.git
cd kage_nova
npm install
```

### Configure environment

Copy the example file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB URI, JWT secret, and Moderator Key:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kagenova?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
MOD_KEY=your_moderator_master_password
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

<div align="center">

![09 Verify](https://img.shields.io/badge/09-VERIFY-14B8A6?style=for-the-badge&labelColor=07111F)

</div>

Run the automated test suite (32 unit tests verifying auth, tokens, rate limiter, and validation):

```bash
npm test
npm run test:types
npm run build
```

The test suite covers the security-sensitive paths: bcrypt hashing, JWT cookie scope, Master Moderator authorization bypass, sliding-window rate limiting, and server-side payload validation.

---

<div align="center">

![10 Deploy](https://img.shields.io/badge/10-DEPLOY-22C55E?style=for-the-badge&labelColor=07111F)

</div>

### Vercel Deployment

1. Push the repository to GitHub.
2. Import it into [Vercel](https://vercel.com/).
3. Add `MONGODB_URI`, `JWT_SECRET`, and `MOD_KEY` in the project environment variables.
4. Deploy. Next.js will build the web app and serverless API route handlers.

---

## 👤 Author & Support

Created with ❤️ by **[Priyansh (Legend)](https://github.com/Legend-1s-here)**

If you find this project useful, please consider giving it a **⭐ Star** on GitHub!

---

## 📄 License

This project is released under a **Custom Proprietary & Non-Commercial License**. See [LICENSE](./LICENSE) for details.  
All Rights Reserved (c) 2026 Priyansh.
