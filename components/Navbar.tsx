"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, PlusCircle, Search, Menu, X, Shield, Star, Github } from "lucide-react";

export default function Navbar() {
  const [jumpSlug, setJumpSlug] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/mod/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.isModerator) {
          setIsMod(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpSlug.trim()) return;

    let target = jumpSlug.trim();
    // Allow pasting full URL like https://.../g/cs101 or cs101
    if (target.includes("/g/")) {
      target = target.split("/g/")[1].split("/")[0].split("?")[0];
      setJumpSlug("");
      setIsMobileOpen(false);
      router.push(`/g/${encodeURIComponent(target.toLowerCase())}`);
      return;
    }

    // If target has spaces, navigate to homepage search section
    if (target.includes(" ")) {
      setJumpSlug("");
      setIsMobileOpen(false);
      router.push(`/?q=${encodeURIComponent(target)}#explore`);
      return;
    }

    // Direct slug
    setJumpSlug("");
    setIsMobileOpen(false);
    router.push(`/g/${encodeURIComponent(target.toLowerCase())}`);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
            <Code2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">
              KAGENOVA
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Lab Code Sharing
            </span>
          </div>
        </Link>

        {/* Desktop Navigation & Quick Jump */}
        <div className="hidden items-center gap-3 md:flex">
          <form onSubmit={handleJump} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter group code/slug..."
              value={jumpSlug}
              onChange={(e) => setJumpSlug(e.target.value)}
              className="w-52 rounded-lg border border-slate-700 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Link
            href="/"
            className="text-xs font-medium text-slate-300 transition hover:text-white"
          >
            Explore
          </Link>

          <a
            href="https://github.com/Legend-1s-here/KageNova"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:border-amber-500/50 hover:bg-slate-800"
            title="Star KAGENOVA on GitHub"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Star on GitHub</span>
          </a>

          {isMod && (
            <Link
              href="/mod"
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Mod Panel</span>
            </Link>
          )}

          <Link
            href="/create-group"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-500 active:scale-[0.98]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Group</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 pb-4 pt-2 md:hidden">
          <form onSubmit={handleJump} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter group slug or link..."
                value={jumpSlug}
                onChange={(e) => setJumpSlug(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Explore Public Groups
            </Link>
            <a
              href="https://github.com/Legend-1s-here/KageNova"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300"
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>⭐ Star on GitHub</span>
            </a>
            {isMod && (
              <Link
                href="/mod"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20"
              >
                <Shield className="h-4 w-4" />
                <span>Mod Portal</span>
              </Link>
            )}
            <Link
              href="/create-group"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2 text-sm font-medium text-white shadow hover:bg-brand-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Group</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
