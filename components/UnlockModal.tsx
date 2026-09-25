"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertTriangle, Clock } from "lucide-react";

interface UnlockModalProps {
  groupSlug: string;
  onUnlocked: () => void;
}

export default function UnlockModal({ groupSlug, onUnlocked }: UnlockModalProps) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [resetIn, setResetIn] = useState<number | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError("Please enter the group access key.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupSlug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setResetIn(data.resetInSeconds || 600);
        setError(data.error || "Too many attempts. Please wait and try again.");
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setRemaining(data.remainingAttempts ?? null);
        setError(data.error || "Incorrect key. Please try again.");
        setLoading(false);
        return;
      }

      // Success
      onUnlocked();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
          <Lock className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">
            Unlock Editing
          </h2>
          <p className="text-xs text-slate-400">
            Enter the group key to upload and edit codes
          </p>
        </div>
      </div>

      <form onSubmit={handleUnlock} className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError("");
            }}
            placeholder="Enter group access key…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-3 pr-10 text-sm text-slate-100 placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <span>{error}</span>
              {remaining !== null && remaining > 0 && (
                <span className="mt-0.5 block text-slate-400">
                  {remaining} attempt{remaining === 1 ? "" : "s"} remaining.
                </span>
              )}
              {resetIn !== null && (
                <span className="mt-0.5 flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" /> Retry in {Math.ceil(resetIn / 60)} min.
                </span>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || resetIn !== null}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? "Verifying…" : "Unlock Editing"}
        </button>
      </form>
    </div>
  );
}
