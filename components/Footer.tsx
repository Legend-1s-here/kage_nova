import React from "react";
import Link from "next/link";
import { Code2, ShieldCheck, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600/20 text-brand-400">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">KAGENOVA</span>
          <span className="text-xs text-slate-500">— Group-based Lab Code Sharing for Students</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Zero-Login Key Protection
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Instant Syntax Highlighting
          </span>
        </div>
      </div>
    </footer>
  );
}
