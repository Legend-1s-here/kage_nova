"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Globe,
  Code2,
  Trash2,
  ExternalLink,
  Search,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

interface GroupData {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  codeCount: number;
}

interface Stats {
  totalGroups: number;
  publicGroups: number;
  privateGroups: number;
  totalCodes: number;
}

export default function ModeratorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");

  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Check current moderator session on load
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/mod/session");
      const data = await res.json();
      if (data.isModerator) {
        setIsAuthenticated(true);
        fetchModData();
      }
    } catch {
      // Not authenticated
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchModData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/mod/groups");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setGroups(data.groups);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      // Error fetching
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setLoginError("Please enter moderator password");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/mod/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || "Invalid moderator password");
        setLoginLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setKeyInput("");
      fetchModData();
    } catch {
      setLoginError("Network error. Try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/mod/session", { method: "DELETE" });
      setIsAuthenticated(false);
      setStats(null);
      setGroups([]);
    } catch {
      // Logout failed
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupToDelete.slug}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete group");
        return;
      }

      setActionMessage(`Group "${groupToDelete.name}" deleted successfully.`);
      setTimeout(() => setActionMessage(null), 4000);

      // Remove from state
      setGroups((prev) => prev.filter((g) => g.slug !== groupToDelete.slug));
      if (stats) {
        setStats({
          ...stats,
          totalGroups: stats.totalGroups - 1,
          publicGroups: groupToDelete.isPublic ? stats.publicGroups - 1 : stats.publicGroups,
          privateGroups: !groupToDelete.isPublic ? stats.privateGroups - 1 : stats.privateGroups,
          totalCodes: Math.max(0, stats.totalCodes - groupToDelete.codeCount),
        });
      }
      setGroupToDelete(null);
    } catch {
      alert("Network error while deleting group");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (visibilityFilter === "public") return g.isPublic;
    if (visibilityFilter === "private") return !g.isPublic;
    return true;
  });

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Moderator Portal</h1>
            <p className="mt-1 text-xs text-slate-400">
              Enter your master moderator password to access platform management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setLoginError("");
                }}
                placeholder="Moderator password…"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {loginError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loginLoading ? "Authenticating…" : "Unlock Moderator Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Moderator Dashboard
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              <Shield className="h-3.5 w-3.5" /> Moderator Access Active
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Platform Management
          </h1>
          <p className="text-xs text-slate-400">
            Full view of all public and private groups with instant administrative controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchModData}
            disabled={loadingData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit Mod Mode
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs font-medium text-slate-400">Total Groups</span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.totalGroups}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <Globe className="h-3.5 w-3.5" /> Public Groups
            </span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.publicGroups}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
              <Lock className="h-3.5 w-3.5" /> Private Groups
            </span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.privateGroups}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="flex items-center gap-1 text-xs font-medium text-brand-400">
              <Code2 className="h-3.5 w-3.5" /> Total Codes Uploaded
            </span>
            <div className="mt-1 text-2xl font-bold text-white">{stats.totalCodes}</div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search all groups by name/slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "public", "private"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setVisibilityFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                visibilityFilter === filter
                  ? "bg-brand-600 text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Group</th>
              <th className="px-4 py-3.5">Visibility</th>
              <th className="px-4 py-3.5">Snippets</th>
              <th className="px-4 py-3.5">Created At</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  No groups found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredGroups.map((g) => (
                <tr key={g.id} className="transition hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{g.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">/g/{g.slug}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {g.isPublic ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-slate-200">
                      <Code2 className="h-3.5 w-3.5 text-slate-400" /> {g.codeCount}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-slate-400">
                    {new Date(g.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/g/${g.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 transition hover:border-slate-500 hover:text-white"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => setGroupToDelete(g)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
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
              Are you sure you want to delete{" "}
              <strong className="text-white">"{groupToDelete.name}"</strong>? This will
              permanently delete the group and all{" "}
              <strong className="text-white">{groupToDelete.codeCount} code snippet(s)</strong>.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
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
