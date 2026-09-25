import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  FolderOpen,
  Globe,
  Lock,
  PlusCircle,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "KAGENOVA — Lab Code Sharing for Students",
};

interface PublicGroup {
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  codeCount: number;
}

async function getPublicGroups(): Promise<PublicGroup[]> {
  try {
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/groups`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.groups || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const publicGroups = await getPublicGroups();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
          <Code2 className="h-3.5 w-3.5" />
          <span>Zero-login. Just a key.</span>
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Share Lab Code.{" "}
          <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            Instantly.
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
          KAGENOVA lets students upload and browse programming lab solutions
          organized by groups — no accounts, no signup. Just share a group key
          and start collaborating.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/create-group"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            Create a Group
          </Link>
          <a
            href="#explore"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            <FolderOpen className="h-4 w-4" />
            Explore Public Groups
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          How KAGENOVA Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: <Users className="h-6 w-6 text-brand-400" />,
              title: "1. Create a Group",
              description:
                "Set a group name, choose public or private, and create a short key/password. Share the link or key with your classmates.",
            },
            {
              icon: <Lock className="h-6 w-6 text-emerald-400" />,
              title: "2. Unlock with Key",
              description:
                "Anyone with the group link can browse public groups freely. Enter the group key to unlock uploading and editing.",
            },
            {
              icon: <BookOpen className="h-6 w-6 text-indigo-400" />,
              title: "3. Share Lab Codes",
              description:
                "Upload code snippets by title, language, and description. Browse, search, copy, or download solutions with syntax highlighting.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800">
                {step.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Public Groups Directory */}
      <section id="explore">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Public Groups</h2>
            <p className="mt-1 text-sm text-slate-400">
              Browse publicly shared code libraries — no key needed to view.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {publicGroups.length} groups
          </span>
        </div>

        {publicGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80">
              <Globe className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-slate-300">
              No public groups yet
            </h3>
            <p className="mb-5 max-w-xs text-sm text-slate-500">
              Be the first to create a public group and share your lab code with
              everyone.
            </p>
            <Link
              href="/create-group"
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              <PlusCircle className="h-4 w-4" />
              Create First Group
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicGroups.map((group) => (
              <Link
                key={group.slug}
                href={`/g/${group.slug}`}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-brand-500/50 hover:bg-slate-900"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600/30 to-indigo-600/30 text-brand-400">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                      <Globe className="h-3 w-3" />
                      Public
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-white transition group-hover:text-brand-400">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500">/{group.slug}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5" />
                    {group.codeCount}{" "}
                    {group.codeCount === 1 ? "snippet" : "snippets"}
                  </span>
                  <span className="flex items-center gap-1 text-brand-400 opacity-0 transition group-hover:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
