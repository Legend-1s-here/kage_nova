"use client";

import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Code2,
  User,
  Clock,
} from "lucide-react";

interface LabCodeCardProps {
  code: {
    _id: string;
    title: string;
    language: string;
    code: string;
    uploaderName: string;
    description: string;
    createdAt: string;
  };
  isUnlocked: boolean;
  onDelete?: (id: string) => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  python: "python",
  py: "python",
  java: "java",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  sql: "sql",
  html: "xml",
  css: "css",
  bash: "bash",
  shell: "bash",
  sh: "bash",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  kotlin: "kotlin",
  swift: "swift",
};

const FILE_EXT_MAP: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  python: "py",
  py: "py",
  java: "java",
  javascript: "js",
  js: "js",
  typescript: "ts",
  ts: "ts",
  sql: "sql",
  html: "html",
  css: "css",
  bash: "sh",
  shell: "sh",
  sh: "sh",
  go: "go",
  rust: "rs",
  php: "php",
  ruby: "rb",
  kotlin: "kt",
  swift: "swift",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    c: "C",
    cpp: "C++",
    "c++": "C++",
    python: "Python",
    py: "Python",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    bash: "Bash",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    kotlin: "Kotlin",
    swift: "Swift",
  };
  return labels[lang.toLowerCase()] || lang.toUpperCase();
}

export default function LabCodeCard({ code, isUnlocked, onDelete }: LabCodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const syntaxLang = LANGUAGE_MAP[code.language.toLowerCase()] || "plaintext";
  const fileExt = FILE_EXT_MAP[code.language.toLowerCase()] || "txt";

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code.title.toLowerCase().replace(/\s+/g, "-")}.${fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this snippet? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${window.location.pathname.split("/g/")[1].split("/")[0]}/codes/${code._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && onDelete) onDelete(code._id);
    } catch {
      // silently fail — page will still show the item
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-400">
              {getLanguageLabel(code.language)}
            </span>
          </div>
          <h3 className="truncate text-base font-semibold text-white">
            {code.title}
          </h3>
          {code.description && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {code.description}
            </p>
          )}
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          <Code2 className="h-3.5 w-3.5" />
          {expanded ? (
            <>
              Hide <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              View <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 px-4 pb-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {code.uploaderName || "Anonymous"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(code.createdAt)}
        </span>
      </div>

      {/* Expanded Code Block */}
      {expanded && (
        <div className="border-t border-slate-800">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-slate-950/80 px-3 py-2">
            <span className="text-xs font-mono text-slate-500">{syntaxLang}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700"
              >
                <Download className="h-3 w-3" /> Download
              </button>
              {isUnlocked && onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Syntax-highlighted code */}
          <div className="max-h-[480px] overflow-auto">
            <SyntaxHighlighter
              language={syntaxLang}
              style={atomOneDark}
              showLineNumbers
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: "12px",
                background: "#0b0f19",
                padding: "16px",
              }}
              lineNumberStyle={{ color: "#374151", userSelect: "none" }}
            >
              {code.code}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}
