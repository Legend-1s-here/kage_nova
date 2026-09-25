# KAGENOVA — Group-based Lab Code Sharing Platform

> **Share lab code solutions in seconds. Zero accounts. Just a group key.**

KAGENOVA is a modern, full-stack web application designed for students, teaching assistants, and instructors to organize, share, view, and download programming lab codes organized by groups (class sections, lab batches).

---

## ✨ Features

- 🚀 **Zero-Login Collaboration:** No student accounts or signups required. Enter a group access key to unlock uploading and editing.
- 🌐 **Two Visibility Tiers:**
  - **Public Groups:** Listed in the homepage directory, freely browseable by anyone.
  - **Private / Unlisted Groups:** Accessible only via direct URL (`/g/[slug]`).
- 🔐 **Key-Scoped Editing:** Group admin key is bcrypt-hashed in the database. Successful verification issues an HTTP-only, secure, scoped JWT session cookie (`12-hour expiry`).
- 🛡️ **Brute-Force Rate Limiting:** Built-in sliding-window rate limiter (5 failed attempts per 10 minutes per IP/slug).
- 💻 **Syntax Highlighting & Code Tools:** Full syntax highlighting for 15+ languages (C, C++, Python, Java, JavaScript, TypeScript, SQL, Go, Rust, etc.) with one-click copy and file download.
- 📁 **File Drag & Drop:** Upload code directly by pasting or uploading source code files (`.py`, `.cpp`, `.java`, etc.).
- 📦 **200KB Payload Cap:** Strict server-side validation preventing oversized code payloads and XSS vulnerabilities.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Database:** MongoDB Atlas via Mongoose
- **Authentication:** bcryptjs (password hashing) + jsonwebtoken (scoped session cookies)
- **Syntax Highlighting:** react-syntax-highlighter (Atom One Dark theme)
- **Deployment:** Vercel (Web App) + MongoDB Atlas (Database)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (tested on v20 and v24)
- [npm](https://www.npmjs.com/) (or `npm.cmd` on Windows)
- A MongoDB connection string (local instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone & Install Dependencies

```bash
cd CodeAdda
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB URI and a random secret key:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kagenova?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite (verifies bcrypt hashing, JWT cookie scope, sliding-window rate limiter, and server-side validation):

```bash
npm test
```

Run TypeScript type check:

```bash
npm run test:types
```

Run production build:

```bash
npm run build
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/groups` | List all public groups with snippet counts | No |
| `POST` | `/api/groups` | Create a new group (name, key, isPublic) | No |
| `POST` | `/api/groups/[slug]/verify` | Verify group key & set scoped session cookie | No (rate limited) |
| `GET` | `/api/groups/[slug]/session` | Check if current browser session is unlocked | No |
| `DELETE` | `/api/groups/[slug]/session` | Lock session / clear group cookie | No |
| `GET` | `/api/groups/[slug]/codes` | List snippets for a group (`?q=` search, `?lang=`) | No |
| `POST` | `/api/groups/[slug]/codes` | Upload new code snippet (max 200KB) | Yes (Group Key / Cookie) |
| `PUT` | `/api/groups/[slug]/codes/[id]` | Update an existing code snippet | Yes (Group Key / Cookie) |
| `DELETE` | `/api/groups/[slug]/codes/[id]` | Delete a code snippet | Yes (Group Key / Cookie) |

---

## ☁️ Deployment Guide

### Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the **Environment Variables** section of the Vercel project settings, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
4. Click **Deploy**. Next.js will automatically build and deploy the app and serverless API route handlers.

### MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Under **Database Access**, create a database user with read/write privileges.
3. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) to allow Vercel serverless functions to connect.
4. Click **Connect** → **Drivers** (Node.js) and copy the connection string into your `.env.local` or Vercel environment variables.

---

## 📄 License

MIT License — Built for students and educators.
>>>>>>> d9d6e5e (feat: initial release of Kagenova)
