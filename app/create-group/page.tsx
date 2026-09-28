"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Code2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  ArrowLeft,
  CheckCircle,
  Copy,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface CreatorUser {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
}

function CreateGroupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("authError");

  const [creator, setCreator] = useState<CreatorUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // Check creator session on load
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCreator(data.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCreator(null);
    } catch {
      // Logout failed
    }
  };

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

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // 1. Success Screen after group creation
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

  // 2. Unauthenticated Gate — Require Google Sign-In before creating a group
  if (!creator) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-white">Creator Verification</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            To prevent spam, abuse, and inappropriate content, creating a group requires a quick 1-click Google verification.
          </p>

          <div className="my-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left">
            <h4 className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              How it works:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Group Creators:</strong> Verified via Google to ensure community safety.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400">✓</span>
                <span><strong>Classmates & Visitors:</strong> No login required to browse, copy, or upload with group key.</span>
              </li>
            </ul>
          </div>

          {authError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                {authError === "banned"
                  ? "This account is suspended from creating groups."
                  : "Google sign-in was cancelled or failed. Please try again."}
              </span>
            </div>
          )}

          <a
            href="/api/auth/google?redirect=/create-group"
            className="flex items-center justify-center gap-3 w-full rounded-xl border border-slate-700 bg-white py-3 px-4 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-[0.98]"
          >
            {/* Google SVG Logo */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </a>

          <div className="mt-4">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
              ← Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Group Creation Form
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

      {/* Creator Profile Badge */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
        <div className="flex items-center gap-3">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-9 w-9 rounded-full border border-emerald-500/40"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Creator
            </div>
            <div className="text-xs font-medium text-slate-200">
              {creator.name} <span className="text-slate-400">({creator.email})</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200"
          title="Switch account"
        >
          <LogOut className="h-3 w-3" />
          <span>Sign out</span>
        </button>
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

export default function CreateGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      }
    >
      <CreateGroupFormContent />
    </Suspense>
  );
}
