"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Globe, Code2, ArrowRight, Search } from "lucide-react";

export interface PublicGroup {
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  codeCount: number;
}

interface Props {
  initialGroups: PublicGroup[];
}

export default function PublicGroupsDirectory({ initialGroups }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearch(q);
    }
  }, [searchParams]);

  const filteredGroups = initialGroups.filter((g) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      g.name.toLowerCase().includes(query) ||
      g.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Search Bar & Count Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Public Groups</h2>
          <p className="mt-1 text-sm text-slate-400">
            Browse publicly shared code libraries — no key needed to view.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter public groups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 transition focus:border-brand-500 focus:outline-none"
            />
          </div>

          <span className="flex-shrink-0 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {filteredGroups.length} {filteredGroups.length === 1 ? "group" : "groups"}
          </span>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80">
            <Globe className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-slate-300">
            {search ? `No groups match "${search}"` : "No public groups yet"}
          </h3>
          <p className="mb-5 max-w-xs text-sm text-slate-500">
            {search
              ? "Try searching for a different keyword or create a new group."
              : "Be the first to create a public group and share your lab code."}
          </p>
          <Link
            href="/create-group"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
          >
            Create a Group
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
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
                <p className="text-xs text-slate-500 font-mono">/g/{group.slug}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5" />
                  {group.codeCount} {group.codeCount === 1 ? "snippet" : "snippets"}
                </span>
                <span className="flex items-center gap-1 text-brand-400 opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
