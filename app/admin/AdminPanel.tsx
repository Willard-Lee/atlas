"use client";
import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TbH2, TbH3, TbBold, TbItalic, TbCode, TbFileCode,
    TbInfoCircle, TbBulb, TbAlertTriangle,
    TbMath, TbMathFunction, TbPhoto, TbTable, TbLink, TbBrackets,
    TbBrandInstagram, TbBrandX, TbExternalLink, TbGitCommit, TbCloudUpload, TbPencil,
} from "react-icons/tb";
import { CATEGORIES } from "@/lib/categories";
import FontSwitcher from "@/components/FontSwitcher";
import LiveMarkdownEditor, { type LiveEditorHandle } from "@/components/admin/LiveMarkdownEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentType = "blog" | "project" | "garden" | "resource";
type PanelView   = "compose" | "library" | "editors";

interface GitFile { status: string; path: string; }
interface GitStatus {
    branch: string; upstream: string | null;
    ahead: number; behind: number; files: GitFile[];
}

interface FormState {
    type: ContentType;
    title: string; slug: string; date: string; draft: boolean;
    summary: string; tags: string; cover: string;
    stack: string; status: "live" | "wip" | "archived"; demo: string; repo: string; featured: boolean; excalidraw: string;
    subject: string; maturity: "seedling" | "budding" | "evergreen";
    resourceType: "paper" | "book" | "article" | "dataset" | "slides"; authors: string; year: string; url: string; doi: string; publisher: string;
}

interface LibraryItem {
    type: string; slug: string; filePath: string;
    frontmatter: { title: string; date: string; draft: boolean; subject: string | null };
}

interface ImageItem { name: string; path: string; }

// ── Constants ─────────────────────────────────────────────────────────────────

const today       = () => new Date().toISOString().slice(0, 10);
const toSlug      = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// True only for a real calendar date in YYYY-MM-DD form (rejects e.g. 2026-13-02).
function isValidDate(s: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00`);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
const STORAGE_KEY = "atlas-admin-draft";
const UI_KEY      = "atlas-admin-ui";

const META_MIN    = 200;
const META_MAX    = 460;
const META_DEFAULT= 288;
const PREV_MIN    = 280;
const PREV_MAX    = 700;
const PREV_DEFAULT= 400;

const INITIAL: FormState = {
    type: "blog", title: "", slug: "", date: today(), draft: true,
    summary: "", tags: "", cover: "",
    stack: "", status: "wip", demo: "", repo: "", featured: false, excalidraw: "",
    subject: "", maturity: "seedling",
    resourceType: "paper", authors: "", year: String(new Date().getFullYear()), url: "", doi: "", publisher: "",
};

const TYPE_COLOR: Record<string, string> = {
    blog: "var(--primary)", project: "var(--secondary-container)",
    garden: "#4ade80", resource: "#facc15",
};

function getLiveUrl(type: ContentType, slug: string, subject: string): string {
    if (type === "blog")    return `/blog/${slug}`;
    if (type === "project") return `/projects/${slug}`;
    if (type === "garden")  return `/garden/${subject}/${slug}`;
    return `/resources/${slug}`;
}

// ── Toolbar snippets ──────────────────────────────────────────────────────────

interface Snippet {
    label: string; title: string; text: string;
    select?: [number, number];
    icon?: React.ReactNode;
    /** accent color shown on hover instead of --primary */
    accent?: string;
}

// Groups are separated by null entries (rendered as dividers)
const SNIPPET_GROUPS: (Snippet | null)[] = [
    // ── Headings
    { label: "H2",   title: "Heading 2",    text: "\n## Heading\n\n",                           select: [4, 11],  icon: <TbH2 size={15} /> },
    { label: "H3",   title: "Heading 3",    text: "\n### Heading\n\n",                          select: [5, 12],  icon: <TbH3 size={15} /> },
    null,
    // ── Inline formatting
    { label: "bold", title: "Bold (Ctrl+B)",         text: "**text**",                                   select: [2, 6],   icon: <TbBold size={14} /> },
    { label: "em",   title: "Italic (Ctrl+I)",       text: "_text_",                                     select: [1, 5],   icon: <TbItalic size={14} /> },
    { label: "`c`",  title: "Inline code (Ctrl+E)",  text: "`code`",                                     select: [1, 5],   icon: <TbCode size={14} /> },
    { label: "```",  title: "Code block (Ctrl+Shift+E)", text: "\n```typescript\n\n```\n",               select: [16, 16], icon: <TbFileCode size={14} /> },
    null,
    // ── Callouts
    { label: "note", title: "NOTE callout", text: "\n> [!NOTE] Title\n> Content\n\n",           select: [17, 22], icon: <TbInfoCircle size={14} />,      accent: "#00dbe9" },
    { label: "tip",  title: "TIP callout",  text: "\n> [!TIP] Title\n> Content\n\n",            select: [16, 21], icon: <TbBulb size={14} />,            accent: "#4ade80" },
    { label: "warn", title: "WARNING",      text: "\n> [!WARNING] Title\n> Content\n\n",        select: [20, 25], icon: <TbAlertTriangle size={14} />,   accent: "#facc15" },
    null,
    // ── Math
    { label: "$$",   title: "Math block",   text: "\n$$\n\n$$\n",                               select: [4, 4],   icon: <TbMath size={14} /> },
    { label: "$x$",  title: "Inline math",  text: "$x$",                                        select: [1, 2],   icon: <TbMathFunction size={14} /> },
    null,
    // ── Media / structure
    { label: "fig",  title: "Figure",       text: '\n<figure>\n  <img src="/images/" alt="" />\n  <figcaption>Caption</figcaption>\n</figure>\n', select: [25, 33], icon: <TbPhoto size={14} /> },
    { label: "tbl",  title: "GFM table",    text: "\n| Col A | Col B |\n|-------|-------|\n| cell  | cell  |\n\n",                                select: [3, 8],   icon: <TbTable size={14} /> },
    null,
    // ── Embeds
    { label: "ig",   title: "Instagram embed",  text: '\n<Instagram url="" />\n',                    select: [17, 17], icon: <TbBrandInstagram size={14} />, accent: "#e1306c" },
    { label: "x",    title: "X / Tweet embed",  text: '\n<Tweet id="" />\n',                         select: [12, 12], icon: <TbBrandX size={13} /> },
    { label: "ref",  title: "Reference card",   text: '\n<LinkCard href="" title="" source="" />\n', select: [17, 17], icon: <TbExternalLink size={14} /> },
    null,
    // ── Links
    { label: "[[]]", title: "Wikilink",              text: "[[slug]]",                                   select: [2, 6],   icon: <TbBrackets size={14} /> },
    { label: "link", title: "Link (Ctrl+K)",         text: "[text](url)",                                select: [1, 5],   icon: <TbLink size={14} /> },
];


function insertSnippet(
    ref: RefObject<HTMLTextAreaElement | null>,
    snippet: Snippet,
    body: string,
    setBody: (v: string) => void,
) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end   = el.selectionEnd   ?? body.length;
    setBody(body.slice(0, start) + snippet.text + body.slice(end));
    const selStart = snippet.select ? start + snippet.select[0] : start + snippet.text.length;
    const selEnd   = snippet.select ? start + snippet.select[1] : start + snippet.text.length;
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(selStart, selEnd); });
}

function wrapSelection(
    ref: RefObject<HTMLTextAreaElement | null>,
    body: string,
    setBody: (v: string) => void,
    before: string,
    after: string,
    placeholder: string,
) {
    const el = ref.current;
    if (!el) return;
    const start  = el.selectionStart ?? 0;
    const end    = el.selectionEnd   ?? 0;
    const sel    = body.slice(start, end) || placeholder;
    setBody(body.slice(0, start) + before + sel + after + body.slice(end));
    requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
}

// ── Resize handle ─────────────────────────────────────────────────────────────

function ResizeHandle({ onDelta }: { onDelta: (delta: number) => void }) {
    const startX = useRef(0);

    function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        startX.current = e.clientX;
    }

    function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        onDelta(e.clientX - startX.current);
        startX.current = e.clientX;
    }

    return (
        <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            className="w-1 shrink-0 transition-colors hover:bg-[var(--primary)] active:bg-[var(--primary)]"
            style={{ cursor: "col-resize", background: "var(--outline-variant)" }}
        />
    );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputCls   = "w-full font-mono text-xs px-2 py-1.5 bg-transparent border outline-none focus:border-[var(--primary)] transition-colors";
