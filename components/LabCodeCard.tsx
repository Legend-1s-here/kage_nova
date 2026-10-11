"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

export interface SubCodeItem {
  _id?: string;
  title: string;
  language?: string;
  code: string;
}

interface LabCodeCardProps {
  code: {
    _id: string;
    title: string;
    language: string;
    type?: "code" | "pdf";
    tagColor?: string;
    code?: string;
    subCodes?: SubCodeItem[];
    fileData?: string;
    fileName?: string;
    fileSize?: number;
    uploaderName: string;
    description: string;
    createdAt: string;
  };
  isUnlocked: boolean;
  groupSlug?: string;
  onDelete?: (id: string) => void;
  onUnlockRequired?: () => void;
}

const COLOR_THEMES: Record<
  string,
  {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    cardBorder: string;
    borderHover: string;
    btnBg: string;
    btnHover: string;
    btnBorder: string;
    btnText: string;
    primaryBtnBg: string;
    primaryBtnHover: string;
    iconText: string;
  }
> = {
  rose: {
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/30",
    cardBorder: "border-rose-500/20",
    borderHover: "hover:border-rose-500/50",
    btnBg: "bg-rose-500/10",
    btnHover: "hover:bg-rose-500/20",
    btnBorder: "border-rose-500/30",
    btnText: "text-rose-300",
    primaryBtnBg: "bg-rose-600",
    primaryBtnHover: "hover:bg-rose-500",
    iconText: "text-rose-400",
  },
  indigo: {
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/30",
    cardBorder: "border-indigo-500/20",
    borderHover: "hover:border-indigo-500/50",
    btnBg: "bg-indigo-500/10",
    btnHover: "hover:bg-indigo-500/20",
    btnBorder: "border-indigo-500/30",
    btnText: "text-indigo-300",
    primaryBtnBg: "bg-indigo-600",
    primaryBtnHover: "hover:bg-indigo-500",
    iconText: "text-indigo-400",
  },
  blue: {
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-400",
    badgeBorder: "border-blue-500/30",
    cardBorder: "border-blue-500/20",
    borderHover: "hover:border-blue-500/50",
    btnBg: "bg-blue-500/10",
    btnHover: "hover:bg-blue-500/20",
    btnBorder: "border-blue-500/30",
    btnText: "text-blue-300",
    primaryBtnBg: "bg-blue-600",
    primaryBtnHover: "hover:bg-blue-500",
    iconText: "text-blue-400",
  },
  emerald: {
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    cardBorder: "border-emerald-500/20",
    borderHover: "hover:border-emerald-500/50",
    btnBg: "bg-emerald-500/10",
    btnHover: "hover:bg-emerald-500/20",
    btnBorder: "border-emerald-500/30",
    btnText: "text-emerald-300",
    primaryBtnBg: "bg-emerald-600",
    primaryBtnHover: "hover:bg-emerald-500",
    iconText: "text-emerald-400",
  },
  amber: {
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
    cardBorder: "border-amber-500/20",
    borderHover: "hover:border-amber-500/50",
    btnBg: "bg-amber-500/10",
    btnHover: "hover:bg-amber-500/20",
    btnBorder: "border-amber-500/30",
    btnText: "text-amber-300",
    primaryBtnBg: "bg-amber-600",
    primaryBtnHover: "hover:bg-amber-500",
    iconText: "text-amber-400",
  },
  violet: {
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
    badgeBorder: "border-purple-500/30",
    cardBorder: "border-purple-500/20",
    borderHover: "hover:border-purple-500/50",
    btnBg: "bg-purple-500/10",
    btnHover: "hover:bg-purple-500/20",
    btnBorder: "border-purple-500/30",
    btnText: "text-purple-300",
    primaryBtnBg: "bg-purple-600",
    primaryBtnHover: "hover:bg-purple-500",
    iconText: "text-purple-400",
  },
  cyan: {
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    cardBorder: "border-cyan-500/20",
    borderHover: "hover:border-cyan-500/50",
    btnBg: "bg-cyan-500/10",
    btnHover: "hover:bg-cyan-500/20",
    btnBorder: "border-cyan-500/30",
    btnText: "text-cyan-300",
    primaryBtnBg: "bg-cyan-600",
    primaryBtnHover: "hover:bg-cyan-500",
    iconText: "text-cyan-400",
  },
  pink: {
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-400",
    badgeBorder: "border-pink-500/30",
    cardBorder: "border-pink-500/20",
    borderHover: "hover:border-pink-500/50",
    btnBg: "bg-pink-500/10",
    btnHover: "hover:bg-pink-500/20",
    btnBorder: "border-pink-500/30",
    btnText: "text-pink-300",
    primaryBtnBg: "bg-pink-600",
    primaryBtnHover: "hover:bg-pink-500",
    iconText: "text-pink-400",
  },
};

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

