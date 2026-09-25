"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Eye, EyeOff, Globe, Lock, ArrowLeft, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    key: "",
    isPublic: true,
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    name: string;
    slug: string;
    isPublic: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate slug preview from name
  const slugPreview = form.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Group name is required.");
      return;
    }
    if (form.key.length < 6) {
      setError("Access key must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          key: form.key.trim(),
          isPublic: form.isPublic,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setCreated(data.group);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const groupUrl = created
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/g/${created.slug}`
    : "";

  const handleCopy = () => {
    if (groupUrl) {
      navigator.clipboard.writeText(groupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (created) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-9 w-9 text-emerald-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Group Created!</h1>
          <p className="mb-6 text-sm text-slate-400">
            <strong className="text-slate-200">{created.name}</strong> is ready.
            Share the link below with your classmates.
          </p>

          {/* Share URL box */}
          <div className="mb-4 flex items-center gap-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5">
            <span className="flex-1 truncate text-left text-sm font-mono text-slate-200">
              {groupUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              {copied ? (
                <span className="text-emerald-400">Copied!</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </span>
              )}
            </button>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>
              Remember your group key — it&apos;s required to upload and edit codes.
              It cannot be recovered.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/g/${created.slug}`)}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Go to My Group →
            </button>
            <button
              onClick={() => {
                setCreated(null);
                setForm({ name: "", key: "", isPublic: true });
              }}
              className="w-full rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-500"
            >
              Create Another Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-white">Create a New Group</h1>
        <p className="mt-1 text-sm text-slate-400">
          Set a name, choose visibility, and create an access key. Share the
          link and key with your classmates.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
      >
        {/* Group Name */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Group Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. CS101 – Algorithm Lab"
            maxLength={80}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {slugPreview && (
            <p className="mt-1.5 text-xs text-slate-500">
              URL slug preview:{" "}
              <span className="font-mono text-slate-300">
                /g/{slugPreview}
              </span>
            </p>
          )}
        </div>

        {/* Visibility Toggle */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Visibility
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublic: true }))}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                form.isPublic
                  ? "border-brand-500 bg-brand-500/10 text-white"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <Globe
                className={`mb-2 h-5 w-5 ${form.isPublic ? "text-brand-400" : "text-slate-500"}`}
              />
              <span className="text-sm font-semibold">Public</span>
              <span className="mt-0.5 text-xs text-slate-500">
                Listed on the homepage. Anyone can browse.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublic: false }))}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                !form.isPublic
                  ? "border-brand-500 bg-brand-500/10 text-white"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
              }`}
            >
              <Lock
                className={`mb-2 h-5 w-5 ${!form.isPublic ? "text-brand-400" : "text-slate-500"}`}
              />
              <span className="text-sm font-semibold">Private</span>
              <span className="mt-0.5 text-xs text-slate-500">
                Unlisted. Access only via direct link.
              </span>
            </button>
          </div>
        </div>

        {/* Access Key */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Access Key / Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Code2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showKey ? "text" : "password"}
              value={form.key}
              onChange={(e) =>
                setForm((f) => ({ ...f, key: e.target.value }))
              }
              placeholder="Min. 6 characters"
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-10 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Required to upload or edit codes. Store it safely — it cannot be
            recovered.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? "Creating Group…" : "Create Group"}
        </button>
      </form>
    </div>
  );
}
