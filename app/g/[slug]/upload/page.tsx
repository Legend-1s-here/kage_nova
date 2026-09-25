"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  ChevronDown,
  Eye,
  EyeOff,
  Upload,
  Lock,
} from "lucide-react";

const LANGUAGES = [
  "C", "C++", "Python", "Java", "JavaScript", "TypeScript",
  "SQL", "HTML", "CSS", "Go", "Rust", "PHP", "Bash", "Ruby",
  "Kotlin", "Swift", "Other",
];

export default function UploadPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const router = useRouter();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showKeyField, setShowKeyField] = useState(false);
  const [unlockKey, setUnlockKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const [form, setForm] = useState({
    title: "",
    language: "Python",
    code: "",
    uploaderName: "",
    description: "",
  });

  const [langOpen, setLangOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check session on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/groups/${slug}/session`)
      .then((r) => r.json())
      .then((data) => {
        setIsUnlocked(data.unlocked || false);
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [slug]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockKey.trim()) {
      setUnlockError("Enter the group key.");
      return;
    }
    setUnlocking(true);
    setUnlockError("");
    try {
      const res = await fetch(`/api/groups/${slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: unlockKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUnlockError(data.error || "Incorrect key.");
        return;
      }
      setIsUnlocked(true);
      setShowKeyField(false);
      setUnlockKey("");
    } catch {
      setUnlockError("Network error.");
    } finally {
      setUnlocking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    if (file.size > 204800) {
      setFileError("File exceeds 200KB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        setForm((f) => ({ ...f, code: content }));
      }
    };
    reader.readAsText(file);

    // Auto-detect language from extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const extToLang: Record<string, string> = {
      c: "C",
      cpp: "C++",
      py: "Python",
      java: "Java",
      js: "JavaScript",
      ts: "TypeScript",
      sql: "SQL",
      html: "HTML",
      css: "CSS",
      go: "Go",
      rs: "Rust",
      php: "PHP",
      sh: "Bash",
      rb: "Ruby",
      kt: "Kotlin",
      swift: "Swift",
    };
    if (extToLang[ext]) {
      setForm((f) => ({ ...f, language: extToLang[ext] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!form.code.trim()) {
      setSubmitError("Code cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${slug}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          language: form.language,
          code: form.code,
          uploaderName: form.uploaderName.trim(),
          description: form.description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setIsUnlocked(false);
          setSubmitError("Session expired. Please unlock editing again.");
          return;
        }
        setSubmitError(data.error || "Upload failed. Please try again.");
        return;
      }

      // Success — redirect to group dashboard
      router.push(`/g/${slug}`);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400 text-sm">
        Checking session…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/g/${slug}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Group
        </Link>
        <h1 className="text-2xl font-bold text-white">Upload Lab Code</h1>
        <p className="mt-1 text-sm text-slate-400">
          Share a code snippet with your group. Group key required.
        </p>
      </div>

      {/* Unlock gate */}
      {!isUnlocked && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-amber-400">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-semibold">Editing Locked</span>
          </div>
          <p className="mb-3 text-xs text-slate-400">
            You need to enter the group key to upload code.
          </p>
          {!showKeyField ? (
            <button
              onClick={() => setShowKeyField(true)}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
            >
              Enter Group Key
            </button>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-2">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={unlockKey}
                  onChange={(e) => setUnlockKey(e.target.value)}
                  placeholder="Group access key…"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-3 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {unlockError && (
                <p className="text-xs text-red-400">{unlockError}</p>
              )}
              <button
                type="submit"
                disabled={unlocking}
                className="w-full rounded-lg bg-amber-500 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {unlocking ? "Verifying…" : "Unlock"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Upload form */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 ${!isUnlocked ? "pointer-events-none opacity-40" : ""}`}
      >
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Snippet Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Lab 5 – Binary Search Tree"
            maxLength={120}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Language selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Language <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((s) => !s)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-brand-400" />
                {form.language}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            {langOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 shadow-xl">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, language: lang }));
                      setLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition hover:bg-slate-800 ${form.language === lang ? "text-brand-400 font-medium" : "text-slate-300"}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code textarea + file upload */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              Code <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
            >
              <Upload className="h-3.5 w-3.5" /> Upload file
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".c,.cpp,.py,.java,.js,.ts,.sql,.html,.css,.go,.rs,.php,.sh,.rb,.kt,.swift,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileError && (
            <p className="mb-1 text-xs text-red-400">{fileError}</p>
          )}
          <textarea
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Paste your code here or use 'Upload file' above…"
            rows={14}
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            spellCheck={false}
          />
          <p className="mt-1 text-right text-[11px] text-slate-500">
            {Math.round(new Blob([form.code]).size / 1024)} KB / 200 KB max
          </p>
        </div>

        {/* Uploader name (optional) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Your Name{" "}
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={form.uploaderName}
            onChange={(e) =>
              setForm((f) => ({ ...f, uploaderName: e.target.value }))
            }
            placeholder="e.g. Priya, Roll No. 42, Anonymous…"
            maxLength={50}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-200">
            Description{" "}
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Brief explanation of what this code does…"
            rows={3}
            maxLength={1000}
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !isUnlocked}
          className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {submitting ? "Uploading…" : "Upload Snippet"}
        </button>
      </form>
    </div>
  );
}
