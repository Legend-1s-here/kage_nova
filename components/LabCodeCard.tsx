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
  FileText,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";

interface LabCodeCardProps {
  code: {
    _id: string;
    title: string;
    language: string;
    type?: "code" | "pdf";
    code?: string;
    fileData?: string;
    fileName?: string;
    fileSize?: number;
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

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLanguageLabel(lang: string): string {
  if (lang.toLowerCase() === "pdf") return "PDF Document";
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

  const isPdf = code.type === "pdf" || code.language.toLowerCase() === "pdf" || Boolean(code.fileData);
  const syntaxLang = LANGUAGE_MAP[code.language.toLowerCase()] || "plaintext";
  const fileExt = FILE_EXT_MAP[code.language.toLowerCase()] || "txt";

  const handleCopy = () => {
    if (!code.code) return;
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isPdf && code.fileData) {
      const a = document.createElement("a");
      a.href = code.fileData;
      a.download = code.fileName || `${code.title.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([code.code || ""], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code.title.toLowerCase().replace(/\s+/g, "-")}.${fileExt}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this ${isPdf ? "PDF" : "snippet"}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${window.location.pathname.split("/g/")[1].split("/")[0]}/codes/${code._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && onDelete) onDelete(code._id);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border bg-slate-900/60 transition ${isPdf ? "border-rose-500/20 hover:border-rose-500/40" : "border-slate-800 hover:border-slate-700"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {isPdf ? (
              <span className="flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-400">
                <FileText className="h-3 w-3" /> PDF Document
                {code.fileSize ? ` · ${formatFileSize(code.fileSize)}` : ""}
              </span>
            ) : (
              <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-400">
                {getLanguageLabel(code.language)}
              </span>
            )}
          </div>
          <h3 className="truncate text-base font-semibold text-white">
            {code.title}
          </h3>
          {code.fileName && isPdf && (
            <p className="mt-0.5 font-mono text-[11px] text-slate-500 truncate">
              {code.fileName}
            </p>
          )}
          {code.description && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {code.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
            title={isPdf ? "Download PDF" : "Download code file"}
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isPdf
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            {isPdf ? <FileText className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
            {expanded ? (
              <>
                Hide <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                {isPdf ? "View PDF" : "View"} <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {code.uploaderName || "Anonymous"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(code.createdAt)}
          </span>
        </div>

        {isUnlocked && onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      {/* Expanded Block (PDF Viewer or Code Block) */}
      {expanded && (
        <div className="border-t border-slate-800">
          {isPdf ? (
            /* PDF Embed View */
            <div className="bg-slate-950/90 p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-rose-400" />
                  {code.fileName || "PDF Document"}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={code.fileData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    <ExternalLink className="h-3 w-3" /> Open in Full Tab
                  </a>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-rose-500"
                  >
                    <Download className="h-3 w-3" /> Save PDF
                  </button>
                </div>
              </div>

              <div className="h-[520px] w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                <iframe
                  src={code.fileData}
                  title={code.title}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          ) : (
            /* Code Block */
            <>
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
                  {code.code || ""}
                </SyntaxHighlighter>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