const inputStyle = { borderColor: "var(--outline-variant)", color: "var(--on-surface)" };

function FieldInput({ value, onChange, placeholder, readOnly, tabIndex }: {
    value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; tabIndex?: number;
}) {
    return (
        <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly}
            autoComplete="off" tabIndex={tabIndex}
            className={inputCls}
            style={{ ...inputStyle, ...(readOnly ? { opacity: 0.5, cursor: "not-allowed" } : {}) }} />
    );
}

function FieldSelect<T extends string>({ value, onChange, options }: {
    value: T; onChange: (v: T) => void; options: T[];
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputCls}
            style={{ ...inputStyle, background: "var(--surface-container)" }}>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}

function SideLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-xs tracking-widest mb-1" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-mono)" }}>
            {children}
        </div>
    );
}

function SectionToggle({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs tracking-widest border-y -mx-4 mt-4 mb-3 text-left transition-colors hover:text-[var(--on-surface)]"
            style={{ borderColor: "var(--outline-variant)", color: "var(--outline)", background: "var(--surface-container)", fontFamily: "var(--font-mono)", width: "calc(100% + 2rem)" }}
        >
            <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="leading-none"
            >
                ▸
            </motion.span>
            {label}
        </button>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="px-3 py-1.5 text-xs tracking-widest border-y -mx-4 mt-4 mb-3"
            style={{ borderColor: "var(--outline-variant)", color: "var(--outline)", background: "var(--surface-container)", fontFamily: "var(--font-mono)" }}>
            {label}
        </div>
    );
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ msg, savedAt, onClear, showClear, wordCount, liveUrl }: {
    msg: { ok: boolean; msg: string } | null;
    savedAt: string | null;
    onClear: () => void;
    showClear: boolean;
    wordCount: number;
    liveUrl: string | null;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs shrink-0"
            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container-low)", fontFamily: "var(--font-mono)" }}>
            <div className="flex items-center gap-3 min-w-0">
                {msg
                    ? <span style={{ color: msg.ok ? "var(--secondary-container)" : "var(--error)" }}>{msg.msg}</span>
                    : <span style={{ color: "var(--outline)" }}>{savedAt ? `draft saved ${savedAt}` : "ready"}</span>
                }
                {msg?.ok && liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 transition-colors hover:text-[var(--primary)]"
                        style={{ color: "var(--outline)" }}>
                        ↗ VIEW
                    </a>
                )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
                {wordCount > 0 && (
                    <span style={{ color: "var(--outline)" }}>
                        {wordCount}w · ~{Math.max(1, Math.round(wordCount / 200))}m read
                    </span>
                )}
                {showClear && (
                    <button onClick={onClear} className="transition-colors hover:text-[var(--error)]" style={{ color: "var(--outline)" }}>
                        [ CLEAR ]
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminPanel() {
    const [view, setView]               = useState<PanelView>("compose");
    const [form, setForm]               = useState<FormState>(INITIAL);
    const [body, setBody]               = useState("");
    const [editingFile, setEditingFile] = useState<string | null>(null);
    const [status, setStatus]           = useState<{ ok: boolean; msg: string } | null>(null);
    const [liveUrl, setLiveUrl]         = useState<string | null>(null);
    const [uploading, setUploading]     = useState(false);
    const [savedAt, setSavedAt]         = useState<string | null>(null);
    const [library, setLibrary]         = useState<LibraryItem[]>([]);
    const [libLoading, setLibLoading]   = useState(false);
    const [libFilter, setLibFilter]     = useState<string>("all");
    const [libSearch, setLibSearch]     = useState("");
    const [delTarget, setDelTarget]     = useState<LibraryItem | null>(null);
    const [isDirty, setIsDirty]         = useState(false);
    const [optionalOpen, setOptionalOpen] = useState(true);

    // Writing UX — full-screen focus mode + collapsible metadata drawer
    const [focusMode, setFocusMode]     = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [insertOpen, setInsertOpen]   = useState(false); // focus-mode ＋ INSERT menu
    const [resetKey, setResetKey]       = useState(0);     // remounts the live editor on external body resets

    // Editors tab — git status + publish
    const [gitStatus, setGitStatus]     = useState<GitStatus | null>(null);
    const [gitLoading, setGitLoading]   = useState(false);
    const [gitError, setGitError]       = useState<string | null>(null);
    const [commitMsg, setCommitMsg]     = useState("");
    const [publishing, setPublishing]   = useState(false);

    // Image gallery
    const [images, setImages]           = useState<ImageItem[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

    // Preview pane
    const [showPreview, setShowPreview]     = useState(false);
    const [previewHtml, setPreviewHtml]     = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError]   = useState<string | null>(null);

    // Resizable pane widths
    const [metaWidth, setMetaWidth]       = useState(META_DEFAULT);
    const [previewWidth, setPreviewWidth] = useState(PREV_DEFAULT);

    const fileRef         = useRef<HTMLInputElement>(null);
    const focusFileRef    = useRef<HTMLInputElement>(null);
    const textareaRef     = useRef<HTMLTextAreaElement>(null);
    const focusTitleRef    = useRef<HTMLTextAreaElement>(null);
    const liveEditorRef    = useRef<LiveEditorHandle>(null);
    const skipSlugRef     = useRef(false);
    const saveTimeout     = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialStateRef = useRef<{ form: FormState; body: string } | null>(null);
    const saveRef         = useRef<() => void>(() => {});

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    // Append a category tag to the comma-separated tags field (no duplicates).
    const addTag = (tag: string) =>
        setForm((p) => {
            const list = p.tags.split(",").map((t) => t.trim()).filter(Boolean);
            if (list.includes(tag)) return p;
            return { ...p, tags: [...list, tag].join(", ") };
        });

    const wordCount   = body.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Shared editor keydown (markdown shortcuts) — bound to whichever textarea
    // (studio or focus) is passed, so both behave identically.
    const editorKeyDown = (ref: RefObject<HTMLTextAreaElement | null>) =>
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key === "b") { e.preventDefault(); wrapSelection(ref, body, setBody, "**", "**", "text"); }
            else if (ctrl && e.key === "i") { e.preventDefault(); wrapSelection(ref, body, setBody, "_", "_", "text"); }
            else if (ctrl && e.key === "k") { e.preventDefault(); wrapSelection(ref, body, setBody, "[", "](url)", "text"); }
            else if (ctrl && e.shiftKey && e.key === "E") { e.preventDefault(); insertSnippet(ref, { label: "", title: "", text: "\n```typescript\n\n```\n", select: [16, 16] }, body, setBody); }
            else if (ctrl && e.key === "e") { e.preventDefault(); wrapSelection(ref, body, setBody, "`", "`", "code"); }
            else if (e.key === "Tab") {
                e.preventDefault();
                const el = ref.current!;
                const s = el.selectionStart;
                const nb = body.slice(0, s) + "  " + body.slice(s);
                setBody(nb);
                requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 2, s + 2); });
            }
        };

    // Auto-grow a textarea to fit its content (Medium-style: no inner scrollbar,
    // the page scrolls instead, so what you're writing stays visible).
    const autoGrow = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    // Upload image file(s), then hand the resulting markdown to `insert`.
    const uploadImages = async (files: File[], insert: (md: string) => void) => {
        const imgs = files.filter((f) => f.type.startsWith("image/"));
        if (!imgs.length) return;
        setUploading(true);
        const paths: string[] = [];
        for (const f of imgs) {
            const fd = new FormData(); fd.append("file", f);
            const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (res.ok && data.path) paths.push(data.path);
            else setStatus({ ok: false, msg: data.error ?? "Upload failed." });
        }
        setUploading(false);
        if (!paths.length) return;
        insert(paths.map((p) => `![](${p})`).join("\n\n"));
        setStatus({ ok: true, msg: `✓ Inserted ${paths.length} image${paths.length > 1 ? "s" : ""}` });
    };

    // Insert markdown at the live editor's cursor (focus mode).
    const insertIntoFocus = (md: string, select?: [number, number]) =>
        liveEditorRef.current?.insertAtCursor(md, select);

    // ── Draft persistence ────────────────────────────────────────────────────

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const { form: f, body: b, savedAt: ts } = JSON.parse(raw);
            skipSlugRef.current = true;
            setForm({ ...INITIAL, ...f });
            setBody(b ?? "");
            setSavedAt(ts);
        } catch { /* ignore corrupt */ }
    }, []);

    // Load UI prefs (drawer + focus) once on mount.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(UI_KEY);
            if (!raw) return;
            const { detailsOpen: d, focusMode: fm } = JSON.parse(raw);
            if (typeof d === "boolean") setDetailsOpen(d);
            if (typeof fm === "boolean") setFocusMode(fm);
        } catch { /* ignore */ }
    }, []);

    // Persist UI prefs.
    useEffect(() => {
        localStorage.setItem(UI_KEY, JSON.stringify({ detailsOpen, focusMode }));
    }, [detailsOpen, focusMode]);

    // Sync the site-wide focus-mode class (hides nav/footer/mobile chrome via
    // [data-focus-hide]); always strip it on unmount so leaving /admin restores.
    useEffect(() => {
        const el = document.documentElement;
        el.classList.toggle("focus-mode", focusMode);
        return () => el.classList.remove("focus-mode");
    }, [focusMode]);

    // Keep the focus-mode title + body textareas sized to their content.
    useEffect(() => {
        if (!focusMode) return;
        // rAF so the elements are laid out before we measure scrollHeight.
        const id = requestAnimationFrame(() => {
            autoGrow(focusTitleRef.current);
        });
        return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusMode, body, form.title]);

    const autosave = useCallback((f: FormState, b: string) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            const ts = new Date().toLocaleTimeString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ form: f, body: b, savedAt: ts }));
            setSavedAt(ts);
        }, 800);
    }, []);

    useEffect(() => { autosave(form, body); }, [form, body, autosave]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setForm({ ...INITIAL, date: today() });
        setBody(""); setSavedAt(null); setStatus(null); setEditingFile(null);
        setPreviewHtml(""); setPreviewError(null); setLiveUrl(null);
        setIsDirty(false); initialStateRef.current = null;
        setResetKey((k) => k + 1);
    }, []);

    // ── Dirty tracking ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!editingFile || !initialStateRef.current) { setIsDirty(false); return; }
        const init = initialStateRef.current;
        setIsDirty(body !== init.body || JSON.stringify(form) !== JSON.stringify(init.form));
    }, [form, body, editingFile]);

    // ── Slug auto-derive ─────────────────────────────────────────────────────

    useEffect(() => {
        if (skipSlugRef.current) { skipSlugRef.current = false; return; }
        if (!editingFile) set("slug", toSlug(form.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.title]);

    useEffect(() => { setStatus(null); setLiveUrl(null); }, [form.type]);

    // ── Keyboard shortcuts: Ctrl/Cmd+S to save, Escape to discard edit ───────

    useEffect(() => {
        saveRef.current = async () => {
            const ta = textareaRef.current;
            // Only save when focus is not in textarea or when Ctrl held
            if (!form.title && !body) return;
            await handleSave();
        };
    });

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                saveRef.current();
                return;
            }
            // Cmd/Ctrl + Shift + F  → toggle full-screen focus mode
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
                e.preventDefault();
                setFocusMode((f) => !f);
                return;
            }
            if (e.key === "Escape") {
                // Esc closes the insert menu, then exits focus, then discards.
                if (insertOpen) { setInsertOpen(false); return; }
                if (focusMode) { setFocusMode(false); return; }
                if (editingFile) {
                    if (isDirty && !confirm("Discard unsaved changes?")) return;
                    clearDraft();
                }
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingFile, isDirty, clearDraft, focusMode, insertOpen]);

    // Close the ＋ INSERT menu on an outside click.
    useEffect(() => {
        if (!insertOpen) return;
        function onDown(e: MouseEvent) {
            if (!(e.target as HTMLElement).closest("[data-insert-menu]")) setInsertOpen(false);
        }
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [insertOpen]);

    // ── Debounced preview fetch ───────────────────────────────────────────────

    useEffect(() => {
        if (!showPreview) return;
        if (previewTimeout.current) clearTimeout(previewTimeout.current);
        previewTimeout.current = setTimeout(async () => {
            if (!body.trim()) { setPreviewHtml(""); setPreviewError(null); return; }
            setPreviewLoading(true);
            setPreviewError(null);
            try {
                const res  = await fetch("/api/admin/preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ body }),
                });
                const data = await res.json();
                if (!res.ok || data.error) {
                    setPreviewError(data.error ?? "Render failed.");
                } else {
                    setPreviewHtml(data.html ?? "");
                }
            } catch {
                setPreviewError("Network error.");
            }
            setPreviewLoading(false);
        }, 600);
    }, [body, showPreview]);

    // ── Image gallery ─────────────────────────────────────────────────────────

    const loadImages = useCallback(async () => {
        setImagesLoading(true);
        const res = await fetch("/api/admin/images");
        const data = await res.json();
        setImages(data.images ?? []);
        setImagesLoading(false);
    }, []);

    useEffect(() => {
        if (galleryOpen && images.length === 0) loadImages();
    }, [galleryOpen, images.length, loadImages]);

    function insertImage(imgPath: string) {
        const snippet: Snippet = { label: "", title: "", text: `![alt text](${imgPath})`, select: [2, 10] };
        insertSnippet(textareaRef, snippet, body, setBody);
    }

    // ── Library ──────────────────────────────────────────────────────────────

    const loadLibrary = useCallback(async () => {
        setLibLoading(true);
        const res = await fetch("/api/admin/list");
        const data = await res.json();
        setLibrary(data.items ?? []);
        setLibLoading(false);
    }, []);

    useEffect(() => { if (view === "library") loadLibrary(); }, [view, loadLibrary]);

    // Load the library once on mount so the composer can flag slug collisions.
    useEffect(() => { loadLibrary(); }, [loadLibrary]);

    // ── Editors: git status + publish ──────────────────────────────────────────

    const loadGitStatus = useCallback(async () => {
        setGitLoading(true);
        setGitError(null);
        try {
            const res  = await fetch("/api/admin/publish");
            const data = await res.json();
            if (!res.ok) { setGitError(data.error ?? "Failed to read git status."); setGitStatus(null); }
            else setGitStatus(data as GitStatus);
        } catch {
            setGitError("Network error.");
            setGitStatus(null);
        }
        setGitLoading(false);
    }, []);

    // Editors view needs both the draft list (library) and the git status.
    useEffect(() => {
        if (view === "editors") { loadLibrary(); loadGitStatus(); }
    }, [view, loadLibrary, loadGitStatus]);

    async function handlePublish() {
        const message = commitMsg.trim();
        if (!message) { setStatus({ ok: false, msg: "Commit message is required." }); return; }
        setPublishing(true);
        setStatus(null);
        try {
            const res  = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            if (!res.ok) { setStatus({ ok: false, msg: data.error ?? "Publish failed." }); }
            else if (!data.committed) { setStatus({ ok: true, msg: data.message ?? "Nothing to commit." }); }
            else {
                setStatus({ ok: true, msg: `✓ Pushed ${data.commit} (${data.files?.length ?? 0} file${data.files?.length === 1 ? "" : "s"}) → origin/${data.branch}` });
                setCommitMsg("");
            }
            await loadGitStatus();
        } catch {
            setStatus({ ok: false, msg: "Network error." });
        }
        setPublishing(false);
    }

    async function handleEdit(item: LibraryItem) {
        setStatus(null); setLiveUrl(null);
        const res = await fetch(`/api/admin/read?path=${encodeURIComponent(item.filePath)}`);
        if (!res.ok) { setStatus({ ok: false, msg: "Failed to load file." }); return; }
        const { frontmatter: fm, body: fileBody } = await res.json();

        const loadedForm: FormState = {
            ...INITIAL,
            type:         item.type as ContentType,
            title:        fm.title        ?? "",
            slug:         item.slug,
            date:         fm.date         ?? today(),
            draft:        fm.draft        ?? false,
            summary:      fm.summary      ?? "",
            tags:         (fm.tags ?? []).join(", "),
            cover:        fm.cover        ?? "",
            stack:        (fm.stack ?? []).join(", "),
            status:       fm.status       ?? "wip",
            demo:         fm.demo         ?? "",
            repo:         fm.repo         ?? "",
            featured:     fm.featured     ?? false,
            excalidraw:   fm.excalidraw   ?? "",
            subject:      fm.subject      ?? "",
            maturity:     fm.maturity     ?? "seedling",
            resourceType: fm.type         ?? "paper",
            authors:      (fm.authors ?? []).join(", "),
            year:         String(fm.year  ?? new Date().getFullYear()),
            url:          fm.url          ?? "",
            doi:          fm.doi          ?? "",
            publisher:    fm.publisher    ?? "",
        };
        const loadedBody = fileBody ?? "";

        skipSlugRef.current = true;
        setForm(loadedForm);
        setBody(loadedBody);
        setResetKey((k) => k + 1);
        setEditingFile(item.filePath);
        setIsDirty(false);
        initialStateRef.current = { form: loadedForm, body: loadedBody };
        setView("compose");
        requestAnimationFrame(() => textareaRef.current?.focus());
    }

    async function confirmDelete() {
        if (!delTarget) return;
        const res = await fetch("/api/admin/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: delTarget.filePath }),
        });
        const data = await res.json();
        setDelTarget(null);
        if (!res.ok) { setStatus({ ok: false, msg: data.error }); return; }
        setStatus({ ok: true, msg: `✓ Deleted: ${data.deleted}` });
        loadLibrary();
    }

    // ── Build frontmatter fields ──────────────────────────────────────────────

    function buildFields(): Record<string, string | string[] | boolean | number> {
        const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
        const base = {
            title: form.title, date: form.date, draft: form.draft,
            ...(form.summary && { summary: form.summary }),
            ...(tags.length  && { tags }),
        };
        if (form.type === "blog")    return { ...base, ...(form.cover && { cover: form.cover }) };
        if (form.type === "project") {
            const stack = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
            return { ...base, stack, status: form.status, featured: form.featured,
                ...(form.cover      && { cover: form.cover }),
                ...(form.demo       && { demo: form.demo }),
                ...(form.repo       && { repo: form.repo }),
                ...(form.excalidraw && { excalidraw: form.excalidraw }),
            };
        }
        if (form.type === "garden")  return { ...base, subject: form.subject, maturity: form.maturity };
        const authors = form.authors.split(",").map((a) => a.trim()).filter(Boolean);
        return { ...base, type: form.resourceType, authors, year: Number(form.year),
            ...(form.publisher && { publisher: form.publisher }),
            ...(form.url       && { url: form.url }),
            ...(form.doi       && { doi: form.doi }),
        };
    }

    // ── Save / create ─────────────────────────────────────────────────────────

    async function handleSave() {
        if (!form.title || !form.slug)         { setStatus({ ok: false, msg: "Title and slug are required." }); return; }
        if (!editingFile && library.some((i) => i.type === form.type && i.slug === form.slug.trim())) {
            setStatus({ ok: false, msg: `Slug "${form.slug.trim()}" already exists for ${form.type}.` }); return;
        }
        if (form.type === "garden" && !form.subject)  { setStatus({ ok: false, msg: "Subject is required." }); return; }
        if (form.type === "resource" && !form.authors){ setStatus({ ok: false, msg: "Authors are required." }); return; }
        setStatus(null);

        if (editingFile) {
            const res  = await fetch("/api/admin/update", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath: editingFile, fields: buildFields(), mdxBody: body }),
            });
            const data = await res.json();
            if (!res.ok) { setStatus({ ok: false, msg: data.error ?? "Update failed." }); return; }
            setStatus({ ok: true, msg: `✓ Saved: ${data.path}` });
            setLiveUrl(getLiveUrl(form.type, form.slug, form.subject));
            // Reset dirty after successful save
            initialStateRef.current = { form, body };
            setIsDirty(false);
        } else {
            const res  = await fetch("/api/admin/create", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: form.type, slug: form.slug, fields: buildFields(), mdxBody: body }),
            });
            const data = await res.json();
            if (!res.ok) { setStatus({ ok: false, msg: data.error ?? "Create failed." }); return; }
            setStatus({ ok: true, msg: `✓ Created: ${data.path}` });
            setLiveUrl(getLiveUrl(form.type, form.slug, form.subject));
            localStorage.removeItem(STORAGE_KEY);
            setSavedAt(null);
            setForm({ ...INITIAL, date: today() });
            setBody("");
            setResetKey((k) => k + 1);
        }
    }

    function handleCopy() {
        const fields = buildFields();
        const lines  = ["---"];
        for (const [k, v] of Object.entries(fields)) {
            if (v === "" || v === undefined) continue;
            if (Array.isArray(v))            lines.push(`${k}: [${v.map((s) => `"${s}"`).join(", ")}]`);
            else if (typeof v === "boolean") lines.push(`${k}: ${v}`);
            else if (typeof v === "number")  lines.push(`${k}: ${v}`);
            else                             lines.push(`${k}: "${String(v).replace(/"/g, '\\"')}"`);
        }
        lines.push("---", "", body);
        navigator.clipboard.writeText(lines.join("\n"));
        setStatus({ ok: true, msg: "Copied to clipboard." });
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData(); fd.append("file", file);
        const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        setUploading(false);
        if (!res.ok) { setStatus({ ok: false, msg: data.error }); return; }
        navigator.clipboard.writeText(`![alt text](${data.path})`);
        setStatus({ ok: true, msg: `✓ Uploaded ${data.path} — snippet copied.` });
        if (fileRef.current) fileRef.current.value = "";
        // Refresh gallery if it's open
        if (galleryOpen) loadImages();
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const libQuery    = libSearch.toLowerCase().trim();
    const filteredLib = library
        .filter((i) => {
            const matchesType   = libFilter === "all" || i.type === libFilter;
            const matchesSearch = !libQuery
                || i.frontmatter.title.toLowerCase().includes(libQuery)
                || i.slug.toLowerCase().includes(libQuery)
                || (i.frontmatter.subject ?? "").toLowerCase().includes(libQuery);
            return matchesType && matchesSearch;
        })
        .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));

    const draftItems = library
        .filter((i) => i.frontmatter.draft)
        .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));

    // Slug collision — only meaningful for new files (editing locks the slug).
    const slugTrimmed   = form.slug.trim();
    const slugCollision = !editingFile && slugTrimmed.length > 0 &&
        library.some((i) => i.type === form.type && i.slug === slugTrimmed);

    // ── Frontmatter lint — warn-only, never blocks a save ──────────────────────
    const lintWarnings: { level: "warn" | "info"; msg: string }[] = (() => {
        const out: { level: "warn" | "info"; msg: string }[] = [];
        const catKeys = Object.keys(CATEGORIES);
        const tagList = form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

        if (form.date && !isValidDate(form.date))
            out.push({ level: "warn", msg: `date "${form.date}" isn't a valid YYYY-MM-DD` });

        if ((form.type === "blog" || form.type === "project" || form.type === "resource") && !form.summary.trim())
            out.push({ level: "warn", msg: "no summary — used in cards, previews & SEO" });

        if (form.type === "blog") {
            if (tagList.length === 0)
                out.push({ level: "warn", msg: "no tags — add a category to file this post" });
            else if (!tagList.some((t) => catKeys.includes(t)))
                out.push({ level: "warn", msg: `no category tag (${catKeys.join(", ")}) — renders uncategorized` });
        }

        if (form.type === "resource" && form.year.trim() && !/^\d{4}$/.test(form.year.trim()))
            out.push({ level: "warn", msg: `year "${form.year}" should be a 4-digit number` });

        if (!editingFile && slugTrimmed && form.title.trim() && slugTrimmed !== toSlug(form.title))
            out.push({ level: "warn", msg: "slug differs from the title-derived slug" });

        if (form.draft)
            out.push({ level: "info", msg: "draft — hidden in production until unchecked" });

        return out;
    })();

    const TAB_TYPES: ContentType[] = ["blog", "project", "garden", "resource"];

    // Compose tab label reflects editing/dirty state
    const composeLabel = editingFile
        ? (isDirty ? "COMPOSE ●" : "COMPOSE ○")
        : "COMPOSE";

    return (
        <div className="flex flex-col overflow-hidden"
            style={{ height: "calc(100vh - 3.5rem)", background: "var(--background)", fontFamily: "var(--font-mono)" }}>

            {/* ── Top bar (hidden in focus mode) ── */}
            {!focusMode && (
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0"
                style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span style={{ color: "var(--primary)" }}>■</span>
                        <span className="text-sm font-bold tracking-widest" style={{ color: "var(--on-surface)" }}>ADMIN.SYS</span>
                    </div>
                    <div className="flex border" style={{ borderColor: "var(--outline-variant)" }}>
                        {(["compose", "library", "editors"] as PanelView[]).map((v, i) => {
                            const active = view === v;
                            const label  = v === "compose" ? composeLabel : v === "library" ? "LIBRARY" : "EDITORS";
                            const badge  = v === "editors" && gitStatus && gitStatus.files.length > 0
                                ? gitStatus.files.length : null;
                            return (
                                <button key={v} onClick={() => setView(v)}
                                    className="relative px-4 py-1 text-xs tracking-widest transition-colors"
                                    style={{
                                        background: active ? "var(--surface-container-high)" : "transparent",
                                        color:      active ? "var(--primary)" : "var(--on-surface-variant)",
                                        borderRight: i < 2 ? "1px solid var(--outline-variant)" : undefined,
                                        borderTop:  active ? "2px solid var(--primary)" : "2px solid transparent",
                                    }}>
                                    {label}
                                    {badge !== null && (
                                        <span className="ml-1.5 px-1 align-middle" style={{
                                            fontSize: 9, background: "var(--secondary-container)",
                                            color: "var(--on-secondary-container, var(--background))",
                                        }}>{badge}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {isDirty && (
                        <span className="text-xs" style={{ color: "var(--outline)" }}>
                            unsaved · Ctrl+S to save · Esc to discard
                        </span>
                    )}
                </div>
                <span className="text-xs tracking-widest" style={{ color: "var(--secondary-container)" }}>● DEV ONLY</span>
            </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                COMPOSE — three-pane resizable
            ════════════════════════════════════════════════════════════════ */}
            {view === "compose" && (
                <div className="flex flex-1 min-h-0">

                    {/* ── Left: metadata panel (collapsible DETAILS drawer) ── */}
                    <AnimatePresence initial={false}>
                    {detailsOpen && (
                    <motion.div key="meta" className="shrink-0 overflow-hidden"
                        initial={{ width: 0, opacity: 0 }} animate={{ width: metaWidth, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}>
                    <div className="flex flex-col overflow-hidden border-r h-full"
                        style={{ width: metaWidth, borderColor: "var(--outline-variant)", background: "var(--surface-container-low)" }}>

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

                            {editingFile && (
                                <div className="text-xs px-2 py-1.5 border leading-snug"
                                    style={{
                                        borderColor: isDirty ? "var(--primary)" : "var(--outline-variant)",
                                        color: isDirty ? "var(--primary)" : "var(--outline)",
                                        background: isDirty ? "rgba(201,131,226,0.06)" : "transparent",
                                        wordBreak: "break-all",
                                    }}>
                                    {isDirty ? "● " : "○ "}{editingFile}
                                </div>
                            )}

                            {/* Type selector */}
                            <div>
                                <SideLabel>TYPE</SideLabel>
                                <div className="grid grid-cols-4 border" style={{ borderColor: "var(--outline-variant)" }}>
                                    {TAB_TYPES.map((t, i) => (
                                        <button key={t} onClick={() => !editingFile && set("type", t)}
                                            className="py-1.5 text-xs tracking-widest transition-colors"
                                            style={{
                                                background: form.type === t ? "var(--surface-container-high)" : "transparent",
                                                color:      form.type === t ? TYPE_COLOR[t] : "var(--on-surface-variant)",
                                                borderRight: i < 3 ? "1px solid var(--outline-variant)" : undefined,
                                                cursor:  editingFile ? "not-allowed" : "pointer",
                                                opacity: editingFile && form.type !== t ? 0.3 : 1,
                                            }}>
                                            {t.slice(0, 4).toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TITLE lives in the editor header now (promoted) */}
                            <div>
                                <SideLabel>{editingFile ? "SLUG (locked)" : "SLUG"}</SideLabel>
                                <FieldInput value={form.slug} onChange={(v) => set("slug", v)} placeholder="post-slug" readOnly={!!editingFile} tabIndex={editingFile ? -1 : undefined} />
                                {slugCollision && (
                                    <div className="text-xs mt-1" style={{ color: "var(--error)" }}>
                                        ⚠ slug already exists for {form.type}
                                    </div>
                                )}
                            </div>
                            <div><SideLabel>DATE</SideLabel><FieldInput value={form.date} onChange={(v) => set("date", v)} /></div>

                            {form.type === "garden" && (
                                <div><SideLabel>SUBJECT *</SideLabel><FieldInput value={form.subject} onChange={(v) => set("subject", v)} placeholder="ml" readOnly={!!editingFile} tabIndex={editingFile ? -1 : undefined} /></div>
                            )}
                            {form.type === "project" && (<>
                                <div><SideLabel>STACK</SideLabel><FieldInput value={form.stack} onChange={(v) => set("stack", v)} placeholder="Next.js, TS" /></div>
                                <div><SideLabel>STATUS</SideLabel><FieldSelect value={form.status} onChange={(v) => set("status", v)} options={["wip", "live", "archived"]} /></div>
                            </>)}
                            {form.type === "garden" && (
                                <div><SideLabel>MATURITY</SideLabel><FieldSelect value={form.maturity} onChange={(v) => set("maturity", v)} options={["seedling", "budding", "evergreen"]} /></div>
                            )}
                            {form.type === "resource" && (<>
                                <div><SideLabel>TYPE</SideLabel><FieldSelect value={form.resourceType} onChange={(v) => set("resourceType", v)} options={["paper", "book", "article", "dataset", "slides"]} /></div>
                                <div><SideLabel>AUTHORS *</SideLabel><FieldInput value={form.authors} onChange={(v) => set("authors", v)} placeholder="Author A, Author B" /></div>
                                <div><SideLabel>YEAR</SideLabel><FieldInput value={form.year} onChange={(v) => set("year", v)} /></div>
                            </>)}

                            {/* Collapsible optional section */}
                            <SectionToggle label="OPTIONAL" open={optionalOpen} onToggle={() => setOptionalOpen((o) => !o)} />

                            <AnimatePresence initial={false}>
                                {optionalOpen && (
                                    <motion.div
                                        key="optional"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.18, ease: "easeInOut" }}
                                        style={{ overflow: "hidden" }}
                                        className="space-y-3"
                                    >
                                        <div><SideLabel>SUMMARY</SideLabel><FieldInput value={form.summary} onChange={(v) => set("summary", v)} placeholder="One-liner" /></div>
                                        <div>
                                            <SideLabel>TAGS</SideLabel>
                                            <FieldInput value={form.tags} onChange={(v) => set("tags", v)} placeholder="ml, engineering" />
                                            {form.type === "blog" && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {Object.entries(CATEGORIES).map(([key, c]) => {
                                                        const on = form.tags.split(",").map((t) => t.trim()).includes(key);
                                                        return (
                                                            <button key={key} type="button" onClick={() => addTag(key)} title={`Add category: ${c.label}`}
                                                                className="px-1.5 py-0.5 border transition-colors"
                                                                style={{
                                                                    fontSize: 9, letterSpacing: "0.05em",
                                                                    borderColor: on ? c.color : "var(--outline-variant)",
                                                                    color:       on ? c.color : "var(--outline)",
                                                                }}>
                                                                {c.symbol} {c.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {(form.type === "blog" || form.type === "project") && (
                                            <div><SideLabel>COVER</SideLabel><FieldInput value={form.cover} onChange={(v) => set("cover", v)} placeholder="/covers/img.jpg" /></div>
                                        )}
                                        {form.type === "project" && (<>
                                            <div><SideLabel>DEMO</SideLabel><FieldInput value={form.demo} onChange={(v) => set("demo", v)} placeholder="https://..." /></div>
                                            <div><SideLabel>REPO</SideLabel><FieldInput value={form.repo} onChange={(v) => set("repo", v)} placeholder="https://github.com/..." /></div>
                                            <div><SideLabel>EXCALIDRAW</SideLabel><FieldInput value={form.excalidraw} onChange={(v) => set("excalidraw", v)} placeholder="/diagrams/x.excalidraw" /></div>
                                            <div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[var(--primary)]" />
                                                    <span className="text-xs" style={{ color: "var(--on-surface-variant)" }}>FEATURED</span>
                                                </label>
                                            </div>
                                        </>)}
                                        {form.type === "resource" && (<>
                                            <div><SideLabel>URL</SideLabel><FieldInput value={form.url} onChange={(v) => set("url", v)} placeholder="https://..." /></div>
                                            <div><SideLabel>DOI</SideLabel><FieldInput value={form.doi} onChange={(v) => set("doi", v)} placeholder="10.48550/..." /></div>
                                            <div><SideLabel>PUBLISHER</SideLabel><FieldInput value={form.publisher} onChange={(v) => set("publisher", v)} placeholder="NeurIPS" /></div>
                                        </>)}

                                        <div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.draft} onChange={(e) => set("draft", e.target.checked)} className="accent-[var(--primary)]" />
                                                <span className="text-xs" style={{ color: "var(--on-surface-variant)" }}>DRAFT</span>
                                            </label>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Image section */}
                            <SectionDivider label="IMAGE" />
                            <div className="flex items-center gap-2">
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="img-upload" />
                                <label htmlFor="img-upload"
                                    className="text-xs px-3 py-1.5 border cursor-pointer transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    {uploading ? "UPLOADING…" : "UPLOAD"}
                                </label>
                                <button
                                    onClick={() => setGalleryOpen((o) => !o)}
                                    className="text-xs px-3 py-1.5 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    style={{
                                        borderColor: galleryOpen ? "var(--primary)" : "var(--outline-variant)",
                                        color:       galleryOpen ? "var(--primary)" : "var(--on-surface-variant)",
                                    }}>
                                    GALLERY
                                </button>
                            </div>

                            {/* Image gallery */}
                            <AnimatePresence initial={false}>
                                {galleryOpen && (
                                    <motion.div
                                        key="gallery"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.18, ease: "easeInOut" }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs" style={{ color: "var(--outline)" }}>click to insert</span>
                                            <button onClick={loadImages} className="text-xs transition-colors hover:text-[var(--primary)]" style={{ color: "var(--outline)" }}>↻</button>
                                        </div>
                                        {imagesLoading && (
                                            <p className="text-xs" style={{ color: "var(--outline)" }}>LOADING…</p>
                                        )}
                                        {!imagesLoading && images.length === 0 && (
                                            <p className="text-xs" style={{ color: "var(--outline)" }}>No images in public/images/</p>
                                        )}
                                        {!imagesLoading && images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-1">
                                                {images.map((img) => (
                                                    <button
                                                        key={img.path}
                                                        onClick={() => insertImage(img.path)}
                                                        title={img.name}
                                                        className="aspect-square overflow-hidden border transition-colors hover:border-[var(--primary)]"
                                                        style={{ borderColor: "var(--outline-variant)" }}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={img.path} alt={img.name} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* Frontmatter lint — warn-only */}
                            {lintWarnings.length > 0 && (
                                <div className="border" style={{ borderColor: "var(--outline-variant)" }}>
                                    <div className="px-2 py-1 text-xs tracking-widest border-b"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--outline)", background: "var(--surface-container)" }}>
                                        LINT · {lintWarnings.length}
                                    </div>
                                    <div className="px-2 py-1.5 space-y-1">
                                        {lintWarnings.map((w, i) => (
                                            <div key={i} className="text-xs leading-snug"
                                                style={{ color: w.level === "warn" ? "var(--error)" : "var(--outline)" }}>
                                                {w.level === "warn" ? "⚠" : "ℹ"} {w.msg}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="border-t shrink-0" style={{ borderColor: "var(--outline-variant)" }}>
                            <button onClick={handleSave}
                                className="w-full py-2.5 text-xs tracking-widest font-bold transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
                                style={{ background: editingFile ? "rgba(201,131,226,0.08)" : "transparent", color: editingFile ? "var(--primary)" : "var(--on-surface-variant)" }}>
                                {editingFile ? "[ SAVE CHANGES ]" : "[ CREATE FILE ]"}
                            </button>
                            <button onClick={handleCopy}
                                className="w-full py-2 text-xs tracking-widest border-t transition-colors hover:text-[var(--secondary-container)]"
                                style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}>
                                [ COPY MDX ]
                            </button>
                        </div>
                    </div>
                    </motion.div>
                    )}
                    </AnimatePresence>

                    {/* Resize handle — meta / editor (drawer only) */}
                    {detailsOpen && (
                        <ResizeHandle onDelta={(d) => setMetaWidth((w) => Math.max(META_MIN, Math.min(META_MAX, w + d)))} />
                    )}

                    {/* ── Center: body editor ── */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Editor header — DETAILS toggle · Title · FOCUS */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
                            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                            <button onClick={() => setDetailsOpen((o) => !o)} title="Toggle metadata drawer"
                                className="shrink-0 px-2 py-1 text-xs tracking-widest border transition-colors"
                                style={{
                                    borderColor: detailsOpen ? "var(--primary)" : "var(--outline-variant)",
                                    color:       detailsOpen ? "var(--primary)" : "var(--on-surface-variant)",
                                    background:  detailsOpen ? "rgba(201,131,226,0.08)" : "transparent",
                                    fontFamily:  "var(--font-mono)",
                                }}>
                                ◧ DETAILS
                            </button>
                            <input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                placeholder="Untitled — title goes here…"
                                aria-label="Title"
                                className="flex-1 min-w-0 bg-transparent outline-none"
                                style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--on-surface)" }}
                            />
                            <button onClick={() => setFocusMode(true)} title="Focus mode (⌘/Ctrl + Shift + F)"
                                className="shrink-0 px-2 py-1 text-xs tracking-widest border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", fontFamily: "var(--font-mono)" }}>
                                ⛶ FOCUS
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b shrink-0"
                            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                            {SNIPPET_GROUPS.map((s, i) =>
                                s === null ? (
                                    /* Group divider */
                                    <span key={`div-${i}`} className="shrink-0 mx-0.5"
                                        style={{ width: 1, height: 18, background: "var(--outline-variant)", display: "inline-block" }} />
                                ) : (
                                    <button key={s.label} type="button" title={`${s.title}`}
                                        onClick={() => insertSnippet(textareaRef, s, body, setBody)}
                                        className="group inline-flex items-center justify-center gap-1 border transition-all active:scale-95"
                                        style={{
                                            padding:     s.icon ? "4px 6px" : "2px 7px",
                                            borderColor: "var(--outline-variant)",
                                            color:       "var(--on-surface-variant)",
                                            fontFamily:  "var(--font-mono)",
                                            fontSize:    10,
                                            lineHeight:  1,
                                            // CSS custom prop for per-button accent color
                                            ["--tb-accent" as string]: s.accent ?? "var(--primary)",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.borderColor = s.accent ?? "var(--primary)";
                                            (e.currentTarget as HTMLElement).style.color       = s.accent ?? "var(--primary)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.borderColor = "var(--outline-variant)";
                                            (e.currentTarget as HTMLElement).style.color       = "var(--on-surface-variant)";
                                        }}
                                    >
                                        {s.icon && <span className="shrink-0 leading-none">{s.icon}</span>}
                                        {/* Show text label only for math / bracket entries that are self-documenting */}
                                        {(!s.icon || ["$$", "$x$", "[[]]"].includes(s.label)) && (
                                            <span style={{ letterSpacing: 0 }}>{s.label}</span>
                                        )}
                                    </button>
                                )
                            )}

                            <div className="flex-1" />

                            {/* Preview toggle */}
                            <button
                                onClick={() => setShowPreview((p) => !p)}
                                className="px-3 py-0.5 text-xs border transition-colors"
                                style={{
                                    borderColor: showPreview ? "var(--primary)" : "var(--outline-variant)",
                                    color:       showPreview ? "var(--primary)" : "var(--on-surface-variant)",
                                    background:  showPreview ? "rgba(201,131,226,0.08)" : "transparent",
                                    fontFamily: "var(--font-mono)",
                                }}>
                                {showPreview ? "◧ PREVIEW ON" : "◧ PREVIEW"}
                            </button>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onKeyDown={editorKeyDown(textareaRef)}
                            placeholder={"## Start writing...\n\nClick toolbar buttons or use shortcuts: Ctrl+B bold · Ctrl+I italic · Ctrl+K link · Ctrl+E code · Tab indent\n\n> [!NOTE] Callout\n> Content here.\n\n$$E = mc^2$$"}
                            className="flex-1 w-full px-6 py-4 text-sm leading-relaxed resize-none outline-none bg-transparent font-mono"
                            style={{ color: "var(--on-surface)" }}
                        />

                        <StatusBar
                            msg={status}
                            savedAt={savedAt}
                            onClear={clearDraft}
                            showClear={!!(form.title || body)}
                            wordCount={wordCount}
                            liveUrl={liveUrl}
                        />
                    </div>

                    {/* Resize handle — editor / preview (only when preview is open) */}
                    {showPreview && (
                        <ResizeHandle onDelta={(d) => setPreviewWidth((w) => Math.max(PREV_MIN, Math.min(PREV_MAX, w - d)))} />
                    )}

                    {/* ── Right: preview pane ── */}
                    {showPreview && (
                        <div className="flex flex-col border-l shrink-0 overflow-hidden"
                            style={{ width: previewWidth, borderColor: "var(--outline-variant)", background: "var(--surface-container-low)" }}>

                            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0"
                                style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                <span className="text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                                    {previewLoading ? "RENDERING…" : "[ PREVIEW ]"}
                                </span>
                                {previewLoading && (
                                    <span className="text-xs animate-pulse" style={{ color: "var(--outline)" }}>●</span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {previewError ? (
                                    <pre className="text-xs whitespace-pre-wrap" style={{ color: "var(--error)", fontFamily: "var(--font-mono)" }}>
                                        {previewError}
                                    </pre>
                                ) : !previewHtml ? (
                                    <p className="text-xs" style={{ color: "var(--outline)", fontFamily: "var(--font-mono)" }}>
                                        Start typing to see a preview…
                                    </p>
                                ) : (
                                    <article
                                        className="prose"
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                LIBRARY
            ════════════════════════════════════════════════════════════════ */}
            {view === "library" && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-1 px-4 py-2 border-b shrink-0"
                        style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                        {["all", "blog", "project", "garden", "resource"].map((f) => (
                            <button key={f} onClick={() => setLibFilter(f)}
                                className="px-3 py-1 text-xs tracking-widest border transition-colors"
                                style={{
                                    borderColor: libFilter === f ? (f === "all" ? "var(--on-surface-variant)" : TYPE_COLOR[f]) : "var(--outline-variant)",
                                    color:       libFilter === f ? (f === "all" ? "var(--on-surface)"         : TYPE_COLOR[f]) : "var(--on-surface-variant)",
                                    background:  libFilter === f ? "var(--surface-container-high)" : "transparent",
                                }}>
                                {f.toUpperCase()}
                            </button>
                        ))}
                        <div className="flex-1 mx-2">
                            <input
                                value={libSearch}
                                onChange={(e) => setLibSearch(e.target.value)}
                                placeholder="search titles, slugs…"
                                autoComplete="off"
                                className="w-full px-3 py-1 text-xs bg-transparent border outline-none focus:border-[var(--primary)] transition-colors font-mono"
                                style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface)" }}
                            />
                        </div>
                        <button onClick={loadLibrary}
                            className="text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}>
                            ↻ REFRESH
                        </button>
                        <button
                            onClick={() => { clearDraft(); setView("compose"); requestAnimationFrame(() => textareaRef.current?.focus()); }}
                            className="text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--on-primary)] hover:bg-[var(--primary)]"
                            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                            + NEW
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {libLoading && <div className="p-8 text-xs text-center" style={{ color: "var(--outline)" }}>LOADING...</div>}
                        {!libLoading && filteredLib.length === 0 && <div className="p-8 text-xs text-center" style={{ color: "var(--outline)" }}>NO CONTENT FOUND</div>}
                        {!libLoading && filteredLib.map((item) => (
                            <div key={item.filePath}
                                className="flex items-center gap-3 px-4 py-3 border-b group hover:bg-[var(--surface-container-low)] transition-colors"
                                style={{ borderColor: "var(--outline-variant)" }}>
                                <span className="text-xs shrink-0 w-10 text-center border px-1 py-0.5"
                                    style={{ borderColor: item.frontmatter.draft ? "var(--outline-variant)" : "var(--secondary-container)", color: item.frontmatter.draft ? "var(--outline)" : "var(--secondary-container)" }}>
                                    {item.frontmatter.draft ? "DRFT" : "LIVE"}
                                </span>
                                <span className="text-xs shrink-0 w-14" style={{ color: TYPE_COLOR[item.type] ?? "var(--outline)" }}>
                                    {item.type.toUpperCase()}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs truncate" style={{ color: "var(--on-surface)" }}>{item.frontmatter.title}</div>
                                    <div className="text-xs" style={{ color: "var(--outline)" }}>
                                        {item.frontmatter.date}{item.frontmatter.subject && ` · ${item.frontmatter.subject}`}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(item)}
                                        className="text-xs px-2 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        EDIT
                                    </button>
                                    <button onClick={() => setDelTarget(item)}
                                        className="text-xs px-2 py-1 border transition-colors hover:border-[var(--error)] hover:text-[var(--error)]"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        DEL
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <StatusBar msg={status} savedAt={null} onClear={() => setStatus(null)} showClear={!!status} wordCount={0} liveUrl={null} />
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                EDITORS — resume drafts · unuploaded content · push to GitHub
            ════════════════════════════════════════════════════════════════ */}
            {view === "editors" && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0"
                        style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                        <span className="text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>[ EDITORS ]</span>
                        {gitStatus && (
                            <span className="text-xs" style={{ color: "var(--outline)" }}>
                                branch <span style={{ color: "var(--on-surface-variant)" }}>{gitStatus.branch}</span>
                                {gitStatus.upstream
                                    ? <> · ahead {gitStatus.ahead} · behind {gitStatus.behind}</>
                                    : <> · <span style={{ color: "var(--error)" }}>no upstream</span></>}
                            </span>
                        )}
                        <div className="flex-1" />
                        <button onClick={() => { loadLibrary(); loadGitStatus(); }}
                            className="text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            style={{ borderColor: "var(--outline-variant)", color: "var(--outline)" }}>
                            ↻ REFRESH
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Resume autosaved working draft */}
                        {savedAt && (form.title || body) && (
                            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                                <div className="text-xs tracking-widest mb-2" style={{ color: "var(--outline)" }}>RESUME.BUFFER</div>
                                <div className="flex items-center gap-3">
                                    <TbPencil size={15} style={{ color: "var(--primary)" }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs truncate" style={{ color: "var(--on-surface)" }}>
                                            {form.title || "(untitled draft)"}
                                        </div>
                                        <div className="text-xs" style={{ color: "var(--outline)" }}>
                                            autosaved {savedAt} · {wordCount}w{editingFile ? ` · editing ${editingFile}` : ""}
                                        </div>
                                    </div>
                                    <button onClick={() => { setView("compose"); requestAnimationFrame(() => textareaRef.current?.focus()); }}
                                        className="text-xs px-3 py-1 border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        CONTINUE →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Draft files (draft:true frontmatter) */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--outline-variant)" }}>
                            <div className="text-xs tracking-widest mb-2" style={{ color: "var(--outline)" }}>
                                DRAFTS · {draftItems.length}
                            </div>
                            {libLoading && <p className="text-xs" style={{ color: "var(--outline)" }}>LOADING…</p>}
                            {!libLoading && draftItems.length === 0 && (
                                <p className="text-xs" style={{ color: "var(--outline)" }}>No draft files. Everything is published.</p>
                            )}
                            <div className="space-y-1">
                                {draftItems.map((item) => (
                                    <div key={item.filePath} className="flex items-center gap-3 py-1.5 group">
                                        <span className="text-xs shrink-0 w-14" style={{ color: TYPE_COLOR[item.type] ?? "var(--outline)" }}>
                                            {item.type.toUpperCase()}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs truncate" style={{ color: "var(--on-surface)" }}>{item.frontmatter.title}</div>
                                            <div className="text-xs" style={{ color: "var(--outline)" }}>{item.frontmatter.date}</div>
                                        </div>
                                        <button onClick={() => handleEdit(item)}
                                            className="text-xs px-3 py-1 border shrink-0 opacity-40 group-hover:opacity-100 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                            style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                            CONTINUE →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Unuploaded content (git working-tree changes) */}
                        <div className="px-4 py-3">
                            <div className="text-xs tracking-widest mb-2" style={{ color: "var(--outline)" }}>
                                UNUPLOADED · {gitStatus?.files.length ?? 0}
                            </div>
                            {gitLoading && <p className="text-xs" style={{ color: "var(--outline)" }}>READING GIT…</p>}
                            {gitError && (
                                <pre className="text-xs whitespace-pre-wrap" style={{ color: "var(--error)" }}>{gitError}</pre>
                            )}
                            {!gitLoading && !gitError && (gitStatus?.files.length ?? 0) === 0 && (
                                <p className="text-xs" style={{ color: "var(--outline)" }}>Working tree clean — nothing to push.</p>
                            )}
                            <div className="space-y-0.5">
                                {gitStatus?.files.map((f) => (
                                    <div key={f.path} className="flex items-center gap-3 py-0.5">
                                        <span className="text-xs shrink-0 w-8 text-center" style={{
                                            color: f.status.includes("?") ? "var(--secondary-container)"
                                                 : f.status.includes("D") ? "var(--error)" : "var(--primary)",
                                        }}>{f.status || "M"}</span>
                                        <span className="text-xs truncate" style={{ color: "var(--on-surface-variant)" }}>{f.path}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Commit + push bar */}
                    <div className="border-t shrink-0 px-4 py-3 flex items-center gap-2"
                        style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container-low)" }}>
                        <TbGitCommit size={16} style={{ color: "var(--outline)" }} />
                        <input
                            value={commitMsg}
                            onChange={(e) => setCommitMsg(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !publishing) handlePublish(); }}
                            placeholder="commit message…"
                            autoComplete="off"
                            className="flex-1 px-3 py-1.5 text-xs bg-transparent border outline-none focus:border-[var(--primary)] transition-colors font-mono"
                            style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface)" }}
                        />
                        <button
                            onClick={handlePublish}
                            disabled={publishing || !commitMsg.trim()}
                            className="text-xs px-4 py-1.5 border tracking-widest font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[var(--primary)] hover:enabled:text-[var(--on-primary)]"
                            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                            {publishing
                                ? <span className="inline-flex items-center gap-2"><TbCloudUpload size={14} className="animate-pulse" /> PUSHING…</span>
                                : <span className="inline-flex items-center gap-2"><TbCloudUpload size={14} /> PUSH TO GITHUB</span>}
                        </button>
                    </div>

                    <StatusBar msg={status} savedAt={null} onClear={() => setStatus(null)} showClear={!!status} wordCount={0} liveUrl={null} />
                </div>
            )}

            {/* ── Delete confirmation modal ── */}
            {delTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
                    <div className="max-w-sm w-full mx-4 border p-6 space-y-4"
                        style={{ background: "var(--surface-container)", borderColor: "var(--error)" }}>
                        <div className="text-xs font-bold tracking-widest" style={{ color: "var(--error)" }}>[ CONFIRM DELETE ]</div>
                        <p className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>{delTarget.frontmatter.title}</p>
                        <p className="text-xs break-all" style={{ color: "var(--outline)" }}>{delTarget.filePath}</p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={confirmDelete}
                                className="flex-1 py-2 text-xs tracking-widest border transition-colors hover:bg-[var(--error)] hover:text-[var(--on-error)]"
                                style={{ borderColor: "var(--error)", color: "var(--error)" }}>
                                DELETE
                            </button>
                            <button onClick={() => setDelTarget(null)}
                                className="flex-1 py-2 text-xs tracking-widest border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                FOCUS MODE — full-screen distraction-free writing surface
            ════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {focusMode && (
                    <motion.div
                        key="focus"
                        className="fixed inset-0 z-[60] flex flex-col"
                        style={{ background: "var(--background)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        {/* HUD — wraps so nothing is ever clipped as width shrinks */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-4 py-2 shrink-0"
                            style={{ borderBottom: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
                            {/* Left: identity — grows and truncates */}
                            <div className="flex items-center gap-2 min-w-0 flex-1" style={{ minWidth: "7rem" }}>
                                <span className="font-mono text-xs tracking-widest shrink-0" style={{ color: "var(--on-surface-variant)" }}>
                                    {form.type.toUpperCase()}
                                </span>
                                {form.draft && (
                                    <span className="font-mono px-1 shrink-0" style={{ fontSize: 9, border: "1px solid var(--outline-variant)", color: "var(--outline)" }}>DRAFT</span>
                                )}
                                <span className="font-mono text-xs truncate min-w-0" style={{ color: "var(--outline)" }}>
                                    {editingFile ?? (form.slug ? `${form.slug}.mdx` : "new draft")}
                                </span>
                            </div>

                            {/* Right: metrics + controls — wraps as a block, never clips */}
                            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 shrink-0">
                                <span className="font-mono text-xs whitespace-nowrap" style={{ color: "var(--outline)" }}>
                                    {wordCount}w · ~{readingTime}m
                                </span>
                                <span className="font-mono text-xs truncate max-w-[14rem]" style={{ color: status && !status.ok ? "var(--error)" : "var(--outline)" }}>
                                    {status ? status.msg : savedAt ? `saved ${savedAt}` : "ready"}
                                </span>
                                <div className="w-40"><FontSwitcher /></div>
                                <div className="flex items-center gap-2">
                                    {/* ＋ INSERT — image / table / callout / code / math / embeds */}
                                    <div className="relative flex items-center" data-insert-menu>
                                        <button onClick={() => setInsertOpen((o) => !o)} title="Insert (image, table, callout…)"
                                            className="shrink-0 font-mono text-xs px-2 py-1 border tracking-widest transition-colors"
                                            style={{
                                                borderColor: insertOpen ? "var(--primary)" : "var(--outline-variant)",
                                                color:       insertOpen ? "var(--primary)" : "var(--on-surface-variant)",
                                                background:  insertOpen ? "rgba(201,131,226,0.08)" : "transparent",
                                            }}>
                                            ＋ INSERT
                                        </button>
                                        {insertOpen && (
                                            <div className="absolute right-0 top-full mt-1 z-10 border py-1"
                                                style={{ minWidth: 210, maxHeight: "60vh", overflowY: "auto", background: "var(--surface-container-high)", borderColor: "var(--outline-variant)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                                                <button onClick={() => { setInsertOpen(false); focusFileRef.current?.click(); }}
                                                    className="w-full text-left px-3 py-1.5 font-mono text-xs flex items-center gap-2 transition-colors hover:text-[var(--primary)]"
                                                    style={{ color: "var(--on-surface)" }}>
                                                    <TbPhoto size={13} className="shrink-0" /> Image — upload
                                                </button>
                                                <div className="my-1" style={{ borderTop: "1px solid var(--outline-variant)" }} />
                                                {SNIPPET_GROUPS
                                                    .filter((s): s is Snippet => s !== null && !["bold", "em", "`c`"].includes(s.label))
                                                    .map((s, i) => (
                                                        <button key={`${s.label}-${i}`}
                                                            onClick={() => { insertIntoFocus(s.text, s.select); setInsertOpen(false); }}
                                                            className="w-full text-left px-3 py-1.5 font-mono text-xs flex items-center gap-2 transition-colors hover:text-[var(--primary)]"
                                                            style={{ color: "var(--on-surface-variant)" }}>
                                                            {s.icon && <span className="shrink-0 leading-none">{s.icon}</span>}
                                                            <span>{s.title}</span>
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => { setFocusMode(false); setDetailsOpen(true); }} title="Edit details (returns to studio)"
                                        className="shrink-0 font-mono text-xs px-2 py-1 border tracking-widest transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        DETAILS
                                    </button>
                                    <button onClick={handleSave} title="Save (⌘/Ctrl+S)"
                                        className="shrink-0 font-mono text-xs px-2 py-1 border tracking-widest transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
                                        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
                                        SAVE
                                    </button>
                                    <button onClick={() => setFocusMode(false)} title="Exit focus (Esc)"
                                        className="shrink-0 font-mono text-xs px-2 py-1 border tracking-widest transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                        ⛶ EXIT
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Writing surface — auto-growing textareas; the page scrolls
                            (Medium-style) so what you're writing is always visible. */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col" style={{ maxWidth: 760, minHeight: "100%" }}>
                                <textarea
                                    ref={focusTitleRef}
                                    value={form.title}
                                    onChange={(e) => { set("title", e.target.value); autoGrow(e.target); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); liveEditorRef.current?.focus(); } }}
                                    rows={1}
                                    placeholder="Title"
                                    aria-label="Title"
                                    className="w-full bg-transparent outline-none resize-none overflow-hidden mb-6 shrink-0"
                                    style={{ fontFamily: "var(--reader-font, var(--font-display))", fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, color: "var(--on-surface)" }}
                                />
                                {/* Live markdown editor — headings/code render as you type.
                                    key={resetKey} remounts it on external body resets. */}
                                <LiveMarkdownEditor
                                    key={resetKey}
                                    ref={liveEditorRef}
                                    value={body}
                                    onChange={setBody}
                                    onInsertImages={(files) => uploadImages(files, insertIntoFocus)}
                                />
                            </div>
                        </div>

                        {/* Hidden input for ＋ INSERT → Image upload (inserts at caret) */}
                        <input ref={focusFileRef} type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                if (files.length) uploadImages(files, insertIntoFocus);
                                if (e.target) e.target.value = "";
                            }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
