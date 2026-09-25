import React from "react";
import Link from "next/link";
import { Code2, ShieldCheck, Zap, Star, Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600/20 text-brand-400">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">KAGENOVA</span>
          </div>
          <span className="text-xs text-slate-500">
            — Made with ❤️ for students. Free & Open Source.
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Zero-Login Key Protection
          </span>
          <a
            href="https://github.com/Legend-1s-here/KageNova"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-medium text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            Star on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
