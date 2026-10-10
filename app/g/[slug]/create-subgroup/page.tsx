"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Lock, Eye, EyeOff } from "lucide-react";

export default function CreateSubgroupPage() {
  const params = useParams();
  const parentSlug = typeof params.slug === "string" ? params.slug : "";
  const router = useRouter();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentName, setParentName] = useState("");

  // Fetch parent group name for display
  useEffect(() => {
    if (!parentSlug) return;
    fetch(`/api/groups/${parentSlug}/session`)
      .then((r) => r.json())
      .then((d) => {
        if (d.group?.name) setParentName(d.group.name);
      })
      .catch(() => {});
  }, [parentSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Subgroup name is required."); return; }
    if (key.length < 6) { setError("Access key must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), key, parentSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create subgroup.");
        return;
      }
      // Navigate to the new subgroup
      router.push(`/g/${data.group.slug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      {/* Back link */}
      <Link
        href={`/g/${parentSlug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {parentName || parentSlug}
      </Link>

      {/* Card */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Add Subgroup</h1>
            <p className="text-xs text-slate-400">
              Inside <span className="font-medium text-slate-300">{parentName || parentSlug}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subgroup name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Subgroup Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Week 3 — Trees"
              maxLength={80}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-slate-600">{name.length}/80</p>
          </div>

          {/* Access key */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Access Key
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Anyone with this key can unlock and upload to the subgroup.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Subgroup"}
          </button>
        </form>
      </div>
    </div>
  );
}
