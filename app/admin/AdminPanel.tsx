"use client";
import { useState, useEffect, useRef, useCallback, type RefObject } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentType = "blog" | "project" | "garden" | "resource";
type PanelView   = "compose" | "library";

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

// ── Constants ─────────────────────────────────────────────────────────────────

const today       = () => new Date().toISOString().slice(0, 10);
const toSlug      = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STORAGE_KEY = "atlas-admin-draft";

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

// ── Toolbar snippets ──────────────────────────────────────────────────────────

interface Snippet { label: string; title: string; text: string; select?: [number, number]; }

const SNIPPETS: Snippet[] = [
    { label: "H2",    title: "Heading 2",    text: "\n## Heading\n\n",                           select: [4, 11]  },
    { label: "H3",    title: "Heading 3",    text: "\n### Heading\n\n",                          select: [5, 12]  },
    { label: "bold",  title: "Bold",         text: "**text**",                                   select: [2, 6]   },
    { label: "em",    title: "Italic",       text: "_text_",                                     select: [1, 5]   },
    { label: "`c`",   title: "Inline code",  text: "`code`",                                     select: [1, 5]   },
    { label: "```",   title: "Code block",   text: "\n```typescript\n\n```\n",                   select: [16, 16] },
    { label: "note",  title: "NOTE callout", text: "\n> [!NOTE] Title\n> Content\n\n",           select: [17, 22] },
    { label: "tip",   title: "TIP callout",  text: "\n> [!TIP] Title\n> Content\n\n",            select: [16, 21] },
    { label: "warn",  title: "WARNING",      text: "\n> [!WARNING] Title\n> Content\n\n",        select: [20, 25] },
    { label: "$$",    title: "Math block",   text: "\n$$\n\n$$\n",                               select: [4, 4]   },
    { label: "$x$",   title: "Inline math",  text: "$x$",                                        select: [1, 2]   },
    { label: "fig",   title: "Figure",       text: '\n<figure>\n  <img src="/images/" alt="" />\n  <figcaption>Caption</figcaption>\n</figure>\n', select: [25, 33] },
    { label: "table", title: "GFM table",    text: "\n| Col A | Col B |\n|-------|-------|\n| cell  | cell  |\n\n", select: [3, 8] },
    { label: "wiki",  title: "Wikilink",     text: "[[slug]]",                                   select: [2, 6]   },
    { label: "link",  title: "Link",         text: "[text](url)",                                select: [1, 5]   },
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

// ── Resize handle ─────────────────────────────────────────────────────────────

function ResizeHandle({
    onDelta,
}: {
    onDelta: (delta: number) => void;
}) {
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

function FieldInput({ value, onChange, placeholder, readOnly }: {
    value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean;
}) {
    return (
        <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly}
            autoComplete="off"
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

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="px-3 py-1.5 text-xs tracking-widest border-y -mx-4 mt-4 mb-3"
            style={{ borderColor: "var(--outline-variant)", color: "var(--outline)", background: "var(--surface-container)", fontFamily: "var(--font-mono)" }}>
            {label}
        </div>
    );
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ msg, savedAt, onClear, showClear }: {
    msg: { ok: boolean; msg: string } | null; savedAt: string | null; onClear: () => void; showClear: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs shrink-0"
            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container-low)", fontFamily: "var(--font-mono)" }}>
            <div>
                {msg
                    ? <span style={{ color: msg.ok ? "var(--secondary-container)" : "var(--error)" }}>{msg.msg}</span>
                    : <span style={{ color: "var(--outline)" }}>{savedAt ? `draft saved ${savedAt}` : "ready"}</span>
                }
            </div>
            {showClear && (
                <button onClick={onClear} className="transition-colors hover:text-[var(--error)]" style={{ color: "var(--outline)" }}>
                    [ CLEAR ]
                </button>
            )}
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
    const [uploading, setUploading]     = useState(false);
    const [savedAt, setSavedAt]         = useState<string | null>(null);
    const [library, setLibrary]         = useState<LibraryItem[]>([]);
    const [libLoading, setLibLoading]   = useState(false);
    const [libFilter, setLibFilter]     = useState<string>("all");
    const [libSearch, setLibSearch]     = useState("");
    const [delTarget, setDelTarget]     = useState<LibraryItem | null>(null);

    // Preview pane
    const [showPreview, setShowPreview]     = useState(false);
    const [previewHtml, setPreviewHtml]     = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError]   = useState<string | null>(null);

    // Resizable pane widths
    const [metaWidth, setMetaWidth]       = useState(META_DEFAULT);
    const [previewWidth, setPreviewWidth] = useState(PREV_DEFAULT);

    const fileRef       = useRef<HTMLInputElement>(null);
    const textareaRef   = useRef<HTMLTextAreaElement>(null);
    const skipSlugRef   = useRef(false);
    const saveTimeout   = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewTimeout= useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

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

    const autosave = useCallback((f: FormState, b: string) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            const ts = new Date().toLocaleTimeString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ form: f, body: b, savedAt: ts }));
            setSavedAt(ts);
        }, 800);
    }, []);

    useEffect(() => { autosave(form, body); }, [form, body, autosave]);

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
        setForm({ ...INITIAL, date: today() });
        setBody(""); setSavedAt(null); setStatus(null); setEditingFile(null);
        setPreviewHtml(""); setPreviewError(null);
    };

    useEffect(() => {
        if (skipSlugRef.current) { skipSlugRef.current = false; return; }
        if (!editingFile) set("slug", toSlug(form.title));
    }, [form.title]);

    useEffect(() => { setStatus(null); }, [form.type]);

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

    // Fetch immediately when preview is toggled on
    useEffect(() => {
        if (showPreview && body.trim()) previewTimeout.current && clearTimeout(previewTimeout.current);
    }, [showPreview]);

    // ── Library ──────────────────────────────────────────────────────────────

    const loadLibrary = useCallback(async () => {
        setLibLoading(true);
        const res = await fetch("/api/admin/list");
        const data = await res.json();
        setLibrary(data.items ?? []);
        setLibLoading(false);
    }, []);

    useEffect(() => { if (view === "library") loadLibrary(); }, [view, loadLibrary]);

    async function handleEdit(item: LibraryItem) {
        setStatus(null);
        const res = await fetch(`/api/admin/read?path=${encodeURIComponent(item.filePath)}`);
        if (!res.ok) { setStatus({ ok: false, msg: "Failed to load file." }); return; }
        const { frontmatter: fm, body: fileBody } = await res.json();

        skipSlugRef.current = true;
        setForm({
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
        });
        setBody(fileBody ?? "");
        setEditingFile(item.filePath);
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
        } else {
            const res  = await fetch("/api/admin/create", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: form.type, slug: form.slug, fields: buildFields(), mdxBody: body }),
            });
            const data = await res.json();
            if (!res.ok) { setStatus({ ok: false, msg: data.error ?? "Create failed." }); return; }
            setStatus({ ok: true, msg: `✓ Created: ${data.path}` });
            localStorage.removeItem(STORAGE_KEY);
            setSavedAt(null);
            setForm({ ...INITIAL, date: today() });
            setBody("");
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
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const libQuery    = libSearch.toLowerCase().trim();
    const filteredLib = library.filter((i) => {
        const matchesType   = libFilter === "all" || i.type === libFilter;
        const matchesSearch = !libQuery
            || i.frontmatter.title.toLowerCase().includes(libQuery)
            || i.slug.toLowerCase().includes(libQuery)
            || (i.frontmatter.subject ?? "").toLowerCase().includes(libQuery);
        return matchesType && matchesSearch;
    });
    const TAB_TYPES: ContentType[] = ["blog", "project", "garden", "resource"];

    return (
        <div className="flex flex-col overflow-hidden"
            style={{ height: "calc(100vh - 3.5rem)", background: "var(--background)", fontFamily: "var(--font-mono)" }}>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0"
                style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span style={{ color: "var(--primary)" }}>■</span>
                        <span className="text-sm font-bold tracking-widest" style={{ color: "var(--on-surface)" }}>ADMIN.SYS</span>
                    </div>
                    <div className="flex border" style={{ borderColor: "var(--outline-variant)" }}>
                        {(["compose", "library"] as PanelView[]).map((v, i) => (
                            <button key={v} onClick={() => setView(v)}
                                className="px-4 py-1 text-xs tracking-widest transition-colors"
                                style={{
                                    background: view === v ? "var(--surface-container-high)" : "transparent",
                                    color:      view === v ? "var(--primary)" : "var(--on-surface-variant)",
                                    borderRight: i === 0 ? "1px solid var(--outline-variant)" : undefined,
                                }}>
                                {v === "compose" ? (editingFile ? "COMPOSE ●" : "COMPOSE") : "LIBRARY"}
                            </button>
                        ))}
                    </div>
                </div>
                <span className="text-xs tracking-widest" style={{ color: "var(--secondary-container)" }}>● DEV ONLY</span>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                COMPOSE — three-pane resizable
            ════════════════════════════════════════════════════════════════ */}
            {view === "compose" && (
                <div className="flex flex-1 min-h-0">

                    {/* ── Left: metadata panel ── */}
                    <div className="flex flex-col overflow-hidden shrink-0 border-r"
                        style={{ width: metaWidth, borderColor: "var(--outline-variant)", background: "var(--surface-container-low)" }}>

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

                            {editingFile && (
                                <div className="text-xs px-2 py-1.5 border leading-snug"
                                    style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "rgba(201,131,226,0.06)", wordBreak: "break-all" }}>
                                    ● {editingFile}
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

                            <div><SideLabel>TITLE *</SideLabel><FieldInput value={form.title} onChange={(v) => set("title", v)} placeholder="Post title" /></div>
                            <div><SideLabel>{editingFile ? "SLUG (locked)" : "SLUG"}</SideLabel><FieldInput value={form.slug} onChange={(v) => set("slug", v)} placeholder="post-slug" readOnly={!!editingFile} /></div>
                            <div><SideLabel>DATE</SideLabel><FieldInput value={form.date} onChange={(v) => set("date", v)} /></div>

                            {form.type === "garden" && (
                                <div><SideLabel>SUBJECT *</SideLabel><FieldInput value={form.subject} onChange={(v) => set("subject", v)} placeholder="ml" readOnly={!!editingFile} /></div>
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

                            <SectionDivider label="OPTIONAL" />

                            <div><SideLabel>SUMMARY</SideLabel><FieldInput value={form.summary} onChange={(v) => set("summary", v)} placeholder="One-liner" /></div>
                            <div><SideLabel>TAGS</SideLabel><FieldInput value={form.tags} onChange={(v) => set("tags", v)} placeholder="ml, engineering" /></div>

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

                            <SectionDivider label="IMAGE" />
                            <div className="flex items-center gap-2">
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="img-upload" />
                                <label htmlFor="img-upload"
                                    className="text-xs px-3 py-1.5 border cursor-pointer transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)" }}>
                                    {uploading ? "UPLOADING…" : "UPLOAD"}
                                </label>
                                <span className="text-xs" style={{ color: "var(--outline)" }}>snippet → clipboard</span>
                            </div>
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

                    {/* Resize handle — meta / editor */}
                    <ResizeHandle onDelta={(d) => setMetaWidth((w) => Math.max(META_MIN, Math.min(META_MAX, w + d)))} />

                    {/* ── Center: body editor ── */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b shrink-0"
                            style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                            {SNIPPETS.map((s) => (
                                <button key={s.label} type="button" title={s.title}
                                    onClick={() => insertSnippet(textareaRef, s, body, setBody)}
                                    className="px-2 py-0.5 text-xs border transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95"
                                    style={{ borderColor: "var(--outline-variant)", color: "var(--on-surface-variant)", fontFamily: "var(--font-mono)" }}>
                                    {s.label}
                                </button>
                            ))}

                            {/* spacer */}
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
                            placeholder={"## Start writing...\n\nClick toolbar buttons to insert components.\n\n> [!NOTE] Callout\n> Content here.\n\n$$E = mc^2$$"}
                            className="flex-1 w-full px-6 py-4 text-sm leading-relaxed resize-none outline-none bg-transparent font-mono"
                            style={{ color: "var(--on-surface)" }}
                        />

                        <StatusBar msg={status} savedAt={savedAt} onClear={clearDraft} showClear={!!(form.title || body)} />
                    </div>

                    {/* Resize handle — editor / preview (only when preview is open) */}
                    {showPreview && (
                        <ResizeHandle onDelta={(d) => setPreviewWidth((w) => Math.max(PREV_MIN, Math.min(PREV_MAX, w - d)))} />
                    )}

                    {/* ── Right: preview pane ── */}
                    {showPreview && (
                        <div className="flex flex-col border-l shrink-0 overflow-hidden"
                            style={{ width: previewWidth, borderColor: "var(--outline-variant)", background: "var(--surface-container-low)" }}>

                            {/* Preview header */}
                            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0"
                                style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                <span className="text-xs tracking-widest" style={{ color: "var(--on-surface-variant)" }}>
                                    {previewLoading ? "RENDERING…" : "[ PREVIEW ]"}
                                </span>
                                {previewLoading && (
                                    <span className="text-xs animate-pulse" style={{ color: "var(--outline)" }}>●</span>
                                )}
                            </div>

                            {/* Preview content */}
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
                                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

                    <StatusBar msg={status} savedAt={null} onClear={() => setStatus(null)} showClear={!!status} />
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
        </div>
    );
}
