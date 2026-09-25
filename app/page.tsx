import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  FolderOpen,
  Lock,
  PlusCircle,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import PublicGroupsDirectory, { PublicGroup } from "@/components/PublicGroupsDirectory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KAGENOVA — Lab Code Sharing for Students",
};

async function getPublicGroups(): Promise<PublicGroup[]> {
  try {
    await connectToDatabase();

    const groups = await Group.find({ isPublic: true })
      .select("name slug isPublic createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const groupIds = groups.map((g) => g._id);
    const counts = await LabCode.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    return groups.map((g) => ({
      name: g.name,
      slug: g.slug,
      isPublic: g.isPublic,
      createdAt: g.createdAt ? g.createdAt.toISOString() : new Date().toISOString(),
      codeCount: countMap.get(g._id.toString()) || 0,
    }));
  } catch (error) {
    console.error("Error fetching public groups directly from DB:", error);
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
          <span>Zero-login. Just a group key.</span>
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

      {/* Public Groups Directory (Real-time DB query + Live filter) */}
      <section id="explore">
        <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading directory…</div>}>
          <PublicGroupsDirectory initialGroups={publicGroups} />
        </Suspense>
      </section>
    </div>
  );
}
