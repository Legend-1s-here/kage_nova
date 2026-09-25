"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  Globe,
  Lock,
  PlusCircle,
  Search,
  Unlock,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import LabCodeCard from "@/components/LabCodeCard";
import UnlockModal from "@/components/UnlockModal";

interface LabCode {
  _id: string;
  title: string;
  language: string;
  code: string;
  uploaderName: string;
  description: string;
  createdAt: string;
}

interface GroupInfo {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
}

const LANGUAGES = [
  "All", "C", "C++", "Python", "Java", "JavaScript",
  "TypeScript", "SQL", "HTML", "CSS", "Go", "Rust", "PHP", "Bash",
];

export default function GroupDashboard() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const router = useRouter();

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [codes, setCodes] = useState<LabCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch group info + codes + session state
  const fetchData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      // Check mod status
      fetch("/api/mod/session")
        .then((r) => r.json())
        .then((d) => {
          if (d.isModerator) {
            setIsMod(true);
            setIsUnlocked(true);
          }
        })
        .catch(() => {});

      // Check group session status
      const sessionRes = await fetch(`/api/groups/${slug}/session`);
      const sessionData = await sessionRes.json();

      if (sessionRes.status === 404) {
        setError("This group does not exist.");
        setLoading(false);
        return;
      }

      if (sessionData.unlocked) {
        setIsUnlocked(true);
      }

      // Fetch codes
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedLang !== "All") params.set("lang", selectedLang.toLowerCase());

      const codesRes = await fetch(
        `/api/groups/${slug}/codes?${params.toString()}`
      );
      const codesData = await codesRes.json();

      if (!codesData.success) {
        setError(codesData.error || "Failed to load group data.");
        setLoading(false);
        return;
      }

      setGroup(codesData.group);
      setCodes(codesData.codes || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug, searchQuery, selectedLang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnlocked = () => {
    setIsUnlocked(true);
    setShowUnlock(false);
  };

  const handleCodeDeleted = (id: string) => {
    setCodes((prev) => prev.filter((c) => c._id !== id));
  };

  const handleDeleteGroup = async () => {
    if (!slug) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/groups/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete group");
        return;
      }
      // Redirect home on success
      router.push("/");
    } catch {
      alert("Network error while deleting group");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Loading state
  if (loading && !group) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
          <p className="text-sm text-slate-400">Loading group…</p>
        </div>
      </div>
    );
  }

  // Error state (404, network, etc.)
  if (error && !group) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <Code2 className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Group not found</h2>
        <p className="mb-6 text-sm text-slate-400">{error}</p>
        <Link
          href="/"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-7">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All Groups
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {group?.isPublic ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <Globe className="h-3 w-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}

              {isMod && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  <Shield className="h-3 w-3" /> Moderator Mode
                </span>
              )}

              {isUnlocked && !isMod && (
                <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-400">
                  <Unlock className="h-3 w-3" /> Editing Unlocked
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {group?.name || "Group"}
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              /g/{group?.slug}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isUnlocked && (
              <button
                onClick={() => setShowUnlock((s) => !s)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
              >
                <Lock className="h-3.5 w-3.5" />
                Unlock Editing
              </button>
            )}

            {isUnlocked && (
              <>
                <Link
                  href={`/g/${slug}/upload`}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Upload Code
                </Link>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Group
                </button>
              </>
            )}
          </div>
        </div>

        {/* Unlock panel (inline) */}
        {showUnlock && !isUnlocked && slug && (
          <div className="mt-4 max-w-md">
            <UnlockModal groupSlug={slug} onUnlocked={handleUnlocked} />
          </div>
        )}
      </div>

      {/* Search + Language Filter */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 transition focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.slice(0, 7).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedLang === lang
                  ? "bg-brand-600 text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Code list */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-slate-600" />
            Loading snippets…
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <Code2 className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-slate-300">
              {searchQuery || selectedLang !== "All"
                ? "No snippets match your search"
                : "No code snippets yet"}
            </h3>
            <p className="mb-4 max-w-xs text-sm text-slate-500">
              {isUnlocked
                ? "Upload the first snippet to get started."
                : "Unlock editing with the group key to upload snippets."}
            </p>
            {isUnlocked && (
              <Link
                href={`/g/${slug}/upload`}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-500"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Upload First Snippet
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-slate-500">
              {codes.length} snippet{codes.length === 1 ? "" : "s"}
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </p>
            {codes.map((code) => (
              <LabCodeCard
                key={code._id}
                code={code}
                isUnlocked={isUnlocked}
                onDelete={handleCodeDeleted}
              />
            ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && group && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Group</h3>
                <p className="text-xs text-slate-400">Permanent action</p>
              </div>
            </div>

            <p className="mb-5 text-sm text-slate-300">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">"{group.name}"</strong>? This will delete the
              group and all its {codes.length} uploaded code snippet(s). This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-lg border border-slate-700 py-2.5 text-xs font-medium text-slate-300 hover:border-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-red-500 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
