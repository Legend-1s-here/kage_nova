<div align="center"> <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663886659791/XlGGebIXwOdZbODH.png" alt="KAGENOVA — group-based lab code sharing platform" width="100%" /> <h1>⌘ KAGENOVA ⌘</h1> <h3><em>Share lab code solutions in seconds. Zero accounts. Just a group key.</em></h3> <p><strong>A focused code-sharing platform for students, teaching assistants, and instructors.</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-7C3AED?style=for-the-badge)](./LICENSE)


<blockquote><strong>One group key. One shared lab. Less time hunting through chat history.</strong></blockquote> </div>

---

<div align="center">

![01 The Idea](https://img.shields.io/badge/01-THE_IDEA-38BDF8?style=for-the-badge&labelColor=07111F)

<h2>Code sharing without the ceremony.</h2> </div>

**KAGENOVA** gives every lab group a small, focused workspace for source code. Create a group, share its key, and let classmates browse, upload, copy, download, or update the solutions they need — without forcing every contributor through another account system.

The platform is designed for class sections, lab batches, teaching assistants, and instructors who want a practical shared archive instead of scattered files and disappearing messages.

<table>
<tr>
<td width="25%" align="center"><strong>CREATE</strong>  
<sub>Start a group in seconds</sub></td>
<td width="25%" align="center"><strong>UNLOCK</strong>  
<sub>Enter a group key</sub></td>
<td width="25%" align="center"><strong>SHARE</strong>  
<sub>Browse lab snippets</sub></td>
<td width="25%" align="center"><strong>SHIP</strong>  
<sub>Copy or download code</sub></td>
</tr>
</table>

## 

<div align="center">

![02 Product Preview](https://img.shields.io/badge/02-PRODUCT_PREVIEW-6366F1?style=for-the-badge&labelColor=07111F)

<h2>The workspace, at a glance.</h2> <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663886659791/JDbVcyMBslSySuLr.png" alt="KAGENOVA homepage showing group creation, public group exploration, and the three-step workflow" width="100%" />

<sub><strong>Create a group → unlock with a key → share lab codes.</strong></sub>

</div>

## 

<div align="center">

![03 Group Spaces](https://img.shields.io/badge/03-GROUP_SPACES-22C55E?style=for-the-badge&labelColor=07111F)

<h2>Public when useful. Private when necessary.</h2> </div>

KAGENOVA organizes code around **groups** rather than individual profiles. A group can represent a class section, a lab batch, a semester, a study circle, or any other shared coding space.

### Two visibility tiers

- **Public groups** appear in the homepage directory and can be browsed by anyone.

- **Private / unlisted groups** stay out of the directory and are reachable through a direct URL such as `/g/[slug]`.

This gives instructors and student groups a simple choice: make a repository discoverable, or share the route only with the people who need it.

## 

<div align="center">

![04 Secure Access](https://img.shields.io/badge/04-SECURE_ACCESS-8B5CF6?style=for-the-badge&labelColor=07111F)

<h2>A key, not an account maze.</h2> </div>

The zero-login experience is intentionally lightweight, but group editing is still scoped and protected.

<table>
<tr>
<td width="50%" valign="top"> <h3>◈ KEY-SCOPED EDITING</h3>

The group admin key is stored as a bcrypt hash. A successful verification creates a secure, HTTP-only scoped JWT session cookie with a 12-hour expiry.

</td>
<td width="50%" valign="top"> <h3>◈ BRUTE-FORCE RESISTANCE</h3>

Failed group-key verification is protected by a sliding-window limiter: five failed attempts per ten minutes per IP address and group slug.

</td>
</tr>
<tr>
<td width="50%" valign="top"> <h3>◈ ISOLATED SESSIONS</h3>

Unlocking one group does not expose editing access to every other group. Each session remains scoped to the group that was verified.

</td>
<td width="50%" valign="top"> <h3>◈ CONTROLLED PAYLOADS</h3>

The server enforces a 200KB code-payload cap and validates submissions before they reach the database or renderer.

</td>
</tr>
</table>

## 

<div align="center">

![05 Code Tools](https://img.shields.io/badge/05-CODE_TOOLS-F59E0B?style=for-the-badge&labelColor=07111F)

<h2>From paste to readable snippet.</h2> </div>

KAGENOVA keeps the code itself at the center of the experience. Upload a source file or paste code directly, identify the language, then let the platform make it easy to inspect and reuse.

- Syntax highlighting for **15+ languages**.

- Support for C, C++, Python, Java, JavaScript, TypeScript, SQL, Go, Rust, and more.

- One-click **copy** for quick reuse in a local editor.

- Direct **file download** for saving a snippet as a source file.

- Search by query with `?q=`.

- Filter by language with `?lang=`.

- Drag-and-drop source uploads for `.py`, `.cpp`, `.java`, and other code files.

- Clear group-level snippet organization instead of one endless feed.

## 

<div align="center">

![06 API Surface](https://img.shields.io/badge/06-API_SURFACE-06B6D4?style=for-the-badge&labelColor=07111F)

</div>

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/groups` | List public groups with snippet counts | No |
| `POST` | `/api/groups` | Create a group with name, key, and visibility | No |
| `POST` | `/api/groups/[slug]/verify` | Verify group key and set scoped session cookie | No, rate limited |
| `GET` | `/api/groups/[slug]/session` | Check the current unlocked session | No |
| `DELETE` | `/api/groups/[slug]/session` | Lock the group and clear its cookie | No |
| `GET` | `/api/groups/[slug]/codes?q=&lang=` | Search and filter group snippets | No |
| `POST` | `/api/groups/[slug]/codes` | Upload a new snippet | Group key / cookie |
| `PUT` | `/api/groups/[slug]/codes/[id]` | Update an existing snippet | Group key / cookie |
| `DELETE` | `/api/groups/[slug]/codes/[id]` | Delete a snippet | Group key / cookie |

## 

<div align="center">

![07 Stack](https://img.shields.io/badge/07-STACK-EC4899?style=for-the-badge&labelColor=07111F)

</div> <table>
<tr>
<td width="50%" valign="top"> <h3>FRONTEND</h3>

[Next.js 14](https://nextjs.org/) App Router · TypeScript · Tailwind CSS · Lucide Icons · `react-syntax-highlighter`

</td>
<td width="50%" valign="top"> <h3>DATA</h3>

[MongoDB Atlas](https://www.mongodb.com/atlas) via Mongoose, with group and code-snippet persistence.

</td>
</tr>
<tr>
<td width="50%" valign="top"> <h3>SECURITY</h3>

`bcryptjs` password hashing · `jsonwebtoken` scoped session cookies · rate limiting · payload validation

</td>
<td width="50%" valign="top"> <h3>DEPLOYMENT</h3>

[Vercel](https://vercel.com/) web application and serverless API route handlers with MongoDB Atlas as the database layer.

</td>
</tr>
</table>

## 

<div align="center">

![08 Start Locally](https://img.shields.io/badge/08-START_LOCALLY-6366F1?style=for-the-badge&labelColor=07111F)

</div>

### Requirements

`Node.js 18+` · `npm` · a MongoDB connection string · a random JWT secret

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

Then set the database URI and a strong secret:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kagenova?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 

<div align="center">

![09 Verify](https://img.shields.io/badge/09-VERIFY-14B8A6?style=for-the-badge&labelColor=07111F)

</div>

Run the automated checks:

```bash
npm test
npm run test:types
npm run build
```

The test suite covers the security-sensitive paths: bcrypt hashing, JWT cookie scope, sliding-window rate limiting, and server-side payload validation.

## 

<div align="center">

![10 Deploy](https://img.shields.io/badge/10-DEPLOY-22C55E?style=for-the-badge&labelColor=07111F)

</div>

### Vercel

1. Push the repository to GitHub or GitLab.

1. Import it into [Vercel](https://vercel.com/).

1. Add `MONGODB_URI` and `JWT_SECRET` in the project environment variables.

1. Deploy. Next.js will build the web app and serverless API route handlers.

### MongoDB Atlas

1. Create a free cluster.

1. Create a database user with read/write privileges.

1. Configure network access for your deployment environment.

1. Copy the driver connection string into `.env.local` or Vercel’s environment variables.

## 

<div align="center">

![11 Design Language](https://img.shields.io/badge/11-DESIGN_LANGUAGE-38BDF8?style=for-the-badge&labelColor=07111F)

<h2>Less noise. More shared momentum.</h2> <p>KAGENOVA treats code sharing as a focused group ritual: a small key opens a practical workspace, readable snippets replace buried attachments, and the interface stays out of the way of the lab.</p>
<blockquote><strong>Open the group. Find the code. Keep moving.</strong>  
<sub>zero accounts · scoped access · built for labs</sub></blockquote> </div>

## License

KAGENOVA is released under the [MIT License](./LICENSE).