export default function LabCodeCard({
  code,
  isUnlocked,
  groupSlug,
  onDelete,
  onUnlockRequired,
}: LabCodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [subCodes, setSubCodes] = useState<SubCodeItem[]>(code.subCodes || []);
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = main code, 1+ = subCodes[activeTab - 1]
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCodeText, setNewCodeText] = useState("");
  const [newLanguage, setNewLanguage] = useState(code.language || "cpp");
  const [savingSubCode, setSavingSubCode] = useState(false);

  const isPdf = code.type === "pdf" || code.language.toLowerCase() === "pdf" || Boolean(code.fileData);

  // Active code item based on tab
  const activeItem = activeTab === 0
    ? { title: code.title, language: code.language, code: code.code || "" }
    : subCodes[activeTab - 1] || { title: code.title, language: code.language, code: code.code || "" };

  const currentLang = activeItem.language || code.language || "plaintext";
  const syntaxLang = LANGUAGE_MAP[currentLang.toLowerCase()] || "plaintext";
  const fileExt = FILE_EXT_MAP[currentLang.toLowerCase()] || "txt";

  const colorKey = code.tagColor?.toLowerCase() || (isPdf ? "rose" : "indigo");
  const theme = COLOR_THEMES[colorKey] || (isPdf ? COLOR_THEMES.rose : COLOR_THEMES.indigo);

  const handleCopy = () => {
    const textToCopy = activeItem.code || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
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
      const blob = new Blob([activeItem.code || ""], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const downloadName = activeTab === 0
        ? `${code.title.toLowerCase().replace(/\s+/g, "-")}.${fileExt}`
        : `${activeItem.title.toLowerCase().replace(/\s+/g, "-")}.${fileExt}`;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentSlug = groupSlug || (typeof window !== "undefined" ? window.location.pathname.split("/g/")[1]?.split("/")[0] : "");

  const handleAddSubCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeText.trim()) return;
    setSavingSubCode(true);
    try {
      const newItem = {
        title: newTitle.trim() || `Code ${subCodes.length + 2}`,
        language: newLanguage.toLowerCase().trim() || code.language,
        code: newCodeText,
      };
      const res = await fetch(`/api/groups/${currentSlug}/codes/${code._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSubCode: newItem }),
      });
      const data = await res.json();
      if (data.success && data.code?.subCodes) {
        setSubCodes(data.code.subCodes);
        setActiveTab(data.code.subCodes.length);
        setShowAddModal(false);
        setNewTitle("");
        setNewCodeText("");
      } else if (data.success) {
        const updatedList = [...subCodes, newItem];
        setSubCodes(updatedList);
        setActiveTab(updatedList.length);
        setShowAddModal(false);
        setNewTitle("");
        setNewCodeText("");
      } else {
        alert(data.error || "Failed to add code");
      }
    } catch {
      alert("Error adding code snippet");
    } finally {
      setSavingSubCode(false);
    }
  };

  const handleDeleteSubCode = async (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this sub-code snippet?")) return;
    const updated = subCodes.filter((_, idx) => idx !== indexToDelete);
    try {
      const res = await fetch(`/api/groups/${currentSlug}/codes/${code._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subCodes: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setSubCodes(updated);
        if (activeTab === indexToDelete + 1) {
          setActiveTab(0);
        } else if (activeTab > indexToDelete + 1) {
          setActiveTab((prev) => prev - 1);
        }
      }
    } catch {
      alert("Error removing code snippet");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this ${isPdf ? "PDF" : "snippet"}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/groups/${currentSlug}/codes/${code._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success && onDelete) onDelete(code._id);
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-slate-900/60 transition ${
        isPdf
          ? `${theme.cardBorder} ${theme.borderHover}`
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {isPdf ? (
              <span
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}
              >
                <FileText className="h-3 w-3" /> PDF Document
                {code.fileSize ? ` · ${formatFileSize(code.fileSize)}` : ""}
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    code.tagColor && COLOR_THEMES[code.tagColor]
                      ? `${COLOR_THEMES[code.tagColor].badgeBg} ${COLOR_THEMES[code.tagColor].badgeText}`
                      : "bg-brand-500/15 text-brand-400"
                  }`}
                >
                  {getLanguageLabel(code.language)}
                </span>
                {subCodes.length > 0 && (
                  <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/30">
                    {subCodes.length + 1} codes
                  </span>
                )}
              </div>
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
                ? `${theme.btnBorder} ${theme.btnBg} ${theme.btnText} ${theme.btnHover}`
                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            {isPdf ? (
              <FileText className="h-3.5 w-3.5" />
            ) : (
              <Code2 className="h-3.5 w-3.5" />
            )}
            {expanded ? (
              <>
                Hide <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                {isPdf ? "View PDF" : "View"}{" "}
                <ChevronDown className="h-3.5 w-3.5" />
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
                  <FileText className={`h-3.5 w-3.5 ${theme.iconText}`} />
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
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-white transition ${theme.primaryBtnBg} ${theme.primaryBtnHover}`}
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
            <>
              {/* Code Tabs Header (Switch between main code and additional codes) */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-1.5 gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Tab 0: Main code */}
                  <button
                    type="button"
                    onClick={() => setActiveTab(0)}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      activeTab === 0
                        ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <Code2 className="h-3 w-3 text-brand-400" />
                    <span>Main Code</span>
                  </button>

                  {/* Sub-code tabs */}
                  {subCodes.map((sub, idx) => (
                    <div
                      key={sub._id || idx}
                      className={`group flex items-center rounded-md text-xs font-medium transition ${
                        activeTab === idx + 1
                          ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveTab(idx + 1)}
                        className="px-2.5 py-1 flex items-center gap-1.5"
                      >
                        <span>{sub.title || `Code ${idx + 2}`}</span>
                        {sub.language && (
                          <span className="text-[10px] text-slate-500 uppercase">
                            {sub.language}
                          </span>
                        )}
                      </button>
                      {isUnlocked && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSubCode(idx, e)}
                          className="pr-1.5 pl-0.5 text-slate-500 hover:text-red-400 transition"
                          title="Delete snippet"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* + Add code button */}
                  {isUnlocked && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1 rounded-md border border-dashed border-slate-700 px-2 py-1 text-xs font-medium text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition"
                      title="Add another code snippet to this assignment"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Add code</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500 mr-2">
                    {syntaxLang}
                  </span>
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

              {/* Add New Sub-code Form Drawer */}
              {showAddModal && isUnlocked && (
                <form
                  onSubmit={handleAddSubCode}
                  className="border-b border-indigo-500/30 bg-slate-900/95 p-4 transition"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Code Snippet / Alternative to "{code.title}"
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Snippet label (e.g. Question 2, Approach 2, Using Array)…"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Language (e.g. cpp, python, c, java)…"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <textarea
                      placeholder="Paste your code here…"
                      value={newCodeText}
                      onChange={(e) => setNewCodeText(e.target.value)}
                      rows={6}
                      className="w-full font-mono text-xs rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingSubCode || !newCodeText.trim()}
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {savingSubCode ? "Saving…" : "Save Code"}
                    </button>
                  </div>
                </form>
              )}

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
                  {activeItem.code || ""}
                </SyntaxHighlighter>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
