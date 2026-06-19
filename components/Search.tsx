"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SearchEntry = {
    title: string;
    url: string;
    type: string;
    tags: string[];
    summary: string;
};

const typeLabel: Record<string, string> = {
    post:     "BLOG",
    project:  "PROJECT",
    note:     "NOTE",
    resource: "RESOURCE",
};

const typeColor: Record<string, string> = {
    post:     "var(--secondary-container)",
    project:  "var(--primary-container)",
    note:     "#4ade80",
    resource: "#facc15",
};

interface SearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
    const [query,   setQuery]   = useState("");
    const [fuse,    setFuse]    = useState<Fuse<SearchEntry> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(false);

    const inputRef   = useRef<HTMLInputElement>(null);
    const onCloseRef = useRef(onClose);
    const router     = useRouter();

    // Keep ref current so the keyboard effect never needs onClose in its dep array
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    // Fetch search index once on mount
    useEffect(() => {
        fetch("/search-index.json")
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: SearchEntry[]) => {
                setFuse(new Fuse(data, { keys: ["title", "summary", "tags"], threshold: 0.3 }));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setError(true);
            });
    }, []);

    // Derive results synchronously — no effect needed since this is pure computation
    const results = useMemo(
        () => (fuse && query.trim() ? fuse.search(query).slice(0, 8).map((r) => r.item) : []),
        [fuse, query],
    );

    // Focus input and reset query when modal opens
    useEffect(() => {
        if (isOpen) {
            // Defer both focus and reset so no setState fires synchronously in the effect body
            setTimeout(() => {
                inputRef.current?.focus();
                setQuery("");
            }, 50);
        }
    }, [isOpen]);

    // Stable keyboard handler — reads onClose from ref, no re-registration on every render
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCloseRef.current();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handleResultClick = useCallback(() => {
        onCloseRef.current();
        setQuery("");
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="search-backdrop"
                    className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
                    style={{ backdropFilter: "blur(4px)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    {/* Backdrop tint — pointer-events-none so clicks fall through to the
                        overlay div below and trigger onClose correctly */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "rgba(11, 14, 28, 0.85)" }}
                    />

                    {/* Invisible full-area click target for close-on-backdrop-click */}
                    <div
                        className="absolute inset-0"
                        onClick={onClose}
                    />

                    {/* Panel — sits above the click target */}
                    <motion.div
                        className="relative w-full max-w-xl z-10"
                        style={{ border: "1px solid var(--outline-variant)", background: "var(--surface-container)" }}
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,   scale: 1 }}
                        exit={{ opacity: 0, y: -14, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b"
                             style={{ borderColor: "var(--outline-variant)" }}>
                            <span className="font-mono text-xs tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                SEARCH.SYS
                            </span>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.85 }}
                                style={{ color: "var(--on-surface-variant)" }}>
                                <X size={14} />
                            </motion.button>
                        </div>

                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b"
                             style={{ borderColor: "var(--outline-variant)" }}>
                            <span className="font-mono text-xs cursor-blink" style={{ color: "var(--primary)" }}>{">"}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={loading ? "loading index..." : "query..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={loading || error}
                                className="flex-1 bg-transparent outline-none font-mono text-sm disabled:opacity-40"
                                style={{ color: "var(--on-surface)" }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && results.length > 0) {
                                        router.push(results[0].url);
                                        handleResultClick();
                                    }
                                }}
                            />
                            {query && (
                                <motion.button
                                    onClick={() => setQuery("")}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.85 }}
                                    style={{ color: "var(--on-surface-variant)" }}>
                                    <X size={12} />
                                </motion.button>
                            )}
                        </div>

                        {/* Error state */}
                        {error && (
                            <p className="px-4 py-6 font-mono text-xs text-center"
                               style={{ color: "var(--error)" }}>
                                FAILED TO LOAD INDEX
                            </p>
                        )}

                        {/* Loading state */}
                        {loading && !error && (
                            <p className="px-4 py-4 font-mono text-xs text-center"
                               style={{ color: "var(--on-surface-variant)" }}>
                                {">"} LOADING INDEX...
                            </p>
                        )}

                        {/* Results — stagger in */}
                        <AnimatePresence>
                            {results.length > 0 && (
                                <motion.ul
                                    className="max-h-80 overflow-y-auto"
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={{
                                        visible: { opacity: 1 },
                                        hidden:  { opacity: 0 },
                                    }}
                                    transition={{ duration: 0.12 }}
                                >
                                    {results.map((r, i) => (
                                        <motion.li
                                            key={r.url}
                                            className="border-b last:border-b-0"
                                            style={{ borderColor: "var(--outline-variant)" }}
                                            variants={{
                                                hidden:  { opacity: 0, x: -10 },
                                                visible: {
                                                    opacity: 1, x: 0,
                                                    transition: { delay: i * 0.05, duration: 0.18 },
                                                },
                                            }}
                                        >
                                            <Link
                                                href={r.url}
                                                onClick={handleResultClick}
                                                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-container-high)]"
                                            >
                                                <span className="font-mono text-xs px-1.5 py-0.5 flex-shrink-0"
                                                      style={{
                                                          color:  typeColor[r.type] ?? "var(--on-surface-variant)",
                                                          border: `1px solid ${typeColor[r.type] ?? "var(--outline-variant)"}`,
                                                      }}>
                                                    {typeLabel[r.type] ?? r.type.toUpperCase()}
                                                </span>
                                                <span className="font-sans text-sm truncate"
                                                      style={{ color: "var(--on-surface)" }}>
                                                    {r.title}
                                                </span>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>

                        {/* No results */}
                        {!loading && !error && query.trim() && results.length === 0 && (
                            <motion.p
                                className="px-4 py-6 font-mono text-xs text-center"
                                style={{ color: "var(--on-surface-variant)" }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                NO RESULTS FOR &quot;{query}&quot;
                            </motion.p>
                        )}

                        {/* Footer hints */}
                        <div className="px-4 py-2 border-t flex gap-4"
                             style={{ borderColor: "var(--outline-variant)" }}>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>ESC — close</span>
                            <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>↵ — open first</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
